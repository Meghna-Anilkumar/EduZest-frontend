import React, { useState, useEffect, useCallback, lazy } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  getAllInstructorsAction,
  blockUnblockUserAction,
} from "../../redux/actions/adminActions";
import Pagination from "../common/Pagination";
import { RiMenuLine } from "react-icons/ri";
import { SearchBar } from "../common/SearchBar";
import { InstructorModal } from "./InstructorView";
import { AdminUser } from "../../redux/actions/adminActions"; 
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const Sidebar = lazy(() => import("../../components/common/admin/AdminSidebar"));

const instructorsPerPage = 10;

export const AdminInstructors: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [instructors, setInstructors] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<AdminUser | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [instructorToToggle, setInstructorToToggle] = useState<{
    id: string;
    currentBlocked: boolean;
  } | null>(null);

  const fetchInstructors = useCallback(
    async (page: number, search: string = "") => {
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

        setInstructors(response.data.instructors ?? []);
        setTotalPages(response.data.totalPages ?? 1);
      } catch (err) {
        const message =
          (err as { message?: string }).message || "Failed to fetch instructors";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const handleBlockUnblockClick = (userId: string, isBlocked: boolean) => {
    setInstructorToToggle({ id: userId, currentBlocked: isBlocked });
    setConfirmDialogOpen(true);
  };

  const handleConfirmBlockUnblock = async () => {
    if (!instructorToToggle) return;

    try {
      await dispatch(
        blockUnblockUserAction({
          userId: instructorToToggle.id,
          isBlocked: instructorToToggle.currentBlocked,
        })
      ).unwrap();

      setInstructors((prev) =>
        prev.map((inst) =>
          inst._id === instructorToToggle.id
            ? { ...inst, isBlocked: !instructorToToggle.currentBlocked }
            : inst
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchInstructors(currentPage, searchTerm);
    } finally {
      setConfirmDialogOpen(false);
      setInstructorToToggle(null);
    }
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
  }, [currentPage, searchTerm, fetchInstructors]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 text-white p-2 rounded-md shadow-lg"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        aria-label="Toggle menu"
      >
        <RiMenuLine size={24} />
      </button>

      {/* Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-0
          transform ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0
          transition-transform duration-300 ease-in-out
          w-64 lg:w-auto
        `}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 pl-12 lg:pl-0">
                Instructors
              </h1>
              <div className="mt-4 lg:mt-0 lg:w-96">
                <SearchBar onSearchChange={handleSearchChange} />
              </div>
            </div>

            {loading && (
              <p className="text-center text-lg py-8">Loading instructors...</p>
            )}
            {error && <p className="text-center text-red-600 py-4">{error}</p>}

            {!loading && !error && (
              <>
                <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-200 text-gray-700">
                      <tr className="text-center">
                        <th className="px-6 py-3">Sl.No</th>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructors.length > 0 ? (
                        instructors.map((instructor, index) => (
                          <tr
                            key={instructor._id}
                            className="border-b hover:bg-gray-50 text-center"
                          >
                            <td className="px-6 py-4">
                              {(currentPage - 1) * instructorsPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 font-medium">{instructor.name}</td>
                            <td className="px-6 py-4">{instructor.email}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  handleBlockUnblockClick(instructor._id, instructor.isBlocked)
                                }
                                className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                                  instructor.isBlocked
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-green-500 hover:bg-green-600"
                                }`}
                              >
                                {instructor.isBlocked ? "Unblock" : "Block"}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleViewDetails(instructor)}
                                className="text-blue-600 hover:text-blue-800 text-xl"
                                title="View Details"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            No instructors found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Instructor Details Modal */}
      <InstructorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        instructor={selectedInstructor}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelBlockUnblock}>
        <DialogTitle>
          {instructorToToggle?.currentBlocked ? "Unblock" : "Block"} Instructor
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            <strong>{instructorToToggle?.currentBlocked ? "unblock" : "block"}</strong> this
            instructor?
            <br />
            {instructorToToggle?.currentBlocked
              ? "They will regain access to the platform."
              : "They will lose access and their courses may be affected."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelBlockUnblock}>Cancel</Button>
          <Button onClick={handleConfirmBlockUnblock} color="error" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminInstructors;