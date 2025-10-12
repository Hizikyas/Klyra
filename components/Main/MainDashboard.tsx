"use client";

import { useState } from "react";
import { TopNavigation } from "./TopNavigation";
import { LeftSidebar } from "./LeftSidebar";
import { ChatSection } from "./ChatSection";
import { RightSidebar } from "./RightSidebar";
import { MobileSidebar } from "./MobileSidebar";

export function MainDashboard() {
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<string | null>("profile");

  const handleSettingsClick = () => {
    setActiveTab("settings");
    setSelectedSetting("profile"); // Default to profile view
  };

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
        />
        <div className="hidden xl:block">
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
        />
      </div>
    </div>
  );
}

export default MainDashboard;