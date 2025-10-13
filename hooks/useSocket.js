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
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"], // avoid polling to bypass CORS cookies constraint
      auth: { userId, token },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server:", newSocket.id);

      // Join user room
      if (userId) {
        newSocket.emit("joinUser", userId);
      }
      // Join group room if applicable
      if (groupId) {
        newSocket.emit("joinGroup", groupId);
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userId, groupId]);

  return { socket, isConnected };
};