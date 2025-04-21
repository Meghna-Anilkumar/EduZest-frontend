import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./InstructorSidebar";
import TableComponent from "../common/TableComponent";
import Pagination from "../common/Pagination";
import { SearchBar } from "../common/SearchBar";
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const instructorId = useSelector((state: RootState) => state.user.userData?._id || "");

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
          search: searchTerm || undefined,
          sortField,
          sortOrder,
        })
      ).unwrap();

      // Validate API response
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
          amount: payout.amount ? `$${parseFloat(payout.amount).toFixed(2)}` : "N/A",
        }));
        setTransactions(formattedTransactions);
        setTotalPages(Math.ceil(result.data.total / result.data.limit) || 1);
      } else {
        setError(result?.message || "Failed to fetch transactions");
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
  }, [paginationPage, searchTerm, sortField, sortOrder, instructorId]);

  const handlePageChange = (page: number) => {
    setPaginationPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
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

  const handleSort = (headerLabel: string) => {
    const header = tableHeaders.find((h) => h.label === headerLabel);
    if (header) {
      const field = header.field;
      if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
      setPaginationPage(1);
    }
  };

  const transactionData = transactions.map((transaction) => ({
    "Transaction ID": transaction.transactionId,
    Date: transaction.date,
    Course: transaction.course,
    "Student Name": transaction.studentName,
    Amount: transaction.amount,
    Invoice: (
      <button className="text-blue-600 hover:text-blue-800 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
        Download
      </button>
    ),
  }));

  const handleAction = (row: { [key: string]: string | number | React.ReactNode }) => {
    return row["Invoice"];
  };

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
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Transactions</h1>
            <div className="w-64">
              <SearchBar onSearchChange={handleSearchChange} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600">Total Revenue</div>
                <div className="text-2xl font-bold text-blue-800">$10,245.30</div>
                <div className="text-xs text-blue-500 mt-1">+12.5% from last month</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-sm text-green-600">Transactions</div>
                <div className="text-2xl font-bold text-green-800">{transactions.length}</div>
                <div className="text-xs text-green-500 mt-1">+8.2% from last month</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Average Sale</div>
                <div className="text-2xl font-bold text-purple-800">$72.15</div>
                <div className="text-xs text-purple-500 mt-1">+3.7% from last month</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="text-sm text-orange-600">Refund Rate</div>
                <div className="text-2xl font-bold text-orange-800">1.2%</div>
                <div className="text-xs text-orange-500 mt-1">-0.3% from last month</div>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-700">Recent Transactions</h2>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Filter by:</span>
                <select
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#49BBBD]"
                  onChange={(e) => {
                    console.log("Filter by:", e.target.value);
                  }}
                >
                  <option>All Time</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : (
              <>
                <div className="mb-2">
                  {headerStrings.map((header) => (
                    <button
                      key={header}
                      onClick={() => handleSort(header)}
                      className="mr-4 text-sm text-gray-700 hover:text-blue-600"
                    >
                      {header}
                      {sortField === tableHeaders.find((h) => h.label === header)?.field && (
                        <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  ))}
                </div>
                <TableComponent
                  headers={headerStrings}
                  data={transactionData}
                  actions={handleAction}
                />
                <div className="mt-4">
                  <div className="text-gray-500 text-sm mb-2">
                    {transactions.length > 0 ? (
                      <>
                        Showing {(paginationPage - 1) * limit + 1} to{" "}
                        {Math.min(paginationPage * limit, transactions.length)} of{" "}
                        {transactions.length} entries
                      </>
                    ) : (
                      "No transactions found"
                    )}
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={paginationPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
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