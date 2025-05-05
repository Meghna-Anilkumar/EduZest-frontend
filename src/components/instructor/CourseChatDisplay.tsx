import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { IChat } from '../../redux/actions/chatActions';
import { useSocket } from '../context/socketContext';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  role: 'instructor' | 'student';
  profilePic?: string;
  isRead?: boolean;
  isCurrentUser: boolean;
  courseId: string;
}

interface CourseChatDisplayProps {
  courseId: string;
}

const CourseChatDisplay: React.FC<CourseChatDisplayProps> = ({ courseId }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasJoinedRef = useRef(false);
  const shouldScrollToBottomRef = useRef(true);
  const currentCourseIdRef = useRef<string>('');

  const userData = useSelector((state: RootState) => state.user.userData);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    currentCourseIdRef.current = courseId;
  }, [courseId]);

  const mapIChatToChatMessage = useCallback(
    (chat: IChat): ChatMessage => {
      const senderId = typeof chat.senderId === 'string' ? chat.senderId : chat.senderId?._id;
      const senderName = typeof chat.senderId === 'string' ? 'Unknown' : chat.senderId?.name || 'Anonymous';
      const senderRole: 'instructor' | 'student' = typeof chat.senderId !== 'string' && chat.senderId?.role === 'instructor' ? 'instructor' : 'student';
      const senderProfilePic = typeof chat.senderId === 'string' ? undefined : chat.senderId?.profile?.profilePic;
      const normalizedCourseId = typeof chat.courseId === 'string' ? chat.courseId : chat.courseId?.toString() || '';

      return {
        id: chat._id,
        sender: senderName,
        message: chat.message,
        timestamp: chat.timestamp
          ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: senderRole,
        profilePic: senderProfilePic,
        isRead: true,
        isCurrentUser: senderId === userData?._id,
        courseId: normalizedCourseId,
      };
    },
    [userData?._id]
  );

  useEffect(() => {
    setMessages([]);
    setIsLoading(true);
    setError(null);
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
            const chatCourseId = typeof chat.courseId === 'string' ? chat.courseId : chat.courseId?.toString();
            return chatCourseId === courseId;
          })
          .map(mapIChatToChatMessage);
        setMessages(newMessages);
        setIsLoading(false);
        shouldScrollToBottomRef.current = true;
      } else {
        setError('Failed to fetch messages');
        setIsLoading(false);
      }
    };

    const handleNewMessage = (message: IChat) => {
      if (!message || !message._id) return;
      const messageCourseId = typeof message.courseId === 'string' ? message.courseId : message.courseId?.toString();
      if (messageCourseId !== courseId) return;

      const newMessage = mapIChatToChatMessage(message);
      setMessages((prev) => (prev.some((msg) => msg.id === newMessage.id) ? prev : [...prev, newMessage]));
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

    socket.off('authenticated').on('authenticated', handleAuthenticated);
    socket.off('joined').on('joined', handleJoined);
    socket.off('messages').on('messages', handleMessages);
    socket.off('newMessage').on('newMessage', handleNewMessage);
    socket.off('error').on('error', handleError);
    socket.off('reconnect').on('reconnect', handleReconnect);

    socket.emit('authenticate', { userId: userData._id });

    return () => {
      socket.off('authenticated', handleAuthenticated);
      socket.off('joined', handleJoined);
      socket.off('messages', handleMessages);
      socket.off('newMessage', handleNewMessage);
      socket.off('error', handleError);
      socket.off('reconnect', handleReconnect);
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
      socket.emit('sendMessage', { courseId, message: inputValue });
      setInputValue('');
      shouldScrollToBottomRef.current = true;
      
      // Use the messagesEndRef directly instead of the scrollToBottom function
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

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#49BBBD] text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#49BBBD] font-bold text-sm">
            CS
          </div>
          <div>
            <h3 className="font-semibold">Course Discussion</h3>
            <p className="text-xs text-gray-100">{messages.length > 0 ? `${messages.length} messages` : 'Loading...'}</p>
          </div>
        </div>
      </div>
      <div className="px-3 py-2 border-b border-gray-100 flex justify-end items-center bg-gray-50">
        <span className="text-xs text-gray-400">Today</span>
      </div>
      {error && (
        <div className="p-3 text-red-500 text-sm text-center">
          {error}
        </div>
      )}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-32 text-gray-400">
            Loading messages...
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg flex items-start gap-2 ${
                  msg.isCurrentUser
                    ? 'bg-[#49BBBD] text-white'
                    : msg.role === 'instructor'
                    ? 'bg-blue-100 text-gray-800 border border-blue-200 shadow-sm'
                    : 'bg-white text-gray-800 border border-gray-100 shadow-sm'
                } ${!msg.isRead ? 'border-l-4 border-l-yellow-400' : ''}`}
              >
                {!msg.isCurrentUser && (
                  <div className="flex-shrink-0 p-2">
                    <div
                      className={`h-8 w-8 rounded-full ${
                        msg.role === 'instructor' ? 'bg-blue-200' : 'bg-gray-200'
                      } flex items-center justify-center overflow-hidden`}
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
                            msg.role === 'instructor' ? 'text-blue-600' : 'text-gray-600'
                          } text-xs font-medium`}
                        >
                          {getInitials(msg.sender)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium text-xs ${
                        msg.role === 'instructor' && !msg.isCurrentUser ? 'text-blue-700' : ''
                      }`}
                    >
                      {msg.isCurrentUser ? 'You' : msg.sender}
                      {msg.role === 'instructor' && !msg.isCurrentUser && ' (Instructor)'}
                    </span>
                    <span
                      className={`text-xs ${msg.isCurrentUser ? 'text-gray-200' : 'text-gray-400'}`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{msg.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-32 text-gray-400">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 py-1 border-t border-gray-100 flex justify-center gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => setInputValue((prev) => prev + emoji)}
            className="text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
          <button className="text-gray-400 hover:text-[#49BBBD] p-1 rounded-full transition-colors">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-transparent focus:outline-none text-sm"
            autoFocus
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`p-2 rounded-full transition-colors ${
              inputValue.trim()
                ? 'bg-[#49BBBD] text-white hover:bg-[#3aa9ab]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 px-2">
          <p className="text-xs text-gray-400">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseChatDisplay;