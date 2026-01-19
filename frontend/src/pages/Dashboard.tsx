import React, { useState } from "react";
import ComposeModal from "../components/ComposeModal";
import "../styles/dashboard.css"; // Figma-inspired styles
import Tabs from "../components/Tabs";
import Header from "../components/Header";

const Dashboard: React.FC = () => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");

  return (
    <div className="dashboard-container">
      {/* Header with user info + logout */}
      <Header />

      {/* Page Title & Compose Button */}
      <div className="dashboard-top">
        <h1>Dashboard</h1>
        <button className="compose-btn" onClick={() => setIsComposeOpen(true)}>
          Compose New Email
        </button>
      </div>

      {/* Tabs */}
      
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "scheduled" ? (
          <div className="emails-table">
            {/* Empty state */}
            <p>No scheduled emails</p>
          </div>
        ) : (
          <div className="emails-table">
            {/* Empty state */}
            <p>No sent emails</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
