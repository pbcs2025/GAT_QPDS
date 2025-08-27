import React, { useEffect, useState } from "react";
import "../../common/dashboard.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newSubject, setNewSubject] = useState({
    subject_code: "",
    subject_name: "",
    department: "",
    semester: "",
    credits: "",
  });
  const [message, setMessage] = useState("");

  // Fetch all subjects
  useEffect(() => {
    fetch(`${API_BASE}/subjects`)
      .then((res) => res.json())
      .then((data) => {
        // sort depts and semesters before storing
        const sorted = data.sort((a, b) => {
          if (a.department.toLowerCase() < b.department.toLowerCase()) return -1;
          if (a.department.toLowerCase() > b.department.toLowerCase()) return 1;
          return a.semester - b.semester;
        });
        setSubjects(sorted);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setSubjects([]);
      });
  }, []);

  // Group by dept and semester
  const groupedByDept = (subjects || []).reduce((acc, sub) => {
    if (!acc[sub.department]) acc[sub.department] = {};
    if (!acc[sub.department][sub.semester]) acc[sub.department][sub.semester] = [];
    acc[sub.department][sub.semester].push(sub);
    return acc;
  }, {});

  // Add subject
  const handleAdd = async () => {
    setMessage("");

    if (!newSubject.subject_code || !newSubject.subject_name || !newSubject.department || !newSubject.semester || !newSubject.credits) {
      setMessage("❌ Please fill all the fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubject),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Subject added successfully.");
        setNewSubject({ subject_code: "", subject_name: "", department: "", semester: "", credits: "" });
        setShowForm(false);
        window.location.reload();
      } else {
        setMessage("❌ " + (data.error || "Failed to add subject"));
      }
    } catch (err) {
      console.error("Add failed:", err);
      setMessage("❌ Failed to add subject.");
    }
  };

  // Delete subject
  const handleDelete = (id) => {
    if (window.confirm("Delete this subject?")) {
      fetch(`${API_BASE}/subjects/${id}`, { method: "DELETE" })
        .then(() => window.location.reload());
    }
  };

  // Edit subject name only
  // const handleEdit = (sub) => {
  //   const updatedName = prompt("Enter new subject name", sub.subject_name);
  //   if (updatedName) {
  //     fetch(`${API_BASE}/subjects/${sub.id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ ...sub, subject_name: updatedName }),
  //     }).then(() => window.location.reload());
  //   }
  // };

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <h1>Subjects</h1>
        {!showForm ? (
          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Add New Subject
          </button>
        ) : (
          <div className="reset-form">
            <h2>Add Subject</h2>
            <div className="form-group">
              <input placeholder="Subject Code" value={newSubject.subject_code} onChange={(e) => setNewSubject({ ...newSubject, subject_code: e.target.value })} />
            </div>
            <div className="form-group">
              <input placeholder="Subject Name" value={newSubject.subject_name} onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })} />
            </div>
            <div className="form-group">
              <input placeholder="Credits" type="number" value={newSubject.credits} onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })} />
            </div>
            <div className="form-group">
              <input
              type="text"
              placeholder="Enter Department"
              value={newSubject.department}
              onChange={(e) => setNewSubject({ ...newSubject, department: e.target.value })}
              />
            </div>
            <div className="form-group">
            <select value={newSubject.semester} onChange={(e) => setNewSubject({ ...newSubject, semester: e.target.value })}>
              <option value="">-- Select Semester --</option>
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            </div>
            <div className="button-group">
              <button className="small-btn save-btn" onClick={handleAdd}>Save</button>
              <button className="small-btn cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>

            {message && <p className="message-status">{message}</p>}
          </div>
        )}
      </div>

      {/* Tables */}
      {Object.keys(groupedByDept).map((dept, idx, arr) => (
  <React.Fragment key={dept}>
    <div className="dept-section">
      <h2>{dept}</h2>
      {Object.keys(groupedByDept[dept])
        .sort((a, b) => a - b) // semester order
        .map((sem) => (
          <div key={sem} className="table-wrapper">
            <h3>Semester {sem}</h3>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Credits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedByDept[dept][sem].map((sub) => (
                  <tr key={sub.id}>
                    <td>{sub.subject_code}</td>
                    <td>{sub.subject_name}</td>
                    <td>{sub.credits}</td>
                    <td>
                      <button onClick={() => handleDelete(sub.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>

    {/* ✅ HR between depts, but not after the last */}
    {idx !== arr.length - 1 && <hr style={{ margin: "30px 0" }} />}
  </React.Fragment>
))}

    </div>
  );
}

export default SubjectsPage;
