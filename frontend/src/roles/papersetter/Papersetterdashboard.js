import React from "react";
import { Link } from "react-router-dom";
import "../../common/dashboard.css";

function PaperSetterDashboard() {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Paper Setter</h2>
        <Link to="/papersetter-dashboard">Dashboard</Link>
        <Link to="/create-paper">Create Paper</Link>
        <Link to="/check-papers">Upload Questions</Link>
        <Link to="/logout">Logout</Link>
      </div>
      <div className="dashboard-content">
        <h1>Welcome to Paper Setter Dashboard</h1>
        <p>This is the Paper Setter's control panel.</p>
      </div>
    </div>
  );
}

export default PaperSetterDashboard;
