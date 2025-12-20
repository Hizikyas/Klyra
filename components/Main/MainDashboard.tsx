"use client";

import { useEffect, useState } from "react";
import { TopNavigation } from "./TopNavigation";
import { LeftSidebar } from "./LeftSidebar";
import { ChatSection } from "./ChatSection";
import { RightSidebar } from "./RightSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Groups } from "./Groups"; // Add this import
import { GroupSidebar } from "./GroupSidebar"; // Add this import
import { useSocket } from "../../hooks/useSocket";

export function MainDashboard() {
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);
  const [selectedSetting, setSelectedSetting] = useState<string | null>("profile");

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

  const { socket, isConnected } = useSocket(currentUser?.id || null, null);

  useEffect(() => {
    if (!socket || !isConnected || !currentUser?.id) return;

    // Join user room
    socket.emit("joinUser", currentUser?.id);

    // Join all group rooms
    const joinUserGroups = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch('http://localhost:4000/v1/groups', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          data.groups?.forEach((group: any) => {
            socket.emit("joinGroup", group.id);
          });
        }
      } catch (error) {
        console.error("Error joining group rooms:", error);
      }
    };

    joinUserGroups();

    return () => {
      socket.emit("leaveUser", currentUser?.id);
    };
  }, [socket, isConnected, currentUser?.id]);

  const handleSettingsClick = () => {
    setActiveTab("settings");
    setSelectedSetting("profile");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser?.id) {
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
        
        {activeTab === "chats" ? (
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
        ) : activeTab === "groups" ? (
          <Groups onGroupSelect={setSelectedChat} selectedGroup={selectedChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Coming soon...
          </div>
        )}

        <div className="hidden md:block">
          {selectedChat && (
            <>
              {activeTab === "chats" && (
                <RightSidebar selectedChat={selectedChat} collapsed={isRightCollapsed} onClose={() => setIsRightCollapsed(true)} />
              )}
              {activeTab === "groups" && (
                <GroupSidebar groupId={selectedChat} collapsed={isRightCollapsed} onClose={() => setIsRightCollapsed(true)} />
              )}
            </>
          )}
        </div>
      </div>

      <div className="lg:hidden h-[calc(100vh-4rem)]">
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === "chats" ? (
          <ChatSection
            activeTab={activeTab}
            selectedChat={selectedChat}
            onChatSelect={setSelectedChat}
            isMobile={true}
            selectedSetting={selectedSetting}
            onSettingSelect={setSelectedSetting}
            socket={socket}
          />
        ) : activeTab === "groups" ? (
          <Groups onGroupSelect={setSelectedChat} selectedGroup={selectedChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

export default MainDashboard;