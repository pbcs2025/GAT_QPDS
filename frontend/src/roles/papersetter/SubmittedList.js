import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../common/dashboard.css";


function SubmittedList() {
  const [papers, setPapers] = useState([]);
  const navigate = useNavigate();
  const handleClick = (paper) => {
    navigate(`/submitted/${paper.subject_code}/${paper.semester}`);
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/submitted-list")
      .then((res) => res.json())
      .then((data) => setPapers(data))
      .catch((err) => console.error("❌ Error:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📄 Submitted Papers</h2>
      {papers.length === 0 ? (
        <p>No papers found.</p>
      ) : (
        <ul>
          {papers.map((paper, index) => (
            <li key={index}>
              <button
                style={{
                  padding: "10px",
                  margin: "10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
                onClick={() =>
                  navigate(`/submitted/${paper.subject_code}/${paper.semester}`)
                }
              >
                {paper.subject_name} (Sem {paper.semester}) — {paper.total_questions} Questions
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SubmittedList;
