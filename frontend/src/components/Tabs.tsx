import React, { Dispatch, SetStateAction } from "react";

// 1. Define the props interface
interface TabsProps {
  activeTab: "scheduled" | "sent";
  setActiveTab: Dispatch<SetStateAction<"scheduled" | "sent">>;
}

// 2. Accept props in the component
const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div>
      <div style={styles.tabHeader}>
        <button
          style={activeTab === "scheduled" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("scheduled")}
        >
          Scheduled Emails
        </button>
        <button
          style={activeTab === "sent" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("sent")}
        >
          Sent Emails
        </button>
      </div>

      {/* Note: You can remove the "content" div here if you want 
          the Dashboard to handle the content display logic */}
    </div>
  );
};

const styles = {
  tabHeader: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  tab: {
    padding: "8px 16px",
    cursor: "pointer",
    border: "1px solid #e5e7eb",
    background: "#fff",
  },
  activeTab: {
    padding: "8px 16px",
    cursor: "pointer",
    border: "1px solid #000",
    background: "#000",
    color: "#fff",
  },
};

export default Tabs;