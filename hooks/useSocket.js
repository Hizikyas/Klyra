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
      withCredentials: true, // Enable cookies for authentication
      auth: { userId }, // Optional: Pass userId for backend authentication if needed
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

    // Handle incoming events
    newSocket.on("newMessage", (message) => {
      console.log("New message received:", message);
      // Update UI with new message (handled in ChatSection)
    });

    newSocket.on("messageUpdated", (message) => {
      console.log("Message updated:", message);
      // Update UI with updated message (handled in ChatSection)
    });

    newSocket.on("messageDeleted", (messageId) => {
      console.log("Message deleted:", messageId);
      // Update UI to remove deleted message (handled in ChatSection)
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userId, groupId]);

  return { socket, isConnected };
};