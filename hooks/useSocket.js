"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000"; // Match your backend server URL

export const useSocket = (userId, groupId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO client
    const currentUserRaw = sessionStorage.getItem("currentUser");
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"], // avoid polling to bypass CORS cookies constraint
      auth: {
             userId: currentUser?.id,
         },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log('✅ [SOCKET] Connected to server. Socket ID:', newSocket.id);
      setIsConnected(true);

      // Join user room
      if (userId) {
        console.log('🚪 [SOCKET] Joining user room:', userId);
        newSocket.emit("joinUser", userId);
      }
      // Join group room if applicable
      if (groupId) {
        console.log('🚪 [SOCKET] Joining group room:', groupId);
        newSocket.emit("joinGroup", groupId);
      }
    });

    newSocket.on("disconnect", () => {
      console.log('❌ [SOCKET] Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error('❌ [SOCKET] Connection error:', error);
    });

    // Test listener to verify socket is working
    newSocket.onAny((eventName, ...args) => {
      console.log('📨 [SOCKET] Received event:', eventName, args);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userId, groupId]);

  return { socket, isConnected };
};