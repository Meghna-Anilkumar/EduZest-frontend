import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import io, { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const userData = useSelector((state: RootState) => state.user.userData);

  useEffect(() => {
    console.log('[SocketContext] userData._id:', userData?._id);
    if (!userData?._id) {
      console.log('[SocketContext] No userId, skipping socket initialization');
      return;
    }

    console.log('[SocketContext] Initializing socket connection to http://localhost:5000');
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      auth: { userId: userData._id },
      path: '/socket.io'
    });

    newSocket.on('connect', () => {
      console.log('[SocketContext] WebSocket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[SocketContext] Connection error:', error.message);
    });

    newSocket.on('disconnect', () => {
      console.log('[SocketContext] WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('error', (data: { message: string }) => {
      console.error('[SocketContext] WebSocket error:', data.message);
    });

    setSocket(newSocket);
    console.log('[SocketContext] Socket initialized:', newSocket.id);

    return () => {
      console.log('[SocketContext] Cleaning up socket');
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userData?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);