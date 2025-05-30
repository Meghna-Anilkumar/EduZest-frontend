import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Reply,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { IChat } from "../../redux/actions/chatActions";
import { useSocket } from "../context/socketContext";

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  date: string;
  role: "instructor" | "student";
  profilePic?: string;
  isRead?: boolean;
  isCurrentUser: boolean;
  replyTo?: {
    id: string;
    message: string;
    sender: string;
    role: "instructor" | "student";
    profilePic?: string;
  } | null;
}

interface OnlineUser {
  userId: string;
  name: string;
  role: "Student" | "Instructor" | "Admin";
}

interface ChatComponentProps {
  courseId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ courseId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasJoinedRef = useRef(false);
  const shouldScrollToBottomRef = useRef(true);

  const userData = useSelector((state: RootState) => state.user.userData);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${courseId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [courseId]);


  useEffect(() => {
    localStorage.setItem(`chat_${courseId}`, JSON.stringify(messages));
  }, [messages, courseId]);


  useEffect(() => {
    setMessages([]);
    setCurrentPage(1);
    setHasMoreMessages(true);
    hasJoinedRef.current = false;
    setUnreadCount(0);
    setOnlineUsers([]);
    setShowAllUsers(false);
    localStorage.removeItem(`chat_${courseId}`);
  }, [courseId]);

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const mapIChatToChatMessage = useCallback(
    (chat: IChat): ChatMessage => {
      const senderId =
        typeof chat.senderId === "string" ? chat.senderId : chat.senderId._id;
      const senderName =
        typeof chat.senderId === "string"
          ? "Unknown"
          : chat.senderId.name || "Anonymous";
      const senderRole =
        typeof chat.senderId === "string"
          ? "student"
          : chat.senderId.role === "instructor"
          ? "instructor"
          : "student";
      const profilePic =
        typeof chat.senderId === "string"
          ? undefined
          : chat.senderId.profile?.profilePic || "";

      const messageDate = chat.timestamp
        ? new Date(chat.timestamp)
        : new Date();
      const formattedDate = formatDate(messageDate);

      const getReplyRole = (
        senderId:
          | string
          | { _id: string; name?: string; role?: string; profile?: { profilePic?: string } }
      ): "instructor" | "student" => {
        return typeof senderId !== "string" && senderId?.role === "instructor"
          ? "instructor"
          : "student";
      };

      const replyTo = chat.replyTo
        ? {
            id: chat.replyTo._id,
            message: chat.replyTo.message,
            sender:
              typeof chat.replyTo.senderId === "string"
                ? "Unknown"
                : chat.replyTo.senderId?.name || "Anonymous",
            role: getReplyRole(chat.replyTo.senderId),
            profilePic:
              typeof chat.replyTo.senderId === "string"
                ? undefined
                : chat.replyTo.senderId?.profile?.profilePic || "",
          }
        : null;

      return {
        id: chat._id,
        sender: senderName,
        message: chat.message,
        timestamp: messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: formattedDate,
        role: senderRole,
        profilePic,
        isRead: true,
        isCurrentUser: senderId === userData?._id,
        replyTo,
      };
    },
    [userData?._id]
  );

  useEffect(() => {
    if (isChatOpen && !isMinimized && shouldScrollToBottomRef.current) {
      scrollToBottom("auto");
    }
  }, [messages, isChatOpen, isMinimized]);

  useEffect(() => {
    if (!socket || !isConnected || !userData?._id || !courseId) {
      return;
    }

    socket.emit("authenticate", { userId: userData._id });

    const handleAuthenticated = () => {
      setTimeout(() => {
        socket.emit("joinCourse", courseId);
      }, 100);
    };

    const handleJoined = (data: { success: boolean; isBlocked?: boolean }) => {
      if (data.success && !hasJoinedRef.current) {
        if (data.isBlocked) {
          setIsBlocked(true);
          setBlockMessage(
            "You have been removed from this course chat. Please contact your instructor for support."
          );
          socket.emit("leaveCourse", courseId);
          hasJoinedRef.current = false;
        } else {
          socket.emit("getMessages", { courseId, page: 1 });
          hasJoinedRef.current = true;
          setIsBlocked(false);
          setBlockMessage(null);
        }
      }
    };

    const handleMessages = (data: {
      success: boolean;
      data?: IChat[];
      totalPages?: number;
      error?: string;
    }) => {
      setIsLoading(false);
      if (data.success && data.data) {
        const newMessages = data.data.map(mapIChatToChatMessage);
        const container = messagesContainerRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;

        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          const filteredMessages = newMessages.filter(
            (msg) => !existingIds.has(msg.id)
          );
          return currentPage === 1
            ? [...filteredMessages, ...prev]
            : [...filteredMessages, ...prev];
        });

        if (container && currentPage > 1) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop += newScrollHeight - previousScrollHeight;
        }

        setCurrentPage((prev) => prev + 1);
        setHasMoreMessages(data.totalPages ? currentPage < data.totalPages : false);
        setUnreadCount(0);
        shouldScrollToBottomRef.current = currentPage === 1;
      } else {
        setBlockMessage(data.error || "Failed to load messages.");
      }
    };

    const handleNewMessage = (message: IChat) => {
      const senderId =
        typeof message.senderId === "string"
          ? message.senderId
          : message.senderId._id;
      const isCurrentUserMessage = senderId === userData?._id;

      const newMessage = mapIChatToChatMessage(message);

      setMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }

      shouldScrollToBottomRef.current = isCurrentUserMessage || isNearBottom();
    };

    const handleError = (data: { message: string }) => {
      if (data.message === "You are blocked from this course chat") {
        setIsBlocked(true);
        setBlockMessage(
          "You have been removed from this course chat. Please contact your instructor for support."
        );
        socket.emit("leaveCourse", courseId);
        hasJoinedRef.current = false;
      }
    };

    const handleOnlineUsers = (users: OnlineUser[]) => {
      setOnlineUsers(users.filter((user) => user.userId !== userData?._id));
    };

    const handleBlockedFromChat = (data: { courseId: string; message: string }) => {
      if (data.courseId === courseId) {
        setIsBlocked(true);
        setBlockMessage(
          "You have been removed from this course chat. Please contact your instructor for support."
        );
        socket.emit("leaveCourse", courseId);
        hasJoinedRef.current = false;
      }
    };

    const handleUnblockedFromChat = (data: { courseId: string; message: string }) => {
      if (data.courseId === courseId) {
        setIsBlocked(false);
        setBlockMessage("You have been added back to this course chat.");
        socket.emit("joinCourse", courseId);
        setTimeout(() => setBlockMessage(null), 5000);
      }
    };

    socket.on("authenticated", handleAuthenticated);
    socket.on("joined", handleJoined);
    socket.on("messages", handleMessages);
    socket.on("newMessage", handleNewMessage);
    socket.on("error", handleError);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("blockedFromChat", handleBlockedFromChat);
    socket.on("unblockedFromChat", handleUnblockedFromChat);

    return () => {
      socket.off("authenticated", handleAuthenticated);
      socket.off("joined", handleJoined);
      socket.off("messages", handleMessages);
      socket.off("newMessage", handleNewMessage);
      socket.off("error", handleError);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("blockedFromChat", handleBlockedFromChat);
      socket.off("unblockedFromChat", handleUnblockedFromChat);
      hasJoinedRef.current = false;
    };
  }, [
    socket,
    isConnected,
    userData?._id,
    courseId,
    mapIChatToChatMessage,
    isChatOpen,
    currentPage,
  ]);

  useEffect(() => {
    if (isChatOpen && socket && isConnected && !isBlocked) {
      socket.emit("getMessages", { courseId, page: 1 });
      setCurrentPage(1);
      setHasMoreMessages(true);
    }
  }, [isChatOpen, socket, isConnected, courseId, isBlocked]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold
    );
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim() && courseId && socket && isConnected && !isBlocked) {
      socket.emit("sendMessage", {
        courseId,
        message: inputValue,
        replyTo: replyingTo?.id,
      });
      setInputValue("");
      setReplyingTo(null);
      shouldScrollToBottomRef.current = true;
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    if (!isChatOpen) {
      setUnreadCount(0);
      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
    }
    setIsChatOpen(!isChatOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
    setShowAllUsers(false);
  };

  const toggleShowAllUsers = () => {
    setShowAllUsers(!showAllUsers);
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const emojis = ["👍", "👋", "🙌", "🎓", "📝", "❓", "🤔"];

  const handleScroll = () => {
    shouldScrollToBottomRef.current = isNearBottom();
    if (
      messagesContainerRef.current &&
      messagesContainerRef.current.scrollTop < 50 &&
      hasMoreMessages &&
      !isBlocked &&
      !isLoading
    ) {
      setIsLoading(true);
      socket.emit("getMessages", { courseId, page: currentPage });
    }
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = msg.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  const sortedDates = Object.keys(groupedMessages).sort((a, b) => {
    const dateA =
      a === "Today"
        ? new Date()
        : a === "Yesterday"
        ? new Date(new Date().setDate(new Date().getDate() - 1))
        : new Date(a);
    const dateB =
      b === "Today"
        ? new Date()
        : b === "Yesterday"
        ? new Date(new Date().setDate(new Date().getDate() - 1))
        : new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  const visibleUsers = onlineUsers.slice(0, 3);
  const remainingUsersCount = onlineUsers.length - visibleUsers.length;

  return (
    <>
      <style>
        {`
          .highlight {
            animation: highlight 1s ease-in-out;
          }
          @keyframes highlight {
            0% { background-color: rgba(73, 187, 189, 0.2); }
            100% { background-color: transparent; }
          }
          
          .message-text {
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
          }
          
          .chat-container {
            max-width: calc(100vw - 2rem);
          }
          
          @media (min-width: 768px) {
            .chat-container {
              max-width: 32rem;
            }
          }
          
          @media (min-width: 1024px) {
            .chat-container {
              max-width: 36rem;
            }
          }
          
          .online-users-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            max-width: 100%;
            overflow: hidden;
          }
          
          .online-user {
            max-width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-shrink: 0;
          }

          .users-modal {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 250px;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            z-index: 50;
            max-height: 300px;
            overflow-y: auto;
          }

          .user-list-transition {
            transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
          }

          .block-message {
            animation: slideIn 0.3s ease-in-out;
          }

          @keyframes slideIn {
            0% { transform: translateY(-10px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }

          .loading-spinner {
            display: flex;
            justify-content: center;
            padding: 1rem;
          }
        `}
      </style>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-[#213f41] text-white p-4 rounded-full shadow-lg hover:bg-[#225051] transition-all duration-200 z-50 flex items-center justify-center group"
        aria-label="Open course chat"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
        <span className="absolute opacity-0 group-hover:opacity-100 -top-10 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity duration-200">
          Course Chat {unreadCount > 0 ? `(${unreadCount} new)` : ""}
        </span>
      </button>

      {isChatOpen && (
        <div
          className={`fixed right-6 bg-white rounded-lg shadow-xl flex flex-col z-50 transition-all duration-300 chat-container ${
            isMinimized
              ? "bottom-6 w-72 h-12"
              : "bottom-6 w-full md:w-96 lg:w-144 h-[500px] max-h-[80vh]"
          }`}
          style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
        >
          <div className="bg-[#49BBBD] text-white p-3 rounded-t-lg flex justify-between items-center relative">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#49BBBD] font-bold text-sm">
                CS
              </div>
              {!isMinimized && (
                <div className="max-w-[calc(100%-4rem)]">
                  <h3 className="font-semibold">Course Discussion</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {onlineUsers.length > 0 ? (
                      <>
                        <div className="online-users-container">
                          {visibleUsers.map((user) => (
                            <div
                              key={user.userId}
                              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 online-user ${
                                user.role.toLowerCase() === "instructor"
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              <span className="h-3 w-3 rounded-full bg-green-400 inline-block flex-shrink-0"></span>
                              <span className="truncate max-w-16">
                                {user.name}
                              </span>
                              {user.role.toLowerCase() === "instructor" && (
                                <span className="text-[10px] font-medium flex-shrink-0">
                                  (Instructor)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        {remainingUsersCount > 0 && (
                          <button
                            onClick={toggleShowAllUsers}
                            className="flex items-center text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors cursor-pointer"
                          >
                            <span>+{remainingUsersCount}</span>
                            {showAllUsers ? (
                              <ChevronUp className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            )}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-100 opacity-80">
                        No other participants online
                      </p>
                    )}
                  </div>

                  {showAllUsers && onlineUsers.length > 0 && (
                    <div className="users-modal">
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <h3 className="font-medium text-gray-800">
                              Online Users ({onlineUsers.length})
                            </h3>
                          </div>
                          <button
                            onClick={toggleShowAllUsers}
                            className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {onlineUsers.map((user) => (
                          <div
                            key={user.userId}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {user.name}
                              </p>
                              <div
                                className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${
                                  user.role.toLowerCase() === "instructor"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                                {user.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={minimizeChat}
                className="text-white hover:bg-[#3aa9ab] p-1 rounded-full"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMinimized ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  )}
                </svg>
              </button>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-[#3aa9ab] p-1 rounded-full"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {blockMessage && (
                <div className="p-3 text-sm font-medium text-center bg-yellow-100 text-yellow-800 rounded-lg mx-3 mt-2 block-message">
                  {blockMessage}
                </div>
              )}

              <div
                ref={messagesContainerRef}
                className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50"
                onScroll={handleScroll}
              >
                {isLoading && (
                  <div className="loading-spinner">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                      ></path>
                    </svg>
                  </div>
                )}
                {sortedDates.length > 0 ? (
                  sortedDates.map((date) => (
                    <div key={date} className="space-y-3">
                      <div className="px-3 py-1 flex justify-center items-center">
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                          {date}
                        </span>
                      </div>
                      {groupedMessages[date].map((msg) => (
                        <div
                          key={msg.id}
                          id={`message-${msg.id}`}
                          className={`flex ${
                            msg.isCurrentUser ? "justify-end" : "justify-start"
                          } group transition-all duration-200 ease-in-out hover:scale-[1.01]`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg flex items-start gap-2 ${
                              msg.isCurrentUser
                                ? "bg-[#49BBBD] text-white"
                                : "bg-white text-gray-800 border border-gray-100 shadow-sm"
                            } ${
                              !msg.isRead
                                ? "border-l-4 border-l-yellow-400"
                                : ""
                            }`}
                          >
                            {!msg.isCurrentUser && (
                              <div className="flex-shrink-0 p-2">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                  {msg.profilePic ? (
                                    <img
                                      src={msg.profilePic}
                                      alt={msg.sender}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-gray-600 text-xs font-medium">
                                      {getInitials(msg.sender)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="p-2 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="font-medium text-xs truncate">
                                    {msg.isCurrentUser ? "You" : msg.sender}
                                    {msg.role === "instructor" &&
                                      !msg.isCurrentUser &&
                                      " (Instructor)"}
                                  </span>
                                  <span
                                    className={`text-xs ${
                                      msg.isCurrentUser
                                        ? "text-gray-200"
                                        : "text-gray-400"
                                    } whitespace-nowrap`}
                                  >
                                    {msg.timestamp}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleReply(msg)}
                                  className={`p-1 rounded-full hover:bg-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0 ${
                                    msg.isCurrentUser
                                      ? "text-gray-200 hover:bg-gray-300/50"
                                      : "text-gray-500"
                                  }`}
                                  title="Reply to this message"
                                >
                                  <Reply className="h-4 w-4" />
                                </button>
                              </div>
                              {msg.replyTo && (
                                <div
                                  className={`p-2 mt-1 rounded-lg cursor-pointer hover:bg-opacity-80 ${
                                    msg.isCurrentUser
                                      ? "bg-white/20"
                                      : "bg-gray-100"
                                  }`}
                                  onClick={() => {
                                    const element = document.getElementById(
                                      `message-${msg.replyTo!.id}`
                                    );
                                    if (element) {
                                      element.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                      });
                                      element.classList.add("highlight");
                                      setTimeout(
                                        () =>
                                          element.classList.remove("highlight"),
                                        2000
                                      );
                                    }
                                  }}
                                >
                                  <p
                                    className={`text-xs font-semibold ${
                                      msg.isCurrentUser
                                        ? "text-gray-100"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    Replying to {msg.replyTo.sender}
                                    {msg.replyTo.role === "instructor" &&
                                      " (Instructor)"}
                                  </p>
                                  <p
                                    className={`text-xs ${
                                      msg.isCurrentUser
                                        ? "text-gray-200"
                                        : "text-gray-600"
                                    } truncate`}
                                  >
                                    {msg.replyTo.message.length > 50
                                      ? `${msg.replyTo.message.substring(
                                          0,
                                          47
                                        )}...`
                                      : msg.replyTo.message}
                                  </p>
                                </div>
                              )}
                              <p className="text-sm mt-1 message-text">
                                {msg.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col justify-center items-center h-full text-gray-500">
                    <svg
                      className="h-12 w-12 text-gray-400 mb-2"
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
                    <p className="text-sm font-medium">No messages yet.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Start the conversation below!
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-1 border-t border-gray-100 flex flex-wrap justify-center gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setInputValue((prev) => prev + emoji)}
                    className={`text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors ${
                      isBlocked ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    disabled={isBlocked}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-white border-t border-gray-200 rounded-b-lg">
                {replyingTo && !isBlocked && (
                  <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-700 truncate">
                        Replying to {replyingTo.sender}
                        {replyingTo.role === "instructor" && " (Instructor)"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {replyingTo.message.length > 50
                          ? `${replyingTo.message.substring(0, 47)}...`
                          : replyingTo.message}
                      </p>
                    </div>
                    <button
                      onClick={cancelReply}
                      className="text-gray-500 hover:text-red-500 p-1 rounded-full flex-shrink-0"
                      title="Cancel reply"
                    >
                      <svg
                        className="h-4 w-4"
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
                )}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      isBlocked
                        ? "You are blocked from sending messages"
                        : "Type your message..."
                    }
                    className={`flex-1 p-2 bg-transparent focus:outline-none text-sm min-w-0 ${
                      isBlocked ? "cursor-not-allowed text-gray-400" : ""
                    }`}
                    autoFocus={!isBlocked}
                    disabled={isBlocked}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isBlocked}
                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                      inputValue.trim() && !isBlocked
                        ? "bg-[#49BBBD] text-white hover:bg-[#3aa9ab]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 px-2">
                  <p className="text-xs text-gray-400">
                    {isBlocked
                      ? "Contact your instructor to regain chat access."
                      : "Press Enter to send, Shift+Enter for new line"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatComponent;