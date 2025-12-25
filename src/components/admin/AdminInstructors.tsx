import React, { useState, useEffect, useCallback, lazy } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  getAllInstructorsAction,
  blockUnblockUserAction,
  AdminUser,
} from "../../redux/actions/adminActions";
import Pagination from "../common/Pagination";
import { RiMenuLine } from "react-icons/ri";
import { SearchBar } from "../common/SearchBar";
import { InstructorModal } from "./InstructorView";
import { IUserdata } from "../../interface/IUserData";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const Sidebar = lazy(() => import("../../components/common/admin/AdminSidebar"));

export const AdminInstructors: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [instructors, setInstructors] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const instructorsPerPage = 10;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<AdminUser | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [instructorToToggle, setInstructorToToggle] = useState<{
    id: string;
    isBlocked: boolean;
  } | null>(null);

  const fetchInstructors = useCallback(
    async (page: number, search: string = "") => {
      console.log("Fetching instructors with:", { page, limit: instructorsPerPage, search });
      setLoading(true);
      setError(null);
      try {
        const response = await dispatch(
          getAllInstructorsAction({
            page,
            limit: instructorsPerPage,
            search: search || undefined,
          })
        ).unwrap();
        setInstructors(response?.data?.instructors || []);
        setTotalPages(response?.data?.totalPages || 1);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to fetch instructors");
      } finally {
        setLoading(false);
      }
    },
    [dispatch, instructorsPerPage]
  );

  const handleBlockUnblockClick = (userId: string, isBlocked: boolean) => {
    setInstructorToToggle({ id: userId, isBlocked });
    setConfirmDialogOpen(true);
  };

  const handleConfirmBlockUnblock = async () => {
    if (!instructorToToggle) return;
    try {
      const response = await dispatch(
        blockUnblockUserAction({
          userId: instructorToToggle.id,
          isBlocked: instructorToToggle.isBlocked,
        })
      ).unwrap();
      console.log("Instructor block/unblock status updated:", response);
      setInstructors((prevInstructors) =>
        prevInstructors.map((instructor) =>
          instructor._id === instructorToToggle.id
            ? { ...instructor, isBlocked: !instructorToToggle.isBlocked }
            : instructor
        )
      );
    } catch (error) {
      console.error("Failed to update instructor status:", error);
      fetchInstructors(currentPage, searchTerm);
    }
    setConfirmDialogOpen(false);
    setInstructorToToggle(null);
  };

  const handleCancelBlockUnblock = () => {
    setConfirmDialogOpen(false);
    setInstructorToToggle(null);
  };

  const handleViewDetails = (instructor: AdminUser) => {
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchInstructors(currentPage, searchTerm);
  }, [fetchInstructors, currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    console.log("Search term changed to:", newSearchTerm);
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
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

      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 lg:p-8">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-10">
              <h1 className="text-2xl lg:text-3xl font-bold pl-12 lg:pl-0">
                Instructors
              </h1>
              <div className="mt-4 lg:mt-0 lg:w-1/3">
                <SearchBar onSearchChange={handleSearchChange} />
              </div>
            </div>

            {loading && (
              <p className="text-center text-lg font-semibold">
                Loading instructors...
              </p>
            )}
            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-300">
                  <tr className="text-center">
                    <th scope="col" className="px-4 lg:px-6 py-3">
                      Sl.No
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3">
                      Email
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {instructors.length > 0 ? (
                    instructors.map((instructor, index) => (
                      <tr
                        key={instructor._id}
                        className="bg-white border-b hover:bg-gray-100"
                      >
                        <th
                          scope="row"
                          className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {(currentPage - 1) * instructorsPerPage + index + 1}
                        </th>
                        <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {instructor.name}
                        </td>
                        <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {instructor.email}
                        </td>
                        <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleBlockUnblockClick(
                                instructor._id,
                                instructor.isBlocked ?? false
                              )
                            }
                            className={`px-3 py-1 rounded-md text-sm font-medium text-white ${
                              instructor.isBlocked
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            {instructor.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                        <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(instructor)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View Details"
                          >
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        No instructors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>

      <InstructorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        instructor={selectedInstructor as IUserdata}
      />

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelBlockUnblock}
        aria-labelledby="confirm-block-unblock-dialog-title"
        aria-describedby="confirm-block-unblock-dialog-description"
      >
        <DialogTitle id="confirm-block-unblock-dialog-title">
          {instructorToToggle?.isBlocked ? "Unblock Instructor" : "Block Instructor"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-block-unblock-dialog-description">
            Are you sure you want to{" "}
            {instructorToToggle?.isBlocked ? "unblock" : "block"} this instructor?{" "}
            {instructorToToggle?.isBlocked
              ? "Unblocking this instructor will restore their access to the platform."
              : "Blocking this instructor will prevent them from accessing the platform and may affect their courses."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelBlockUnblock} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmBlockUnblock} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminInstructors;