import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../../components/common/admin/AdminSidebar";
import TableComponent from "../common/TableComponent";
import Pagination from "../common/Pagination";
import { SearchBar } from "../common/SearchBar";
import { getAdminPayoutsAction } from "../../redux/actions/adminActions";
import { AppDispatch, RootState } from "../../redux/store";

interface Transaction {
  transactionId: string;
  date: string;
  course: string;
  studentName: string;
  amount: string;
}

const AdminTransactionsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("transactions");
  const [paginationPage, setPaginationPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageSale, setAverageSale] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const adminId = useSelector(
    (state: RootState) => state.admin?.userData?._id || ""
  );

  useEffect(() => {
    if (!adminId) {
      setError("Admin not authenticated. Please log in.");
      navigate("/login");
    }
  }, [adminId, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (!adminId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await dispatch(
          getAdminPayoutsAction({
            page: paginationPage,
            limit,
            search: searchTerm || undefined,
            sortField,
            sortOrder,
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
          setTransactions(formattedTransactions);
          setTotalPages(Math.ceil(result.data.total / result.data.limit) || 1);
          setTotalEntries(result.data.total);

          const total = result.data.data.reduce(
            (sum: number, payout: any) =>
              sum + (parseFloat(payout.amount) || 0),
            0
          );
          const count = result.data.data.length;
          const avgSale = count > 0 ? total / count : 0;

          setTotalRevenue(total);
          setAverageSale(avgSale);
        } else {
          setError(result?.message || "Failed to fetch transactions");
        }
      } catch (err: any) {
        console.error("Error fetching payouts:", err);
        setError(err.message || "Failed to fetch admin payouts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    paginationPage,
    searchTerm,
    sortField,
    sortOrder,
    adminId,
    dispatch,
    limit,
  ]);

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
  }));

  if (!adminId) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        {...({
          open: sidebarOpen,
          currentPage,
          onToggleSidebar: toggleSidebar,
          setCurrentPage,
        } as any)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-0" : "ml-0"
        } bg-gray-50`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              Admin Transactions
            </h1>
            <div className="w-64">
              <SearchBar
                {...({
                  onSearchChange: handleSearchChange,
                  placeholder: "Search...",
                } as any)}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600">Total Revenue</div>
                <div className="text-2xl font-bold text-blue-800">
                  ₹{totalRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  Calculated from transactions
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-sm text-green-600">Transactions</div>
                <div className="text-2xl font-bold text-green-800">
                  {transactions.length}
                </div>
                <div className="text-xs text-green-500 mt-1">Current page</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Average Sale</div>
                <div className="text-2xl font-bold text-purple-800">
                  ₹{averageSale.toFixed(2)}
                </div>
                <div className="text-xs text-purple-500 mt-1">
                  Per transaction
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-700">
                Recent Transactions
              </h2>
            </div>
            {loading ? (
              <div className="text-center py-4 text-gray-600">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <TableComponent
                    {...({
                      headers: headerStrings,
                      data: transactionData,
                      onSort: handleSort,
                      sortField,
                      sortOrder,
                    } as any)}
                  />
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-gray-500 text-sm">
                    {transactions.length > 0 ? (
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

export default AdminTransactionsPage;
