import React, { useState, useEffect, lazy, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { 
  getAllRequestedUsersAction, 
  approveInstructorAction,
  rejectInstructorAction 
} from "../../redux/actions/adminActions";
import Pagination from "../../components/common/admin/Pagination";
import { RiMenuLine, RiDownloadLine, RiUserLine, RiCheckLine, RiCloseLine } from "react-icons/ri";

const Sidebar = lazy(() => import("../../components/common/admin/AdminSidebar"));

const Requests: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [requestedUsers, setRequestedUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const usersPerPage = 9;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequestedUsers = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dispatch(
        getAllRequestedUsersAction({ page, limit: usersPerPage })
      ).unwrap();
      setRequestedUsers(response.data.requestedUsers || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch requested users");
      console.error("Error details:", error);
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

  const handleApproveClick = (user: any) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const handleRejectClick = (user: any) => {
    setSelectedUser(user);
    setIsRejectModalOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedUser) return;

    setIsConfirmModalOpen(false);
    setActionLoading(true);
    try {
      await dispatch(approveInstructorAction({ userId: selectedUser._id })).unwrap();
      // Update local state instead of refetching
      setRequestedUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id ? { ...user, isApproved: true } : user
        ).filter((user) => !user.isApproved) // Remove approved users from the list
      );
      setSelectedUser({ ...selectedUser, isApproved: true });
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to approve instructor");
      console.error("Approval failed:", error);
      // Refetch only on error to ensure consistency
      await fetchRequestedUsers(currentPage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedUser) return;

    setIsRejectModalOpen(false);
    setActionLoading(true);
    try {
      await dispatch(rejectInstructorAction({ userId: selectedUser._id })).unwrap();
      // Update local state instead of refetching
      setRequestedUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id ? { ...user, isApproved: false } : user
        ).filter((user) => !user.isApproved) // Remove rejected users from the list (assuming rejection removes them)
      );
      setSelectedUser({ ...selectedUser, isApproved: false });
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to reject instructor");
      console.error("Rejection failed:", error);
      // Refetch only on error to ensure consistency
      await fetchRequestedUsers(currentPage);
    } finally {
      setActionLoading(false);
    }
  };

  const closeAllModals = () => {
    setIsConfirmModalOpen(false);
    setIsRejectModalOpen(false);
    setIsSuccessModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-indigo-600 text-white p-2 rounded-md shadow-lg hover:bg-indigo-700 transition-colors"
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

      <div
        className={`
          fixed lg:static
          inset-y-0 left-0
          transform ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          z-50 lg:z-0
        `}
      >
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0 overflow-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-gray-800 border-b border-gray-200 pb-4">
            Instructor Requests
          </h1>

          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requestedUsers && requestedUsers.length > 0 ? (
              requestedUsers.map((user) => (
                <div 
                  key={user._id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="relative mb-6">
                      {user.profile?.profilePic ? (
                        <img
                          src={user.profile.profilePic}
                          alt={`${user.name}'s profile`}
                          className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-indigo-50"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto bg-indigo-50 flex items-center justify-center">
                          <RiUserLine className="w-12 h-12 text-indigo-300" />
                        </div>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
                      {user.name}
                    </h2>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-indigo-600 text-center font-medium">
                        {user.qualification || "No qualification specified"}
                      </p>
                      <p className="text-gray-500 text-center text-sm">
                        {user.email}
                      </p>
                      <div className="h-12">
                        <p className="text-gray-600 text-sm text-center line-clamp-2">
                          {user.aboutMe || "No description available"}
                        </p>
                      </div>
                    </div>

                    {user.cv && (
                      <div className="mt-6 mb-4">
                        <a
                          href={user.cv}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg group"
                        >
                          <RiDownloadLine className="w-5 h-5 group-hover:animate-bounce" />
                          <span>Download CV</span>
                        </a>
                      </div>
                    )}

                    <div className="flex justify-center gap-4">
                      <button 
                        className="flex items-center gap-2 px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleApproveClick(user)}
                        disabled={actionLoading}
                      >
                        <RiCheckLine className="w-5 h-5" /> Approve
                      </button>
                      <button 
                        className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleRejectClick(user)}
                        disabled={actionLoading}
                      >
                        <RiCloseLine className="w-5 h-5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 text-lg">No requested users found</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Approval</h3>
            <p className="text-gray-600">
              Are you sure you want to approve {selectedUser?.name} as an instructor?
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button 
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                onClick={handleConfirmApproval}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Rejection</h3>
            <p className="text-gray-600">
              Are you sure you want to reject {selectedUser?.name}'s instructor request?
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button 
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                onClick={handleConfirmReject}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiCheckLine className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600">
                {selectedUser?.name}'s instructor request has been {selectedUser?.isApproved ? 'approved' : 'rejected'}.
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <button 
                className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={closeAllModals}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;