'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// This context is kept for compatibility but the legacy WebSocket connection
// is disabled. Real-time communication is handled by useGeminiLive.

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  latency: number;
  sendMessage: (message: any) => void;
  sendAudioChunk: (audioData: ArrayBuffer) => void;
  error: Error | null;
}

const defaultValue: WebSocketContextType = {
  isConnected: false,
  lastMessage: null,
  latency: 0,
  sendMessage: () => {},
  sendAudioChunk: () => {},
  error: null,
};

const WebSocketContext = createContext<WebSocketContextType>(defaultValue);

export const useWebSocketContext = (): WebSocketContextType => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WebSocketContext.Provider value={defaultValue}>
      {children}
    </WebSocketContext.Provider>
  );
};