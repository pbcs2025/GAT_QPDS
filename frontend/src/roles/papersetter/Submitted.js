import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../common/dashboard.css";

function Submitted() {
  const { subjectCode, semester } = useParams();
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/paper/${subjectCode}/${semester}`)
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("❌ Error:", err));
  }, [subjectCode, semester]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📘 Question Paper</h2>
      <h3>{subjectCode} - Semester {semester}</h3>
      <ol>
        {questions.map((q, index) => (
          <li key={index}>
            <strong>{q.question_number}:</strong> {q.question_text}
          </li>
        ))}
      </ol>
      <button
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "gray",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
        onClick={() => navigate(-1)}
      >
        🔙 Back
      </button>
    </div>
  );
}

export default Submitted;
