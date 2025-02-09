import React, { useState, useEffect, useCallback } from "react";
import Pagination from "../common/admin/Pagination";
import { getAllStudentsAction } from "../../redux/actions/adminActions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";

interface Student {
  _id: string;
  name: string;
  joinedDate: string;
  isVerified: boolean;
  status: string;
}

export const AdminStudents: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const studentsPerPage = 10;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dispatch(getAllStudentsAction({ 
        page: page, 
        limit: studentsPerPage 
      })).unwrap(); //to get the actual payload
      setStudents(response?.data?.students || []);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [dispatch, studentsPerPage]);
  

  useEffect(() => {
    fetchStudents(currentPage);
  }, [fetchStudents, currentPage]);

  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-full mx-auto py-20 px-20">
      <h1 className="text-3xl font-bold ml-10 mb-10">Students</h1>

      {/* Loading & Error Handling */}
      {loading && <p className="text-center text-lg font-semibold">Loading students...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Table */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-300 dark:bg-gray-900 dark:text-gray-400">
            <tr className="text-center">
              <th scope="col" className="px-6 py-3">Si.No</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Joined</th>
              <th scope="col" className="px-6 py-3">Verified</th>
              <th scope="col" className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {students.length > 0 ? (
              students.map((student, index) => (
                <tr
                  key={student._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-center hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {(currentPage - 1) * studentsPerPage + index + 1}
                  </th>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {student.joinedDate}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {student.isVerified ? "✅ Verified" : "❌ Not Verified"}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <button className="btn btn-sm btn-outline btn-error">
                      {student.status === "active" ? "Block" : "Unblock"}
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

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default AdminStudents;
