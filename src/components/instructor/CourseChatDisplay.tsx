import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Reply } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useSocket } from '../context/socketContext';

interface IChat {
  _id: string;
  courseId: string | { toString: () => string };
  senderId: string | { _id: string; name: string; role: string; profile?: { profilePic?: string } };
  message: string;
  timestamp?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
  isRead?: boolean;
  replyTo?: {
    _id: string;
    message: string;
    senderId: { _id: string; name: string; role: string; profile?: { profilePic?: string } };
  } | null;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  date: string;
  role: 'instructor' | 'student';
  profilePic?: string;
  isRead?: boolean;
  isCurrentUser: boolean;
  courseId: string;
  replyTo?: {
    id: string;
    message: string;
    sender: string;
    role: 'instructor' | 'student';
    profilePic?: string;
  } | null;
}

interface OnlineUser {
  userId: string;
  name: string;
  role: 'instructor' | 'student';
}

interface CourseChatDisplayProps {
  courseId: string;
}

const CourseChatDisplay: React.FC<CourseChatDisplayProps> = ({ courseId }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasJoinedRef = useRef(false);
  const shouldScrollToBottomRef = useRef(true);
  const currentCourseIdRef = useRef<string>('');
  const messagesRef = useRef<ChatMessage[]>([]);

  const userData = useSelector((state: RootState) => state.user.userData);
  const courses = useSelector((state: RootState) => state.course.data);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    currentCourseIdRef.current = courseId;

    const savedMessages = localStorage.getItem(`messages_${courseId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        messagesRef.current = parsedMessages;
      } catch (e) {
        console.error('Error parsing saved messages:', e);
      }
    }
  }, [courseId]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`messages_${courseId}`, JSON.stringify(messages));
      messagesRef.current = messages;
    }
  }, [messages, courseId]);

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const mapIChatToChatMessage = useCallback(
    (chat: IChat): ChatMessage => {
      const senderId = typeof chat.senderId === 'string' ? chat.senderId : chat.senderId?._id;
      const senderName = typeof chat.senderId === 'string' ? 'Unknown' : chat.senderId?.name || 'Anonymous';
      const senderRole: 'instructor' | 'student' = typeof chat.senderId !== 'string' && chat.senderId?.role === 'instructor' ? 'instructor' : 'student';
      const senderProfilePic = typeof chat.senderId === 'string' ? undefined : chat.senderId?.profile?.profilePic;
      const normalizedCourseId = typeof chat.courseId === 'string' ? chat.courseId : chat.courseId.toString();

      const messageDate = chat.timestamp ? new Date(chat.timestamp) : new Date();
      const formattedDate = formatDate(messageDate);

      const replyTo = chat.replyTo
        ? {
            id: chat.replyTo._id,
            message: chat.replyTo.message,
            sender: typeof chat.replyTo.senderId === 'string' ? 'Unknown' : chat.replyTo.senderId?.name || 'Anonymous',
            role: typeof chat.replyTo.senderId !== 'string' && chat.replyTo.senderId?.role === 'instructor' ? 'instructor' : 'student',
            profilePic: typeof chat.replyTo.senderId === 'string' ? undefined : chat.replyTo.senderId?.profile?.profilePic
          }
        : null;

      return {
        id: chat._id,
        sender: senderName,
        message: chat.message,
        timestamp: messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: formattedDate,
        role: senderRole,
        profilePic: senderProfilePic,
        isRead: chat.isRead ?? true,
        isCurrentUser: senderId === userData?._id,
        courseId: normalizedCourseId,
        replyTo
      };
    },
    [userData?._id]
  );

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setOnlineUsers([]);
    setReplyingTo(null);
    hasJoinedRef.current = false;
    shouldScrollToBottomRef.current = true;
  }, [courseId]);

  useEffect(() => {
    if (shouldScrollToBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !isConnected || !userData?._id || !courseId) return;

    let previousCourseId: string | null = null;

    const handleAuthenticated = () => {
      const joinCourse = () => {
        if (previousCourseId && previousCourseId !== courseId) {
          socket.emit('leaveCourse', previousCourseId);
        }
        socket.emit('joinCourse', courseId);
        previousCourseId = courseId;
      };
      joinCourse();
      setTimeout(() => {
        if (!hasJoinedRef.current) joinCourse();
      }, 1000);
    };

    const handleJoined = (data: { courseId: string }) => {
      if (data.courseId === courseId) {
        hasJoinedRef.current = true;
        socket.emit('getMessages', { courseId, page: 1 });
      }
    };

    const handleMessages = (data: { success: boolean; data: IChat[] }) => {
      if (data.success && Array.isArray(data.data) && currentCourseIdRef.current === courseId) {
        const newMessages = data.data
          .filter((chat) => {
            const chatCourseId = typeof chat.courseId === 'string' ? chat.courseId : chat.courseId.toString();
            return chatCourseId === courseId;
          })
          .map(mapIChatToChatMessage);

        if (newMessages.length > 0) {
          setMessages(newMessages);
          localStorage.setItem(`messages_${courseId}`, JSON.stringify(newMessages));
          messagesRef.current = newMessages;
        } else if (messagesRef.current.length === 0) {
          setMessages([]);
        }

        setIsLoading(false);
        shouldScrollToBottomRef.current = true;
      } else {
        if (messagesRef.current.length > 0) {
          setIsLoading(false);
        } else {
          setError('Failed to fetch messages');
          setIsLoading(false);
        }
      }
    };

    const handleNewMessage = (message: IChat) => {
      if (!message || !message._id) return;
      const messageCourseId = typeof message.courseId === 'string' ? message.courseId : message.courseId.toString();
      if (messageCourseId !== courseId) return;

      const newMessage = mapIChatToChatMessage(message);

      setMessages((prev) => {
        const updated = prev.some((msg) => msg.id === newMessage.id) ? prev : [...prev, newMessage];
        localStorage.setItem(`messages_${courseId}`, JSON.stringify(updated));
        messagesRef.current = updated;
        return updated;
      });

      shouldScrollToBottomRef.current = newMessage.isCurrentUser || isNearBottom();
    };

    const handleError = (data: { message: string }) => {
      setError(data.message);
    };

    const handleReconnect = () => {
      socket.emit('authenticate', { userId: userData._id });
      if (courseId) {
        socket.emit('joinCourse', courseId);
        setTimeout(() => socket.emit('getMessages', { courseId, page: 1 }), 300);
      }
    };

    const handleOnlineUsers = (users: OnlineUser[]) => {
      setOnlineUsers(users.filter((user) => user.userId !== userData?._id));
    };

    socket.off('authenticated').on('authenticated', handleAuthenticated);
    socket.off('joined').on('joined', handleJoined);
    socket.off('messages').on('messages', handleMessages);
    socket.off('newMessage').on('newMessage', handleNewMessage);
    socket.off('error').on('error', handleError);
    socket.off('reconnect').on('reconnect', handleReconnect);
    socket.off('onlineUsers').on('onlineUsers', handleOnlineUsers);

    socket.emit('authenticate', { userId: userData._id });

    return () => {
      socket.off('authenticated', handleAuthenticated);
      socket.off('joined', handleJoined);
      socket.off('messages', handleMessages);
      socket.off('newMessage', handleNewMessage);
      socket.off('error', handleError);
      socket.off('reconnect', handleReconnect);
      socket.off('onlineUsers', handleOnlineUsers);
      if (previousCourseId) socket.emit('leaveCourse', previousCourseId);
      hasJoinedRef.current = false;
    };
  }, [socket, isConnected, userData?._id, courseId, mapIChatToChatMessage]);

  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim() && courseId && socket && isConnected) {
      socket.emit('sendMessage', {
        courseId,
        message: inputValue,
        replyTo: replyingTo?.id
      });
      setInputValue('');
      setReplyingTo(null);
      shouldScrollToBottomRef.current = true;
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const emojis = ['👍', '👋', '🙌', '🎓', '📝', '❓', '🤔'];

  const handleScroll = () => {
    shouldScrollToBottomRef.current = isNearBottom();
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
    const dateA = a === 'Today' ? new Date() : a === 'Yesterday' ? new Date(new Date().setDate(new Date().getDate() - 1)) : new Date(a);
    const dateB = b === 'Today' ? new Date() : b === 'Yesterday' ? new Date(new Date().setDate(new Date().getDate() - 1)) : new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  const course = courses?.find(c => c._id === courseId);
  const courseName = course?.title || 'Course Discussion';
  const courseInitial = courseName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-white">
      <style>
        {`
          .highlight {
            animation: highlight 1s ease-in-out;
          }
          @keyframes highlight {
            0% { background-color: rgba(73, 187, 189, 0.2); }
            100% { background-color: transparent; }
          }
        `}
      </style>

      <div className="bg-gradient-to-r from-[#49BBBD] to-[#3aa9ab] text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#49BBBD] font-bold text-lg shadow-sm">
            {courseInitial}
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight">{courseName}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {onlineUsers.length > 0 ? (
                onlineUsers.map((user) => (
                  <div
                    key={user.userId}
                    className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                      user.role === 'instructor' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full bg-green-400 inline-block"></span>
                    <span>{user.name}</span>
                    {user.role === 'instructor' && <span className="text-[10px] font-medium">(Instructor)</span>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-100 opacity-80">No other participants online</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 text-red-600 text-sm font-medium text-center bg-red-50 rounded-lg mx-4 mt-2">
          {error}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"
        onScroll={handleScroll}
      >
        {isLoading && !messages.length ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-t-transparent border-[#49BBBD] rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500 text-sm">Loading messages...</span>
          </div>
        ) : messages.length > 0 ? (
          sortedDates.map((date) => (
            <div key={date} className="space-y-4">
              <div className="px-4 py-2 flex justify-center items-center">
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                  {date}
                </span>
              </div>
              {groupedMessages[date].map((msg) => (
                <div
                  key={msg.id}
                  id={`message-${msg.id}`}
                  className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'} group transition-all duration-200 ease-in-out hover:scale-[1.01]`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl flex items-start gap-3 p-3 shadow-sm transition-shadow duration-200 hover:shadow-md
                      ${msg.isCurrentUser
                        ? 'bg-[#49BBBD] text-white'
                        : msg.role === 'instructor'
                        ? 'bg-blue-50 text-gray-900 border border-blue-100'
                        : 'bg-white text-gray-900 border border-gray-100'
                      }
                      ${!msg.isRead && !msg.isCurrentUser ? 'border-l-4 border-l-yellow-400' : ''}`}
                  >
                    {!msg.isCurrentUser && (
                      <div className="flex-shrink-0">
                        <div
                          className={`h-9 w-9 rounded-full ${
                            msg.role === 'instructor' ? 'bg-blue-200' : 'bg-gray-200'
                          } flex items-center justify-center overflow-hidden shadow-sm`}
                        >
                          {msg.profilePic ? (
                            <img
                              src={msg.profilePic}
                              alt={msg.sender}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span
                              className={`${
                                msg.role === 'instructor' ? 'text-blue-700' : 'text-gray-700'
                              } text-sm font-semibold`}
                            >
                              {getInitials(msg.sender)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-xs ${
                              msg.role === 'instructor' && !msg.isCurrentUser ? 'text-blue-700' : 'text-gray-800'
                            } ${msg.isCurrentUser ? 'text-gray-100' : ''}`}
                          >
                            {msg.isCurrentUser ? 'You' : msg.sender}
                            {msg.role === 'instructor' && !msg.isCurrentUser && ' (Instructor)'}
                          </span>
                          <span
                            className={`text-xs ${msg.isCurrentUser ? 'text-gray-200' : 'text-gray-500'}`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                        <button
                          onClick={() => handleReply(msg)}
                          className={`p-1 rounded-full hover:bg-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                            msg.isCurrentUser ? 'text-gray-200 hover:bg-gray-300/50' : 'text-gray-500'
                          }`}
                          title="Reply to this message"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                      </div>
                      {msg.replyTo && (
                        <div
                          className={`p-2 mt-1 rounded-lg cursor-pointer hover:bg-opacity-80 ${
                            msg.isCurrentUser ? 'bg-white/20' : 'bg-gray-100'
                          }`}
                          onClick={() => {
                            const element = document.getElementById(`message-${msg.replyTo!.id}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              element.classList.add('highlight');
                              setTimeout(() => element.classList.remove('highlight'), 2000);
                            }
                          }}
                        >
                          <p className={`text-xs font-semibold ${msg.isCurrentUser ? 'text-gray-100' : 'text-gray-700'}`}>
                            Replying to {msg.replyTo.sender}
                            {msg.replyTo.role === 'instructor' && ' (Instructor)'}
                          </p>
                          <p className={`text-xs ${msg.isCurrentUser ? 'text-gray-200' : 'text-gray-600'} truncate`}>
                            {msg.replyTo.message.length > 50 ? `${msg.replyTo.message.substring(0, 47)}...` : msg.replyTo.message}
                          </p>
                        </div>
                      )}
                      <p className="text-sm mt-1 leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="flex flex-col justify-center items-center h-32 text-gray-500">
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
            <p className="text-xs text-gray-400 mt-1">Start the conversation below!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 border-t border-gray-200 flex justify-center gap-2 bg-gray-50">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => setInputValue((prev) => prev + emoji)}
            className="text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors duration-200 hover:scale-110"
            title={`Add ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 shadow-inner">
        {replyingTo && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700">
                Replying to {replyingTo.sender}
                {replyingTo.role === 'instructor' && ' (Instructor)'}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {replyingTo.message.length > 50 ? `${replyingTo.message.substring(0, 47)}...` : replyingTo.message}
              </p>
            </div>
            <button
              onClick={cancelReply}
              className="text-gray-500 hover:text-red-500 p-1 rounded-full"
              title="Cancel reply"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-gray-100 rounded-full p-2 shadow-sm">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-transparent focus:outline-none text-sm text-gray-800 placeholder-gray-400"
            autoFocus
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`p-2 rounded-full transition-all duration-200 ${
              inputValue.trim()
                ? 'bg-[#49BBBD] text-white hover:bg-[#3aa9ab] hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 px-3">
          <p className="text-xs text-gray-500 italic">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseChatDisplay;