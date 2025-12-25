import React from "react";
import { Participant, OnlineUser } from "./CourseChatDisplay";
import { Socket } from "socket.io-client";

interface ParticipantsModalProps {
  participants: Participant[];
  onlineUsers: OnlineUser[];
  isOpen: boolean;
  onClose: () => void;
  isInstructor: boolean;
  courseId: string;
  socket: Socket; // Properly typed Socket.IO client instance
}

const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  participants,
  onlineUsers,
  isOpen,
  onClose,
  isInstructor,
  courseId,
  socket,
}) => {
  const getInitials = (name: string): string => {
    return name
      .trim()
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word[0].toUpperCase())
      .join("")
      .slice(0, 2); // Limit to 2 initials for consistency
  };

  const handleBlock = (userId: string) => {
    socket.emit("blockFromChat", { courseId, userId });
  };

  const handleUnblock = (userId: string) => {
    socket.emit("unblockFromChat", { courseId, userId });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">All Participants</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
            title="Close"
            aria-label="Close participants modal"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {participants.length > 0 ? (
          <ul className="space-y-3">
            {participants.map((participant) => {
              const isOnline = onlineUsers.some(
                (user) => user.userId === participant.userId
              );

              return (
                <li
                  key={participant.userId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
                      participant.role === "instructor"
                        ? "bg-blue-200"
                        : "bg-gray-200"
                    }`}
                  >
                    {participant.profilePic ? (
                      <img
                        src={participant.profilePic}
                        alt={participant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          participant.role === "instructor"
                            ? "text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        {getInitials(participant.name)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {participant.name}
                      {participant.role === "instructor" && " (Instructor)"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isOnline ? "Online" : "Offline"}
                      {participant.isChatBlocked && " • Blocked"}
                    </p>
                  </div>

                  {isInstructor && participant.role === "student" && (
                    <div className="flex gap-2">
                      {participant.isChatBlocked ? (
                        <button
                          onClick={() => handleUnblock(participant.userId)}
                          className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          title="Unblock user from chat"
                        >
                          Add
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(participant.userId)}
                          className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Block user from chat"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No participants found for this course.
          </p>
        )}
      </div>
    </div>
  );
};

export default ParticipantsModal;