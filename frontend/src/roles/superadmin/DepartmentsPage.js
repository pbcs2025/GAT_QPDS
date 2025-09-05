import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../common/dashboard.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState("");
  const [editDeptId, setEditDeptId] = useState(null); // use ID instead of name
  const [updatedDept, setUpdatedDept] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/departments`);
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // Add department
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

  // Update department
  const updateDepartment = async (id) => {
    if (!updatedDept) return;
    try {
      await axios.put(`${API_BASE}/departments/${id}`, { newDepartment: updatedDept });
      setEditDeptId(null);
      setUpdatedDept("");
      fetchDepartments();
    } catch (err) {
      console.error("Error updating department:", err);
    }
  };

  // Delete department
  const deleteDepartment = async (id) => {
    try {
      await axios.delete(`${API_BASE}/departments/${id}`);
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
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td>
                {editDeptId === dept.id ? (
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
                {editDeptId === dept.id ? (
                  <>
                    <button onClick={() => updateDepartment(dept.id)}>Save</button>
                    <button onClick={() => setEditDeptId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditDeptId(dept.id);
                        setUpdatedDept(dept.department);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDepartment(dept.id)}
                      style={{ color: "red" }}
                    >
                      Delete
                    </button>
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
