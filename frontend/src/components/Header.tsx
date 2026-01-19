// src/components/Header.tsx
import React from "react";
import { useAuth } from "../auth/AuthContext";
import "../styles/header.css"; // optional, for styling

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="user-info">
        {user?.picture && (
          <img src={user.picture} alt="avatar" className="avatar" />
        )}
        <div>
          <div className="name">{user?.name}</div>
          <div className="email">{user?.email}</div>
        </div>
      </div>
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </header>
  );
};

export default Header;
