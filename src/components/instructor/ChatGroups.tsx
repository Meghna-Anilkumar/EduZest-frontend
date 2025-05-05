import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { getAllCoursesByInstructorAction } from '../../redux/actions/courseActions';
import CourseChatDisplay from './CourseChatDisplay';

const InstructorChatGroups: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.userData);
  const { data: courses } = useSelector((state: RootState) => state.course);
  const loading = useSelector((state: RootState) => state.course.loading);
  const error = useSelector((state: RootState) => state.course.error);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (userData?._id) {
      console.log('[InstructorChatGroups] Fetching courses for instructor:', userData._id);
      dispatch(getAllCoursesByInstructorAction({ page: 1, limit: 100 }));
    }
  }, [dispatch, userData?._id]);

  const handleCourseClick = (courseId: string) => {
    console.log('[InstructorChatGroups] Course clicked:', courseId);
    setSelectedCourseId(courseId);
  };

  return (
    <div className="flex h-full">
      {/* Left Side: Chat Groups (Courses) */}
      <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 p-6 border-b border-gray-200">Chat Groups</h2>
        {loading && <p className="p-6 text-gray-500 text-sm">Loading...</p>}
        {error && <p className="p-6 text-red-500 text-sm">{error}</p>}
        {!loading && !error && courses.length === 0 && (
          <p className="p-6 text-gray-500 text-sm">No courses found.</p>
        )}
        <ul className="py-2">
          {courses.map((course) => (
            <li
              key={course._id}
              onClick={() => handleCourseClick(course._id)}
              className={`mx-4 my-2 p-4 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
                ${selectedCourseId === course._id ? 'bg-white shadow-md border-l-4 border-[#49BBBD]' : 'bg-white shadow-sm'}
                hover:shadow-md hover:bg-gray-50 hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#49BBBD] to-[#3aa9ab] flex items-center justify-center text-white font-bold text-lg">
                  {course.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-base">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Course Chat</p>
                </div>
                {selectedCourseId === course._id && (
                  <div className="h-6 w-6 rounded-full bg-[#49BBBD] flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Side: Course Chat Display */}
      <div className="flex-1">
        {selectedCourseId ? (
          <CourseChatDisplay courseId={selectedCourseId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a course to view its chat
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorChatGroups;