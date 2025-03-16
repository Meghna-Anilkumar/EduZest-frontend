import React from "react";
import { IUserdata } from "../../interface/user/IUserData";

interface StudentModalProps {
  student: IUserdata | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ student, isOpen, onClose }) => {
  if (!isOpen || !student) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Student Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              {student.profile?.profilePic ? (
                <img
                  src={student.profile.profilePic}
                  alt={student.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">{student.name.charAt(0)}</span>
                </div>
              )}
              <div className="mt-2 md:mt-0 md:ml-4">
                <h3 className="text-lg font-semibold">{student.name}</h3>
                <p className="text-gray-600">{student.email}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${student.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} mt-1`}>
                  {student.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p>{student.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <p>{student.profile?.gender || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date of Birth:</span>
                  <p>{student.profile?.dob ? new Date(student.profile.dob).toLocaleDateString() : 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Address:</span>
                  <p>{student.profile?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-gray-500">Additional Email:</span>
                  <p>{student.studentDetails?.additionalEmail || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Enrolled Courses:</span>
                  <p>{student.studentDetails?.enrolledCourses?.length || 0}</p>
                </div>
              </div>
              {student.studentDetails?.enrolledCourses && student.studentDetails.enrolledCourses.length > 0 && (
                <div className="mt-2">
                  <span className="text-gray-500">Course Details:</span>
                  <ul className="list-disc list-inside text-gray-700">
                    {student.studentDetails.enrolledCourses.map((course, index) => (
                      <li key={index}>
                        Course ID: {course.courseId} (Progress: {course.progress}%, Rating: {course.rating || 'N/A'})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {(student.socialMedia?.linkedin || student.socialMedia?.github) && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Social Media</h4>
                <div className="flex space-x-4">
                  {student.socialMedia?.linkedin && (
                    <a href={student.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {student.socialMedia?.github && (
                    <a href={student.socialMedia.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:underline flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}

            {student.aboutMe && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-gray-700">{student.aboutMe}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                {/* <div>
                  <span className="text-gray-500">Account Type:</span>
                  <p>{student.isGoogleAuth ? 'Google Account' : 'Email Account'}</p>
                </div> */}
                <div>
                  <span className="text-gray-500">Joined:</span>
                  <p>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <p>{student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email Verified:</span>
                  <p>{student.isVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};