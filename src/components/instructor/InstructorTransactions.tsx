import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./InstructorSidebar";
import TableComponent from "../common/TableComponent";
import Pagination from "../common/Pagination";
import { getInstructorPayoutsAction } from "../../redux/actions/userActions";
import { AppDispatch, RootState } from "../../redux/store";

interface Transaction {
  transactionId: string;
  date: string;
  course: string;
  studentName: string;
  amount: string;
}

const TransactionsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("transactions");
  const [paginationPage, setPaginationPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [uniqueCourses, setUniqueCourses] = useState<string[]>([]);
  const limit = 10;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const instructorId = useSelector(
    (state: RootState) => state.user.userData?._id || ""
  );

  useEffect(() => {
    if (!instructorId) {
      setError("Instructor not authenticated. Please log in.");
      navigate("/login");
    }
  }, [instructorId, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchPayouts = async () => {
    if (!instructorId) {
      setError("Instructor not authenticated");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(
        getInstructorPayoutsAction({
          instructorId,
          page: paginationPage,
          limit,
          sortField: "date", // Hardcode to date
          sortOrder,
          courseFilter,
        })
      ).unwrap();

      if (result && result.success && result.data) {
        if (!Array.isArray(result.data.data)) {
          throw new Error("Invalid API response: data.data is not an array");
        }
        const formattedTransactions = result.data.data.map((payout: any) => ({
          transactionId: payout.transactionId || "N/A",
          date: payout.date
            ? new Date(payout.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
          course: payout.course || "N/A",
          studentName: payout.studentName || "N/A",
          amount: payout.amount
            ? `₹${parseFloat(payout.amount).toFixed(2)}`
            : "N/A",
        }));
        console.log("Formatted transactions:", formattedTransactions); // Debug log
        setTransactions(formattedTransactions);
        setTotalPages(Math.ceil(result.data.total / result.data.limit) || 1);

        // Extract unique course names and explicitly cast to string[]
        const uniqueCourseNames = Array.from(
          new Set(
            formattedTransactions
              .map((t) => t.course)
              .filter((c) => c !== "N/A")
          )
        ) as string[];
        setUniqueCourses(uniqueCourseNames);
      } else {
        setError(
          result?.message || "No transactions found for the selected filters"
        );
      }
    } catch (err: any) {
      console.error("Error fetching payouts:", err);
      setError(err.message || "Failed to fetch instructor payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instructorId) {
      fetchPayouts();
    }
  }, [paginationPage, sortOrder, instructorId, courseFilter]);

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
    setSortOrder("desc"); // Reset to default
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

  if (!instructorId) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        currentPage={currentPage}
        onToggleSidebar={toggleSidebar}
        setCurrentPage={setCurrentPage}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Transactions
            </h1>
          </div>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600">Total Revenue</div>
                <div className="text-2xl font-bold text-blue-800">
                  ₹{totalRevenue}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-sm text-green-600">Transactions</div>
                <div className="text-2xl font-bold text-green-800">
                  {transactions.length}
                </div>
              </div>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              {/* Course Filter */}
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
                  className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order (Date Only) */}
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
                  className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Recent Transactions
            </h2>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-4 text-gray-600">
                No transactions found for the selected course filter.
              </div>
            ) : (
              <>
                <TableComponent
                  headers={headerStrings}
                  data={transactionData}
                />
                <div className="mt-4">
                  <div className="text-gray-500 text-sm mb-2">
                    {transactions.length > 0 ? (
                      <>
                        Showing {(paginationPage - 1) * limit + 1} to{" "}
                        {Math.min(paginationPage * limit, transactions.length)}{" "}
                        of {transactions.length} entries
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