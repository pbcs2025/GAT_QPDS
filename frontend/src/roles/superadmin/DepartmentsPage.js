import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../common/dashboard.css";
const API_BASE = process.env.REACT_APP_API_BASE_URL;

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const [editDept, setEditDept] = useState(null);
  const [updatedDept, setUpdatedDept] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/departments`);
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const addDepartment = async () => {
    if (!newDept) return;
    try {
      await axios.post(`${API_BASE}/departments`, { department: newDept });
      setNewDept("");
      fetchDepartments();
    } catch (err) {
      console.error("Error adding department:", err);
    }
  };

  const updateDepartment = async (oldDept) => {
    if (!updatedDept) return;
    try {
      await axios.put(`${API_BASE}/departments/${oldDept}`, { newDepartment: updatedDept });
      setEditDept(null);
      setUpdatedDept("");
      fetchDepartments();
    } catch (err) {
      console.error("Error updating department:", err);
    }
  };

  const deleteDepartment = async (dept) => {
    try {
      await axios.delete(`${API_BASE}/departments/${dept}`);
      fetchDepartments();
    } catch (err) {
      console.error("Error deleting department:", err);
    }
  };

  return (
    <div>
      <h1>Departments Management</h1>

      <div className="form-inline">
        <input
          type="text"
          placeholder="Enter department name"
          value={newDept}
          onChange={(e) => setNewDept(e.target.value)}
        />
        <button onClick={addDepartment}>Add</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept, idx) => (
            <tr key={idx}>
              <td>
                {editDept === dept.department ? (
                  <input
                    type="text"
                    value={updatedDept}
                    onChange={(e) => setUpdatedDept(e.target.value)}
                  />
                ) : (
                  dept.department
                )}
              </td>
              <td>{new Date(dept.created_at).toLocaleString()}</td>
              <td>
                {editDept === dept.department ? (
                  <>
                    <button onClick={() => updateDepartment(dept.department)}>Save</button>
                    <button onClick={() => setEditDept(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditDept(dept.department); setUpdatedDept(dept.department); }}>Edit</button>
                    <button onClick={() => deleteDepartment(dept.department)} style={{ color: "red" }}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentsPage;
