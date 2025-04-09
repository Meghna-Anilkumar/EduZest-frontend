import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { Menu, X } from "lucide-react";
import TableComponent from "../../components/common/TableComponent";
import Header from "../../components/common/users/Header";
import StudentSidebar from "./StudentSidebar";
import { getPaymentsByUserAction } from "../../redux/actions/enrollmentActions";
import { getAllActiveCoursesAction } from "../../redux/actions/courseActions"; 
import Pagination from "../common/Pagination";
import { SearchBar } from "../common/SearchBar";
import { RootState } from "../../redux/store"; 

const PaymentsHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector((state: RootState) => state.course.activeCourses.courses); 
  const [payments, setPayments] = useState<{ data: any[]; total: number; page: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Payments");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 5;
  const sortField = "createdAt";
  const sortOrder = "desc"; 
  const userId = "some-user-id";
  console.log("Component mounted");

  // Fetch courses on mount
  useEffect(() => {
    dispatch(getAllActiveCoursesAction({ page: 1, limit: 100 }))
      .then(() => console.log("Courses action dispatched"))
      .catch((err) => console.error("Failed to dispatch courses action:", err));
  }, [dispatch]);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await dispatch(
          getPaymentsByUserAction({
            userId,
            page: currentPage,
            limit,
            search: searchTerm,
            sortField,
            sortOrder,
          })
        ).unwrap();
        setPayments(result.data);
        console.log("Payments data received:", result.data); 
      } catch (err: any) {
        setError(err.message || "Failed to fetch payments");
        console.error("Payments fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [dispatch, currentPage, searchTerm, userId, limit, sortField, sortOrder]);

  useEffect(() => {
    console.log("Courses from Redux store:", courses);
  }, [courses]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); 
  };

  const handleDownload = () => (
    <button
      className="text-blue-500 hover:text-blue-700 underline"
      onClick={() => alert("Downloading invoice")}
    >
      Download
    </button>
  );

  const courseMap = courses.reduce((acc, course) => ({
    ...acc,
    [course._id]: course.title, 
  }), {} as { [key: string]: string });

  const transactionHistory =
    payments?.data?.map((p: any, index: number) => {
      const courseName = courseMap[p.courseId] || "Unknown";
      return {
        "Sl. No.": (currentPage - 1) * limit + index + 1,
        Course: courseName,
        Date: new Date(p.createdAt).toLocaleDateString(),
        Amount: `₹${p.amount}`,
        Status: (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              p.status === "completed"
                ? "bg-green-100 text-green-800"
                : p.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
          </span>
        ),
        Download: handleDownload(),
      };
    }) || [];

  const paymentOverview = {
    totalAmountPaid: payments?.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
    totalPayment: payments?.data?.length > 0 ? payments?.data[0].amount : 0,
    pendingPayments: payments?.data?.filter((p) => p.status === "pending").length || 0,
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="md:hidden fixed z-40 bottom-4 right-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-[#49bbbd] text-white p-3 rounded-full shadow-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 bg-white h-full" onClick={(e) => e.stopPropagation()}>
            <StudentSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isMobile={true}
              closeMobileMenu={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-4 md:p-6 pt-24 md:ml-64 mt-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Payment Overview</h1>
            <SearchBar onSearchChange={handleSearchChange} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">Total Amount Paid</h3>
                <p className="text-2xl font-bold text-gray-900">₹{paymentOverview.totalAmountPaid}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">Total Payment</h3>
                <p className="text-2xl font-bold text-gray-900">₹{paymentOverview.totalPayment}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">Pending Payments</h3>
                <p className="text-2xl font-bold text-gray-900">₹{paymentOverview.pendingPayments}</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
          <TableComponent
            headers={["Sl. No.", "Course", "Date", "Amount", "Status", "Download"]}
            data={transactionHistory}
          />
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil((payments?.total || 0) / limit)}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentsHistory;