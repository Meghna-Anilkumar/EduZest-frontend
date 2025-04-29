import React, { useState, useEffect, lazy, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  getAllRequestedUsersAction,
  approveInstructorAction,
  rejectInstructorAction,
} from "../../redux/actions/adminActions";
import Pagination from "../../components/common/Pagination";
import {
  RiMenuLine,
  RiDownloadLine,
  RiUserLine,
  RiCheckLine,
  RiCloseLine,
  RiEyeLine,
} from "react-icons/ri";

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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState<string>("");

  const fetchRequestedUsers = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await dispatch(
          getAllRequestedUsersAction({ page, limit: usersPerPage })
        ).unwrap();
        console.log("Fetched response:", response);
        if (!response.data || typeof response.data.totalPages !== "number") {
          console.warn("Invalid response structure:", response);
          throw new Error("Invalid response structure from server");
        }
        setRequestedUsers(response.data.requestedUsers || []);
        setTotalPages(response.data.totalPages);
        // Adjust current page if it exceeds total pages after fetching
        if (page > response.data.totalPages) {
          setCurrentPage(response.data.totalPages || 1);
        }
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Failed to fetch requested users"
        );
        console.error("Error details:", error);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, usersPerPage]
  );

  useEffect(() => {
    fetchRequestedUsers(currentPage);
  }, [fetchRequestedUsers, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleApproveClick = useCallback((user: any) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  }, []);

  const handleRejectClick = useCallback((user: any) => {
    setSelectedUser(user);
    setRejectionMessage(""); // Reset message when opening modal
    setIsRejectModalOpen(true);
  }, []);

  const handleViewDetailsClick = useCallback((user: any) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  }, []);

  const handleConfirmApproval = useCallback(
    async () => {
      if (!selectedUser) return;
      setActionLoading(true);
      setIsConfirmModalOpen(false);
      try {
        await dispatch(
          approveInstructorAction({ userId: selectedUser._id })
        ).unwrap();
        // Refetch data after successful approval
        await fetchRequestedUsers(currentPage);
        setSelectedUser((prev) => ({ ...prev, isApproved: true }));
        setIsSuccessModalOpen(true);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to approve instructor");
        console.error("Approval failed:", error);
        await fetchRequestedUsers(currentPage); // Still refetch on error to sync
      } finally {
        setActionLoading(false);
      }
    },
    [dispatch, selectedUser, currentPage, fetchRequestedUsers]
  );

  const handleConfirmReject = useCallback(
    async () => {
      if (!selectedUser || !rejectionMessage.trim()) return;
      setActionLoading(true);
      setIsRejectModalOpen(false);
      try {
        await dispatch(
          rejectInstructorAction({
            userId: selectedUser._id,
            message: rejectionMessage, // Pass the rejection message
          })
        ).unwrap();
        // Refetch data after successful rejection
        await fetchRequestedUsers(currentPage);
        setSelectedUser((prev) => ({ ...prev, isApproved: false }));
        setIsSuccessModalOpen(true);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to reject instructor");
        console.error("Rejection failed:", error);
        await fetchRequestedUsers(currentPage); // Still refetch on error to sync
      } finally {
        setActionLoading(false);
      }
    },
    [dispatch, selectedUser, currentPage, fetchRequestedUsers, rejectionMessage]
  );

  const closeAllModals = useCallback(() => {
    setIsConfirmModalOpen(false);
    setIsRejectModalOpen(false);
    setIsSuccessModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedUser(null);
    setRejectionMessage(""); // Reset rejection message
  }, []);

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
            {requestedUsers.length > 0 ? (
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

                    <div className="flex flex-col items-center gap-4">
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all duration-300"
                        onClick={() => handleViewDetailsClick(user)}
                      >
                        <RiEyeLine className="w-5 h-5" /> View Details
                      </button>
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
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 text-lg">No requested users found</p>
              </div>
            )}
          </div>

          {(requestedUsers.length > 0 || totalPages > 0) && (
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Approval
            </h3>
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
                className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirmApproval}
                disabled={actionLoading}
              >
                {actionLoading ? "Approving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal with Message Input */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Rejection
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject {selectedUser?.name}'s instructor request?
            </p>
            <div className="mb-4">
              <label htmlFor="rejectionMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason (required)
              </label>
              <textarea
                id="rejectionMessage"
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Enter the reason for rejection..."
              />
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectionMessage.trim()}
              >
                {actionLoading ? "Rejecting..." : "Confirm"}
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
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Success!
              </h3>
              <p className="text-gray-600">
                {selectedUser?.name}'s instructor request has been{" "}
                {selectedUser?.isApproved ? "approved" : "rejected"}.
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

      {/* Details Modal */}
      {isDetailsModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Instructor Request Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedUser.profile?.profilePic ? (
                  <img
                    src={selectedUser.profile.profilePic}
                    alt={`${selectedUser.name}'s profile`}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                    <RiUserLine className="w-8 h-8 text-indigo-300" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Qualification</p>
                  <p className="text-gray-600">
                    {selectedUser.qualification || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-600">
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                  <p className="text-gray-600">
                    {selectedUser.profile?.dob
                      ? new Date(selectedUser.profile.dob).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Gender</p>
                  <p className="text-gray-600">
                    {selectedUser.profile?.gender || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-gray-600">
                    {selectedUser.profile?.address || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Experience</p>
                  <p className="text-gray-600">
                    {selectedUser.experience || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">About Me</p>
                  <p className="text-gray-600">
                    {selectedUser.aboutMe || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                  <p className="text-gray-600">
                    {selectedUser.socialMedia?.linkedin ? (
                      <a
                        href={selectedUser.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {selectedUser.socialMedia.linkedin}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">GitHub</p>
                  <p className="text-gray-600">
                    {selectedUser.socialMedia?.github ? (
                      <a
                        href={selectedUser.socialMedia.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {selectedUser.socialMedia.github}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">CV</p>
                  <p className="text-gray-600">
                    {selectedUser.cv ? (
                      <a
                        href={selectedUser.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Download CV
                      </a>
                    ) : (
                      "Not uploaded"
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => setIsDetailsModalOpen(false)}
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