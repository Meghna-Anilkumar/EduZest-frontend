import React, { useState, useEffect, useCallback, lazy } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import {
  getAllInstructorsAction,
  blockUnblockUserAction,
} from "../../redux/actions/adminActions";
import Pagination from "../common/admin/Pagination";
import { RiMenuLine } from "react-icons/ri";

interface Instructor {
  _id: string;
  name: string;
  email: string;
  status: string;
  isBlocked: boolean;
}

const Sidebar = lazy(() => import("../../components/common/admin/AdminSidebar"));

export const AdminInstructors: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const instructorsPerPage = 10;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchInstructors = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await dispatch(
          getAllInstructorsAction({
            page: page,
            limit: instructorsPerPage,
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

  const handleBlockUnblock = async (userId: string, isBlocked: boolean) => {
    try {
      const response = await dispatch(
        blockUnblockUserAction({ userId, isBlocked })
      ).unwrap();
      console.log("Instructor block/unblock status updated:", response);

      // Update local state instead of refetching
      setInstructors((prevInstructors) =>
        prevInstructors.map((instructor) =>
          instructor._id === userId
            ? { ...instructor, isBlocked: !isBlocked } // Toggle the isBlocked status
            : instructor
        )
      );
    } catch (error) {
      console.error("Failed to update instructor status:", error);
      // Refetch on error to ensure data consistency
      fetchInstructors(currentPage);
    }
  };

  useEffect(() => {
    fetchInstructors(currentPage);
  }, [fetchInstructors, currentPage]);

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
            <h1 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-10 pl-12 lg:pl-0">
              Instructors
            </h1>

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
                              handleBlockUnblock(
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">
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
    </div>
  );
};

export default AdminInstructors;