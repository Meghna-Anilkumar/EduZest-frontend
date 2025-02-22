import React, { useState, useEffect, useCallback, lazy } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  getAllStudentsAction,
  blockUnblockUserAction,
} from "../../redux/actions/adminActions";
import Pagination from "../common/admin/Pagination";
import { RiMenuLine } from "react-icons/ri";

interface Student {
  _id: string;
  name: string;
  email: string;
  status: string;
  isBlocked: boolean;
}

const Sidebar = lazy(
  () => import("../../components/common/admin/AdminSidebar")
);

export const AdminStudents: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const studentsPerPage = 10;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchStudents = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await dispatch(
          getAllStudentsAction({
            page: page,
            limit: studentsPerPage,
          })
        ).unwrap();
        setStudents(response?.data?.students || []);
        setTotalPages(response?.data?.totalPages || 1);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to fetch students");
      } finally {
        setLoading(false);
      }
    },
    [dispatch, studentsPerPage]
  );

  const handleBlockUnblock = async (userId: string, isBlocked: boolean) => {
    try {
      const response = await dispatch(
        blockUnblockUserAction({ userId, isBlocked })
      ).unwrap();
      console.log("User block/unblock status updated:", response);
      fetchStudents(currentPage);
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage);
  }, [fetchStudents, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 text-white p-2 rounded-md"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <RiMenuLine size={24} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 lg:p-8">
          <div className="max-w-full mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-10 pl-12 lg:pl-0">
              Students
            </h1>

            {/* Loading & Error Handling */}
            {loading && (
              <p className="text-center text-lg font-semibold">
                Loading students...
              </p>
            )}
            {error && <p className="text-center text-red-500">{error}</p>}

            {/* Table */}
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
                              handleBlockUnblock(
                                student._id,
                                student.isBlocked ?? false
                              )
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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
    </div>
  );
};

export default AdminStudents;
