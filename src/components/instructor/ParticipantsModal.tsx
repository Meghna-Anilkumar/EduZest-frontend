import React from "react";
import { Participant, OnlineUser } from "./CourseChatDisplay";

interface ParticipantsModalProps {
  participants: Participant[];
  onlineUsers: OnlineUser[];
  isOpen: boolean;
  onClose: () => void;
  isInstructor: boolean; 
  courseId: string;
  socket: any; 
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
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
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
            className="text-gray-500 hover:text-red-500"
            title="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className={`h-8 w-8 rounded-full ${
                      participant.role === "instructor"
                        ? "bg-blue-200"
                        : "bg-gray-200"
                    } flex items-center justify-center overflow-hidden`}
                  >
                    {participant.profilePic ? (
                      <img
                        src={participant.profilePic}
                        alt={participant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className={`${
                          participant.role === "instructor"
                            ? "text-blue-700"
                            : "text-gray-700"
                        } text-sm font-semibold`}
                      >
                        {getInitials(participant.name)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {participant.name}
                      {participant.role === "instructor" && " (Instructor)"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isOnline ? "Online" : "Offline"}
                      {participant.isChatBlocked && " (Blocked)"}
                    </p>
                  </div>
                  {isInstructor && participant.role === "student" && (
                    <div className="flex gap-2">
                      {participant.isChatBlocked ? (
                        <button
                          onClick={() => handleUnblock(participant.userId)}
                          className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          title="Unblock from chat"
                        >
                          Add
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(participant.userId)}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Block from chat"
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
          <p className="text-sm text-gray-500">
            No participants found for this course.
          </p>
        )}
      </div>
    </div>
  );
};

export default ParticipantsModal;