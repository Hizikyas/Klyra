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
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"], // avoid polling to bypass CORS cookies constraint
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);

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