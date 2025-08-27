// src/components/AdminManageFaculty.js
import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function AdminManageFaculty() {
  const [formData, setFormData] = useState({
    name: "",
    clgName: "",
    deptName: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleAddFaculty = async () => {
  setMessage("");

  if (!formData.name || !formData.clgName || !formData.deptName || !formData.email || !formData.phone) {
    setMessage("❌ Please fill all the fields.");
    setTimeout(() => setMessage(""), 3000); // clear after 3 sec
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/externalregister`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.name,
        clgName: formData.clgName,
        deptName: formData.deptName,
        email: formData.email,
        phoneNo: formData.phone,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ External faculty registered successfully.");
      setFormData({
        name: "",
        clgName: "",
        deptName: "",
        email: "",
        phone: "",
      });
    } else {
      setMessage("❌ " + (data.error || "Registration failed"));
    }
  } catch (err) {
    console.error("Registration failed:", err);
    setMessage("❌ Failed to register external faculty.");
  }

  // Clear message after 3 seconds
  setTimeout(() => setMessage(""), 3000);
};



  return (
    <div className="section">
      <h2>Add External Faculty Details</h2>
      <div className="reset-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="form-group">
          <label>College Name</label>
          <select
            name="clgName"
            value={formData.clgName}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Select College --</option>
            <option value="Global Academy of Technology">Global Academy of Technology</option>
            <option value="BMS College">BMS College</option>
            <option value="RVCE">RVCE</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Department Name</label>
          <select
            name="deptName"
            value={formData.deptName}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Select Department --</option>
            <option value="CSE">CSE</option>
            <option value="ISE">ISE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="ME">ME</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="example@college.edu"
            required
          />
        </div>

        <div className="form-group">
          <label>Contact Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="10-digit number"
            maxLength={10}
            required
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button type="button" onClick={handleAddFaculty}>
            Add +
          </button>
        </div>

        {message && <p className="message-status">{message}</p>}
      </div>
    </div>
  );
}

export default AdminManageFaculty;
