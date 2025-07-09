import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

// --- SVG Icons for a cleaner look ---
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
const HistoryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
    <path d="M12 8v4l2 2"></path>
  </svg>
);
const NewChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14"></path>
    <path d="M5 12h14"></path>
  </svg>
);

export default function Sidebar() {
  // --- FEATURE: Function to clear chat state ---
  // This dispatches a custom event that the Home component will listen for.
  const handleNewChat = () => {
    window.dispatchEvent(new CustomEvent("new-chat"));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Planner App</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/home" className="nav-link">
          <HomeIcon />
          <span>Home</span>
        </NavLink>
        <NavLink to="/local" className="nav-link">
          <HistoryIcon />
          <span>History</span>
        </NavLink>
      </nav>
      {/* --- FEATURE: New Chat Button --- */}
      <button className="new-chat-button" onClick={handleNewChat}>
        <NewChatIcon />
        <span>New Chat</span>
      </button>
    </div>
  );
}
