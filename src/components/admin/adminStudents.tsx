import React, { useState, useEffect, useCallback, lazy } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  getAllStudentsAction,
  blockUnblockUserAction,
} from "../../redux/actions/adminActions";
import Pagination from "../common/Pagination";
import { RiMenuLine } from "react-icons/ri";
import { SearchBar } from "../common/SearchBar";
import { StudentModal } from "./StudentView";
import { IUserdata } from "../../interface/IUserData";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const Sidebar = lazy(() => import("../common/admin/AdminSidebar"));

interface Student extends IUserdata {
  _id: string;
  name: string;
  email: string;
  status: string;
  isBlocked: boolean;
}

export const AdminStudents: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const studentsPerPage = 10;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [studentToToggle, setStudentToToggle] = useState<{
    id: string;
    isBlocked: boolean;
  } | null>(null);

  const fetchStudents = useCallback(
    async (page: number, search: string = "") => {
      console.log("Fetching students with:", { page, limit: studentsPerPage, search });
      setLoading(true);
      setError(null);
      try {
        const response = await dispatch(
          getAllStudentsAction({
            page,
            limit: studentsPerPage,
            search: search || undefined,
          })
        ).unwrap();
        console.log("Fetch students response:", response);
        setStudents(response?.data?.students || []);
        setTotalPages(response?.data?.totalPages || 1);
      } catch (error: any) {
        console.error("Fetch students error:", error);
        setError(error.response?.data?.message || "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    },
    [dispatch, studentsPerPage]
  );

  const handleBlockUnblockClick = (userId: string, isBlocked: boolean) => {
    setStudentToToggle({ id: userId, isBlocked });
    setConfirmDialogOpen(true);
  };

  const handleConfirmBlockUnblock = async () => {
    if (!studentToToggle) return;
    try {
      const response = await dispatch(
        blockUnblockUserAction({
          userId: studentToToggle.id,
          isBlocked: studentToToggle.isBlocked,
        })
      ).unwrap();
      console.log("User block/unblock status updated:", response);
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === studentToToggle.id
            ? { ...student, isBlocked: !studentToToggle.isBlocked }
            : student
        )
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
      fetchStudents(currentPage, searchTerm);
    }
    setConfirmDialogOpen(false);
    setStudentToToggle(null);
  };

  const handleCancelBlockUnblock = () => {
    setConfirmDialogOpen(false);
    setStudentToToggle(null);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchStudents(currentPage, searchTerm);
  }, [fetchStudents, currentPage, searchTerm]);

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
            <div className="flex flex-col lg:flex-row justify-between items-center mb-6 lg:mb-10">
              <h1 className="text-2xl lg:text-3xl font-bold pl-12 lg:pl-0">
                Students
              </h1>
              <div className="w-full lg:w-64 mt-4 lg:mt-0">
                <SearchBar onSearchChange={handleSearchChange} />
              </div>
            </div>

            {loading && (
              <p className="text-center text-lg font-semibold">
                Loading students...
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
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <tr
                        key={student._id}
                        className="bg-white border-b hover:bg-gray-100"
                      >
                        <th
                          scope="row"
                          className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {(currentPage - 1) * studentsPerPage + index + 1}
                        </th>
                        <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {student.name}
                        </td>
                        <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {student.email}
                        </td>
                        <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleBlockUnblockClick(student._id, student.isBlocked ?? false)
                            }
                            className={`px-3 py-1 rounded-md text-sm font-medium text-white ${
                              student.isBlocked
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            {student.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                        <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View Details"
                          >
                            👁️ {/* Unicode eye symbol */}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        No students found
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

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
      />

      {/* Confirmation Dialog for Blocking/Unblocking */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelBlockUnblock}
        aria-labelledby="confirm-block-unblock-dialog-title"
        aria-describedby="confirm-block-unblock-dialog-description"
      >
        <DialogTitle id="confirm-block-unblock-dialog-title">
          {studentToToggle?.isBlocked ? "Unblock Student" : "Block Student"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-block-unblock-dialog-description">
            Are you sure you want to{" "}
            {studentToToggle?.isBlocked ? "unblock" : "block"} this student?{" "}
            {studentToToggle?.isBlocked
              ? "Unblocking this student will restore their access to the platform."
              : "Blocking this student will prevent them from accessing the platform."}
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

export default AdminStudents;