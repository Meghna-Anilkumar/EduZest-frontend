import React, { useState, useEffect, lazy, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getAllRequestedUsersAction } from "../../redux/actions/adminActions";
import Pagination from "../../components/common/admin/Pagination";
import { RiMenuLine } from "react-icons/ri";

const Sidebar = lazy(() => import("../../components/common/admin/AdminSidebar"));

const Requests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [requestedUsers, setRequestedUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const usersPerPage = 10;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchRequestedUsers = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dispatch(
        getAllRequestedUsersAction({ page, limit: usersPerPage })
      ).unwrap();
      setRequestedUsers(response?.data?.users || []);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch requested users");
    } finally {
      setLoading(false);
    }
  }, [dispatch, usersPerPage]);

  useEffect(() => {
    fetchRequestedUsers(currentPage);
  }, [fetchRequestedUsers, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-100">
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

      <div className={`
        fixed lg:static
        inset-y-0 left-0
        transform ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        z-50 lg:z-0
      `}>
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0 overflow-auto p-4 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-10">Requests</h1>

        {loading && <p className="text-center text-lg font-semibold">Loading requests...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requestedUsers.length > 0 ? (
            requestedUsers.map((user, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-6">
                <img
                  src={user.profile?.profilePic || "default-avatar.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto"
                />
                <h2 className="text-lg font-semibold text-center mt-4">{user.name}</h2>
                <p className="text-gray-600 text-center">{user.qualification}</p>
                <p className="text-gray-600 text-center">{user.email}</p>
                <p className="text-gray-500 text-sm mt-2">{user.aboutMe}</p>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
                >
                  View CV
                </button>
              </div>
            ))
          ) : (
            <p className="text-center col-span-3">No requested users found</p>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default Requests;