import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const subscribeToSymbols = (symbols) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe_symbols', { symbols });
    }
  };

  const unsubscribeFromSymbols = (symbols) => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe_symbols', { symbols });
    }
  };

  return { socket: socketRef.current, subscribeToSymbols, unsubscribeFromSymbols };
};
