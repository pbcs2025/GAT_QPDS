import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../common/Main.css";

function CheckPapers() {
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Assume department is stored in localStorage after login
  const department = localStorage.getItem("department") || "";

  // Fetch semesters on component mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/semesters")
      .then((res) => setSemesters(res.data))
      .catch((err) => console.error("Error fetching semesters:", err));
  }, []);

  // Fetch subjects whenever semester changes
  useEffect(() => {
    if (selectedSemester) {
      axios
        .get("http://localhost:5000/api/subjects", {
          params: { semester_id: selectedSemester, department },
        })
        .then((res) => setSubjects(res.data))
        .catch((err) => console.error("Error fetching subjects:", err));
    } else {
      setSubjects([]); // Clear subjects if no semester selected
    }
  }, [selectedSemester, department]);

  return (
    <div className="container">
      <h1>Check / Upload Question Papers</h1>

      {/* Semester Dropdown */}
      <div className="field">
        <label>Semester</label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          <option value="">-- Select Semester --</option>
          {semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              {sem.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subjects Dropdown */}
      {subjects.length > 0 && (
        <div className="field">
          <label>Subjects</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.subject_name} ({sub.subject_code})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default CheckPapers;
