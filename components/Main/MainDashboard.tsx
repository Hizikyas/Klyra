"use client";

import { useEffect, useState } from "react";
import { TopNavigation } from "./TopNavigation";
import { LeftSidebar } from "./LeftSidebar";
import { ChatSection } from "./ChatSection";
import { RightSidebar } from "./RightSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { useSocket } from "../../hooks/useSocket";


export function MainDashboard() {
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);
  const [selectedSetting, setSelectedSetting] = useState<string | null>("profile");

  // Safe client-only currentUser
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("currentUser");
      setCurrentUser(raw ? JSON.parse(raw) : null);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // pass nullable id to useSocket (hook should handle null)
  const { socket, isConnected } = useSocket(currentUser?.id || null, null);

  useEffect(() => {
    if (!socket || !isConnected || !currentUser?.id) return;

    // Join user room
    socket.emit("joinUser", currentUser?.id);

    // socket.emit("joinGroup", currentUser?.id);


    // Fetch and join group rooms
    // const joinUserGroups = async () => {
    //   try {
    //     // Replace with your API call or Prisma query to get user's groups
    //     const groups = await prisma.userGroup.findMany({
    //       where: { userId: currentUser?.id },
    //       select: { groupId: true },
    //     });
    //     groups.forEach((group) => {
    //       socket.emit("joinGroup", group.groupId);
    //       console.log(`Joined group room: group:${group.groupId}`);
    //     });
    //   } catch (error) {
    //     console.error("Error fetching user groups:", error);
    //   }
    // };

    // joinUserGroups();

    // Cleanup: Leave all rooms on unmount
    // return () => {
    //   socket.emit("leaveUser", currentUser?.id);

    // };
  }, [socket, isConnected, currentUser?.id]);

  const handleSettingsClick = () => {
    setActiveTab("settings");
    setSelectedSetting("profile"); // Default to profile view
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show loading while checking auth
  }

  if (!currentUser?.id) {
    // Redirect to login if no user is authenticated
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: "linear-gradient(180deg, #07143a 0%, #09123a 45%, #030817 100%)" }} />
      <div className="absolute inset-0 -z-10">
        <div className="grid-background" />
        <div className="gradient-animation absolute inset-0 opacity-40" />
      </div>

      <TopNavigation
        onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onSettingsClick={handleSettingsClick}
      />

      <div className="hidden lg:flex h-[calc(100vh-4rem)]">
        <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <ChatSection
          activeTab={activeTab}
          selectedChat={selectedChat}
          onChatSelect={setSelectedChat}
          onToggleRightPanel={() => setIsRightCollapsed((v) => !v)}
          selectedSetting={selectedSetting}
          onSettingSelect={setSelectedSetting}
          socket={socket}
          isRightCollapsed={isRightCollapsed}
        />
        <div className="hidden md:block">
          <RightSidebar selectedChat={selectedChat} collapsed={isRightCollapsed} onClose={() => setIsRightCollapsed(true)} />
        </div>
      </div>

      <div className="lg:hidden h-[calc(100vh-4rem)]">
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <ChatSection
          activeTab={activeTab}
          selectedChat={selectedChat}
          onChatSelect={setSelectedChat}
          isMobile={true}
          selectedSetting={selectedSetting}
          onSettingSelect={setSelectedSetting}
          socket={socket}
        />
      </div>
    </div>
  );
}

export default MainDashboard;