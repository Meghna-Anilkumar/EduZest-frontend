import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { getAllCoursesByInstructorAction } from "../../redux/actions/courseActions";
import { getChatGroupMetadataThunk } from "../../redux/actions/chatActions";
import CourseChatDisplay from "./CourseChatDisplay";
import { useSocket } from "../context/socketContext";
import { ChevronLeft } from "lucide-react";


interface IChatGroupMetadata {
  _id: string;
  courseId: string;
  userId: string;
  lastMessage: {
    _id: string;
    message: string;
    senderId: {
      _id: string;
      name: string;
      role: string;
      profile?: {
        profilePic?: string;
      };
    };
    timestamp: string;
  } | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

const METADATA_STORAGE_KEY = "chatGroupMetadata";

const InstructorChatGroups: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.user.userData);
  const { data: courses } = useSelector((state: RootState) => state.course);
  const loading = useSelector((state: RootState) => state.course.loading);
  const error = useSelector((state: RootState) => state.course.error);
  const { socket } = useSocket();

  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);


  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {
    const savedCourseId = localStorage.getItem("selectedCourseId");
    return savedCourseId || null;
  });


  const [chatGroupMetadata, setChatGroupMetadata] = useState<IChatGroupMetadata[]>(() => {
    const savedMetadata = localStorage.getItem(METADATA_STORAGE_KEY);
    try {
      return savedMetadata ? JSON.parse(savedMetadata) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [metadataFetchAttempted, setMetadataFetchAttempted] = useState(false);


  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      

      if (isMobileView && selectedCourseId) {
        setShowChatList(false);
      } else {
        setShowChatList(true);
      }
    };


    checkIfMobile();


    window.addEventListener("resize", checkIfMobile);


    return () => window.removeEventListener("resize", checkIfMobile);
  }, [selectedCourseId]);


  useEffect(() => {
    if (userData?._id) {
      dispatch(getAllCoursesByInstructorAction({ page: 1, limit: 100 }));
    }
  }, [dispatch, userData?._id]);


  useEffect(() => {
    if (chatGroupMetadata.length > 0) {
      localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(chatGroupMetadata));
    }
  }, [chatGroupMetadata]);

  useEffect(() => {
    const fetchChatGroupMetadata = async () => {
      if (userData?._id && courses.length > 0 && !metadataFetchAttempted) {
        setChatLoading(true);
        setChatError(null);
        try {
          const courseIds = courses.map((course) => course._id);
          const response = await dispatch(
            getChatGroupMetadataThunk({ userId: userData._id, courseIds })
          ).unwrap();
          
          if (response.success) {
            const metadata = response.data as IChatGroupMetadata[];
            setChatGroupMetadata(metadata);
   
            if (
              (!selectedCourseId || !courses.some(course => course._id === selectedCourseId)) &&
              courses.length > 0
            ) {
              const firstCourseId = courses[0]._id;
              setSelectedCourseId(firstCourseId);
              localStorage.setItem("selectedCourseId", firstCourseId);

              if (isMobile) {
                setShowChatList(false);
              }
            }
          } else {
            // Don't set error if we have existing metadata
            if (chatGroupMetadata.length === 0) {
              setChatError(null); // Hide error messages to avoid confusion
            }
          }
        } catch (error: any) {
          // Don't set error if we have existing metadata
          if (chatGroupMetadata.length === 0) {
            setChatError(null); // Hide error messages to avoid confusion
          }
        } finally {
          setChatLoading(false);
          setMetadataFetchAttempted(true);
        }
      }
    };

    fetchChatGroupMetadata();
  }, [userData?._id, courses, dispatch, metadataFetchAttempted, chatGroupMetadata.length, isMobile]);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (socket && userData?._id) {
      socket.on('chatGroupMetadataUpdate', (metadata: IChatGroupMetadata[]) => {
        setChatGroupMetadata((prev) => {
          const updated = [...prev];
          metadata.forEach((newMeta) => {
            const index = updated.findIndex(
              (m) => m.courseId.toString() === newMeta.courseId.toString()
            );
            if (index >= 0) {
              updated[index] = newMeta;
            } else {
              updated.push(newMeta);
            }
          });
          
          // Save the updated metadata to localStorage
          localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(updated));
          
          return updated;
        });
      });

      // When socket reconnects, authenticate and rejoin rooms
      socket.on('connect', () => {
        socket.emit('authenticate', { userId: userData._id });
        
        // Rejoin the currently selected course room if any
        if (selectedCourseId) {
          socket.emit('joinCourse', selectedCourseId);
        }
      });

      return () => {
        socket.off('chatGroupMetadataUpdate');
        socket.off('connect');
      };
    }
  }, [socket, userData?._id, selectedCourseId]);

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    localStorage.setItem("selectedCourseId", courseId);
    
    // On mobile, switch to chat view
    if (isMobile) {
      setShowChatList(false);
    }
    
    // Join the course room when selecting a course
    if (socket && socket.connected) {
      socket.emit('joinCourse', courseId);
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
  };

  const getLastMessagePreview = (courseId: string) => {
    const metadata = chatGroupMetadata.find(
      (m) => m.courseId.toString() === courseId.toString()
    );
    
    if (metadata?.lastMessage) {
      const message = metadata.lastMessage.message;
      return message.length > 50 ? `${message.substring(0, 47)}...` : message;
    }
    return 'No messages yet';
  };

  const getUnreadCount = (courseId: string) => {
    const metadata = chatGroupMetadata.find(
      (m) => m.courseId.toString() === courseId.toString()
    );
    return metadata?.unreadCount || 0;
  };

  const getLastMessageTime = (courseId: string) => {
    const metadata = chatGroupMetadata.find(
      (m) => m.courseId.toString() === courseId.toString()
    );
    
    if (metadata?.lastMessage?.timestamp) {
      const date = new Date(metadata.lastMessage.timestamp);
      // If today, show time only
      if (date.toDateString() === new Date().toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      // If within the last week, show day of week
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      }
      // Otherwise show short date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return '';
  };

  const getMessageSender = (courseId: string) => {
    const metadata = chatGroupMetadata.find(
      (m) => m.courseId.toString() === courseId.toString()
    );
    
    if (metadata?.lastMessage?.senderId) {
      // If message was sent by current user
      if (metadata.lastMessage.senderId._id === userData?._id) {
        return 'You: ';
      }
      // Otherwise show sender's name
      return `${metadata.lastMessage.senderId.name}: `;
    }
    return '';
  };

  // Sort courses by last message timestamp
  const sortedCourses = [...courses].sort((a, b) => {
    const metadataA = chatGroupMetadata.find(
      (m) => m.courseId.toString() === a._id.toString()
    );
    const metadataB = chatGroupMetadata.find(
      (m) => m.courseId.toString() === b._id.toString()
    );
    
    const timeA = metadataA?.lastMessage?.timestamp
      ? new Date(metadataA.lastMessage.timestamp).getTime()
      : 0;
    const timeB = metadataB?.lastMessage?.timestamp
      ? new Date(metadataB.lastMessage.timestamp).getTime()
      : 0;
    
    // Sort in descending order (latest first)
    return timeB - timeA;
  });

  // Find the current course name for mobile header
  const currentCourseName = selectedCourseId 
    ? courses.find(course => course._id === selectedCourseId)?.title || 'Course Chat'
    : 'Course Chats';

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Mobile Header for Chat View */}
      {isMobile && !showChatList && selectedCourseId && (
        <div className="bg-gray-50 p-3 flex items-center border-b border-gray-200">
          <button
            onClick={handleBackToList}
            className="mr-3 flex items-center text-[#49BBBD] hover:text-[#3aa9ab] focus:outline-none transition-colors"
            aria-label="Back to chat list"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
          <h2 className="font-bold text-gray-800">{currentCourseName}</h2>
        </div>
      )}

      {/* Chat List Column */}
      {(!isMobile || (isMobile && showChatList)) && (
        <div className="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto shadow-sm flex flex-col h-full">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <span>Chat Groups</span>
            {/* Optional: Add a mobile action button here if needed */}
          </h2>
          {(loading || chatLoading) && !chatGroupMetadata.length && (
            <div className="p-6 flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-t-transparent border-[#49BBBD] rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-500 text-sm">Loading...</span>
            </div>
          )}
          {/* Only show error if courses are loaded and we have no metadata */}
          {error && courses.length === 0 && (
            <p className="p-6 text-red-600 text-sm font-medium">
              {error}
            </p>
          )}
          {!loading && !error && courses.length === 0 && (
            <p className="p-6 text-gray-500 text-sm italic">No courses found.</p>
          )}
          <ul className="py-2 space-y-1 flex-1 overflow-y-auto">
            {sortedCourses.map((course) => (
              <li
                key={course._id}
                onClick={() => handleCourseClick(course._id)}
                className={`mx-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out relative overflow-hidden
                  ${
                    selectedCourseId === course._id
                      ? "bg-[#49BBBD]/10 border-l-4 border-[#49BBBD] shadow-md ring-2 ring-[#49BBBD]/50"
                      : "bg-white shadow-sm"
                  }
                  hover:shadow hover:bg-[#49BBBD]/5 group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#49BBBD]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#49BBBD] to-[#3aa9ab] flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                    {course.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base tracking-tight truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                      <span className="font-medium">{getMessageSender(course._id)}</span>
                      {getLastMessagePreview(course._id)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    {getLastMessageTime(course._id) && (
                      <span className="text-xs text-gray-400 mb-1">
                        {getLastMessageTime(course._id)}
                      </span>
                    )}
                    {getUnreadCount(course._id) > 0 && (
                      <span className="bg-[#49BBBD] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                        {getUnreadCount(course._id)}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chat Display Column */}
      {(!isMobile || (isMobile && !showChatList)) && (
        <div className="flex-1 bg-gray-50 h-full">
          {selectedCourseId ? (
            // Pass key prop to force re-render when courseId changes
            <CourseChatDisplay key={selectedCourseId} courseId={selectedCourseId} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m-7 4h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-4 text-gray-500 text-lg font-medium">
                  Select a course to start chatting
                </p>
                <p className="mt-2 text-gray-400 text-sm">
                  Engage with your students in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructorChatGroups;