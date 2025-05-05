import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
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
}

interface ChatComponentProps {
  courseId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ courseId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasJoinedRef = useRef(false);
  const shouldScrollToBottomRef = useRef(true);

  const userData = useSelector((state: RootState) => state.user.userData);
  const { socket, isConnected } = useSocket();

  // Log WebSocket connection status
  useEffect(() => {
    console.log('[ChatComponent] WebSocket connection status:', isConnected ? 'Connected' : 'Disconnected');
    console.log('[ChatComponent] Socket instance:', socket?.id || 'No socket');
    console.log('[ChatComponent] User ID:', userData?._id);
    console.log('[ChatComponent] Course ID:', courseId);
  }, [isConnected, socket, userData?._id, courseId]);

  const mapIChatToChatMessage = useCallback(
    (chat: IChat): ChatMessage => {
      console.log('[ChatComponent] Mapping chat, senderId:', chat.senderId);
      const senderId = typeof chat.senderId === 'string' ? chat.senderId : chat.senderId._id;
      const senderName = typeof chat.senderId === 'string' ? 'Unknown' : (chat.senderId.name || 'Anonymous');
      const senderRole =
        typeof chat.senderId === 'string' ? 'student' : chat.senderId.role === 'instructor' ? 'instructor' : 'student';
      const profilePic = typeof chat.senderId === 'string' ? undefined : (chat.senderId.profile?.profilePic || '');

      const mappedMessage: ChatMessage = {
        id: chat._id,
        sender: senderName,
        message: chat.message,
        timestamp: chat.timestamp
          ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: senderRole,
        profilePic,
        isRead: true,
        isCurrentUser: senderId === userData?._id,
      };
      console.log('[ChatComponent] Mapped message:', mappedMessage);
      return mappedMessage;
    },
    [userData?._id]
  );

  // Ensure scrolling to bottom on initial load and when new messages are added
  useEffect(() => {
    if (isChatOpen && !isMinimized && shouldScrollToBottomRef.current) {
      scrollToBottom('auto');
    }
  }, [messages, isChatOpen, isMinimized]);

  // WebSocket setup
  useEffect(() => {
    if (!socket || !isConnected || !userData?._id || !courseId) {
      console.log('[ChatComponent] Socket not ready:', {
        socket: !!socket,
        isConnected,
        userId: !!userData?._id,
        courseId,
      });
      return;
    }

    console.log('[ChatComponent] Setting up socket listeners');
    socket.emit('authenticate', { userId: userData._id });

    const handleAuthenticated = () => {
      console.log('[ChatComponent] Authenticated with WebSocket, userId:', userData._id);
      setTimeout(() => {
        console.log('[ChatComponent] Emitting joinCourse event for:', courseId);
        socket.emit('joinCourse', courseId);
      }, 100);
    };

    const handleJoined = () => {
      console.log('[ChatComponent] Joined course chat:', courseId);
      if (!hasJoinedRef.current) {
        console.log('[ChatComponent] Emitting getMessages event');
        socket.emit('getMessages', { courseId, page: 1 }); // Removed limit
        hasJoinedRef.current = true;
      }
    };

    const handleMessages = (data: { success: boolean; data: IChat[] }) => {
      console.log('[ChatComponent] Received messages:', data);
      if (data.success && data.data) {
        const newMessages = data.data.map(mapIChatToChatMessage);
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          const filteredMessages = newMessages.filter((msg) => !existingIds.has(msg.id));
          console.log('[ChatComponent] Adding messages to state:', filteredMessages);
          return [...filteredMessages, ...prev];
        });
        setUnreadCount(0);
        shouldScrollToBottomRef.current = true;
      } else {
        console.error('[ChatComponent] Failed to fetch messages:', data);
      }
    };

    const handleNewMessage = (message: IChat) => {
      console.log('[ChatComponent] Received new message:', JSON.stringify(message, null, 2));
      const senderId = typeof message.senderId === 'string' ? message.senderId : message.senderId._id;
      const isCurrentUserMessage = senderId === userData?._id;

      const newMessage = mapIChatToChatMessage(message);
      console.log('[ChatComponent] Mapped new message:', newMessage);

      setMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) {
          console.log('[ChatComponent] Duplicate message ID:', newMessage.id);
          return prev;
        }
        console.log('[ChatComponent] Adding new message to state:', newMessage);
        return [...prev, newMessage];
      });

      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }

      shouldScrollToBottomRef.current = isCurrentUserMessage || isNearBottom();
    };

    const handleError = (data: { message: string }) => {
      console.error('[ChatComponent] WebSocket error:', data.message);
    };

    socket.on('authenticated', handleAuthenticated);
    socket.on('joined', handleJoined);
    socket.on('messages', handleMessages);
    socket.on('newMessage', handleNewMessage);
    socket.on('error', handleError);

    return () => {
      console.log('[ChatComponent] Cleaning up socket listeners');
      socket.off('authenticated', handleAuthenticated);
      socket.off('joined', handleJoined);
      socket.off('messages', handleMessages);
      socket.off('newMessage', handleNewMessage);
      socket.off('error', handleError);
      hasJoinedRef.current = false;
    };
  }, [socket, isConnected, userData?._id, courseId, mapIChatToChatMessage, isChatOpen]);

  // Handle chat open/close state
  useEffect(() => {
    if (isChatOpen) {
      shouldScrollToBottomRef.current = true;
      setTimeout(() => scrollToBottom('auto'), 100);
    } else {
      hasJoinedRef.current = false;
    }
  }, [isChatOpen]);

  // Log messages state changes to debug rendering
  useEffect(() => {
    console.log('[ChatComponent] Messages state updated:', messages);
  }, [messages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      console.log('[ChatComponent] Scrolling to bottom');
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim() && courseId && socket && isConnected) {
      console.log('[ChatComponent] Sending message:', {
        courseId,
        message: inputValue,
        socketId: socket.id,
        isConnected,
      });
      socket.emit('sendMessage', { courseId, message: inputValue });
      setInputValue('');
      shouldScrollToBottomRef.current = true;
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      console.error('[ChatComponent] Cannot send message:', {
        hasInput: !!inputValue.trim(),
        courseId,
        socket: !!socket,
        isConnected,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
    <>
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
          Course Chat {unreadCount > 0 ? `(${unreadCount} new)` : ''}
        </span>
      </button>

      {isChatOpen && (
        <div
          className={`fixed right-6 bg-white rounded-lg shadow-xl flex flex-col z-50 transition-all duration-300 ${
            isMinimized ? 'bottom-6 w-72 h-12' : 'bottom-6 w-full md:w-96 h-[500px] max-h-[80vh]'
          }`}
          style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
        >
          <div className="bg-[#49BBBD] text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#49BBBD] font-bold text-sm">
                CS
              </div>
              {!isMinimized && (
                <div>
                  <h3 className="font-semibold">Course Discussion</h3>
                  <p className="text-xs text-gray-100">23 participants</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={minimizeChat}
                className="text-white hover:bg-[#3aa9ab] p-1 rounded-full"
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMinimized ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
              <div className="px-3 py-2 border-b border-gray-100 flex justify-end items-center bg-gray-50">
                <span className="text-xs text-gray-400">Today</span>
              </div>

              <div
                ref={messagesContainerRef}
                className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50"
                onScroll={handleScroll}
              >
                {messages.map((msg) => {
                  console.log('[ChatComponent] Rendering message:', msg);
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg flex items-start gap-2 ${
                          msg.isCurrentUser
                            ? 'bg-[#49BBBD] text-white'
                            : 'bg-white text-gray-800 border border-gray-100 shadow-sm'
                        } ${!msg.isRead ? 'border-l-4 border-l-yellow-400' : ''}`}
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
                        <div className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs">
                              {msg.isCurrentUser ? 'You' : msg.sender}
                            </span>
                            <span
                              className={`text-xs ${
                                msg.isCurrentUser ? 'text-gray-200' : 'text-gray-400'
                              }`}
                            >
                              {msg.timestamp}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

              <div className="p-3 bg-white border-t border-gray-200 rounded-b-lg">
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatComponent;