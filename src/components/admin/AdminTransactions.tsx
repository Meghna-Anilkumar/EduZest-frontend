import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import TableComponent from "../common/TableComponent";
import Pagination from "../common/Pagination";
import { getAdminPayoutsAction } from "@/redux/actions/adminActions";
import { AppDispatch } from "../../redux/store";
import { RiMenuLine } from "react-icons/ri";
import Sidebar from "../common/admin/AdminSidebar";
import { AxiosError } from "axios";

interface Transaction {
  transactionId: string;
  date: string;
  course: string;
  studentName: string;
  amount: string;
}

interface AdminPayoutItem {
  transactionId: string;
  date: string;
  course: string;
  studentName: string;
  amount: string;
}

interface AdminPayoutsResponse {
  success: boolean;
  message?: string;
  data: {
    data: AdminPayoutItem[]; 
    total: number;
    limit: number;
    page: number;
  };
}

interface FormattedTransaction {
  transactionId: string;
  date: string;
  course: string;
  studentName: string;
  amount: string;
}

const TransactionsPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [paginationPage, setPaginationPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [uniqueCourses, setUniqueCourses] = useState<string[]>([]);
  const limit = 10;

  const dispatch = useDispatch<AppDispatch>();

  const fetchPayouts = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result: AdminPayoutsResponse = await dispatch(
        getAdminPayoutsAction({
          page: paginationPage,
          limit,
          sortField: "date",
          sortOrder,
          courseFilter,
        })
      ).unwrap();

      if (result.success && result.data?.data) {
        if (!Array.isArray(result.data.data)) {
          throw new Error("Invalid API response: data.data is not an array");
        }

        const formattedTransactions: FormattedTransaction[] =
          result.data.data.map((payout) => ({
            transactionId: payout.transactionId ?? "N/A",
            date: payout.date
              ? new Date(payout.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            course: payout.course ?? "N/A",
            studentName: payout.studentName ?? "N/A",
            amount:
              payout.amount !== undefined
                ? `₹${Number(payout.amount).toFixed(2)}`
                : "N/A",
          }));

        setTransactions(formattedTransactions);
        setTotalPages(Math.ceil(result.data.total / result.data.limit) || 1);
        setTotalEntries(result.data.total);

        const uniqueCourseNames = Array.from(
          new Set(
            formattedTransactions
              .map((t) => t.course)
              .filter((c) => c !== "N/A")
          )
        );

        setUniqueCourses(uniqueCourseNames);
      } else {
        setError(result.message ?? "No transactions found");
      }
    } catch (error: unknown) {
      console.error("Error fetching payouts:", error);

      let errorMessage = "Failed to fetch admin payouts";

      if (error instanceof AxiosError) {
        errorMessage =
          (error.response?.data as { message?: string })?.message ??
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [paginationPage, sortOrder, courseFilter]);

  const handlePageChange = (page: number) => {
    setPaginationPage(page);
  };

  const handleCourseFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCourseFilter(e.target.value);
    setPaginationPage(1);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as "asc" | "desc");
    setPaginationPage(1);
  };

  const resetFilters = () => {
    setCourseFilter("");
    setSortOrder("desc");
    setPaginationPage(1);
  };

  const tableHeaders = [
    { label: "Transaction ID", field: "transactionId" },
    { label: "Date", field: "date" },
    { label: "Course", field: "course" },
    { label: "Student Name", field: "studentName" },
    { label: "Amount", field: "amount" },
  ];

  const headerStrings = tableHeaders.map((header) => header.label);

  const transactionData = transactions.map((transaction) => ({
    "Transaction ID": transaction.transactionId,
    Date: transaction.date,
    Course: transaction.course,
    "Student Name": transaction.studentName,
    Amount: transaction.amount,
  }));

  const totalRevenue = transactions
    .reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount.replace("₹", "")) || 0;
      return sum + amount;
    }, 0)
    .toFixed(2);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 text-white p-2 rounded-md"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <RiMenuLine size={24} />
      </button>

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div
        className={`
          fixed
          inset-y-0 left-0
          transform ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          z-50 lg:z-30
        `}
      >
        <Sidebar />
      </div>

      {/* Main Content with left margin to accommodate fixed sidebar */}
      <div className="flex-1 min-w-0 overflow-auto lg:ml-64">
        <div className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Transactions
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-blue-700">
                  Total Revenue
                </div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  ₹{totalRevenue}
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-green-700">
                  Transactions
                </div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {transactions.length}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="min-w-[150px] max-w-[200px]">
                <label
                  htmlFor="courseFilter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by Course
                </label>
                <select
                  id="courseFilter"
                  value={courseFilter}
                  onChange={handleCourseFilterChange}
                  className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-sm"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[120px] max-w-[150px]">
                <label
                  htmlFor="sortOrder"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sort by Date
                </label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <div className="self-center mt-6">
                <button
                  onClick={resetFilters}
                  className="py-2 px-4 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition text-sm font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Transactions
            </h2>
            {loading ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center text-gray-600">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Loading...
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-6 text-red-600 bg-red-50 rounded-lg p-4">
                {error}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-6 text-gray-600 bg-gray-50 rounded-lg p-4">
                No transactions found for the selected course filter.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
                  <TableComponent
                    headers={headerStrings}
                    data={transactionData}
                  />
                </div>
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-gray-600 text-sm">
                    {totalEntries > 0 ? (
                      <>
                        Showing {(paginationPage - 1) * limit + 1} to{" "}
                        {Math.min(paginationPage * limit, totalEntries)} of{" "}
                        {totalEntries} entries
                      </>
                    ) : (
                      "No transactions found"
                    )}
                  </div>
                  <Pagination
                    currentPage={paginationPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;