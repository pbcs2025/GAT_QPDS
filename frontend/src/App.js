// src/components/Qp1.js
import React, { useState } from "react";

function Qp1() {
  const [formData, setFormData] = useState({});

  const handleChange = (module, q, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [q]: {
          ...prev[module]?.[q],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = () => {
    alert("Submitted to Admin!");
    console.log(formData);
  };

  const handleArchive = () => {
    alert("Archived Successfully!");
    console.log(formData);
  };

  const renderQuestionRow = (module, q) => (
    <tr key={`${module}-${q}`}>
      <td>{q}</td>
      <td>
        <input
          type="text"
          placeholder="Enter question"
          onChange={(e) => handleChange(module, q, "question", e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          placeholder="Marks"
          onChange={(e) => handleChange(module, q, "marks", e.target.value)}
        />
      </td>
      <td>
        <select onChange={(e) => handleChange(module, q, "level", e.target.value)}>
          <option value="">Select</option>
          <option value="L1">L1</option>
          <option value="L2">L2</option>
          <option value="L3">L3</option>
          <option value="L4">L4</option>
          <option value="L5">L5</option>
          <option value="L6">L6</option>
        </select>
      </td>
      <td>
        <select onChange={(e) => handleChange(module, q, "co", e.target.value)}>
          <option value="">Select</option>
          <option value="CO1">CO1</option>
          <option value="CO2">CO2</option>
          <option value="CO3">CO3</option>
          <option value="CO4">CO4</option>
          <option value="CO5">CO5</option>
        </select>
      </td>
      <td>
        <input
          type="checkbox"
          onChange={(e) => handleChange(module, q, "checked", e.target.checked)}
        />
      </td>
      <td>
        {!formData[module]?.[q]?.checked && (
          <input
            type="text"
            placeholder="Remarks"
            onChange={(e) => handleChange(module, q, "remarks", e.target.value)}
          />
        )}
      </td>
    </tr>
  );

  const modules = [
    { name: "Module 1", qs: ["1a", "1b", "OR", "2a", "2b"] },
    { name: "Module 2", qs: ["3a", "3b", "OR", "4a", "4b"] },
    { name: "Module 3", qs: ["5a", "5b", "OR", "6a", "6b"] },
    { name: "Module 4", qs: ["7a", "7b", "OR", "8a", "8b"] },
    { name: "Module 5", qs: ["9a", "9b", "OR", "10a", "10b"] },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Question Paper 1</h2>
      {modules.map((mod, idx) => (
        <div key={idx} style={{ marginBottom: "30px" }}>
          <h3>{mod.name}</h3>
          <table border="1" cellPadding="10" width="100%">
            <thead>
              <tr>
                <th>Q.No</th>
                <th>Question</th>
                <th>Marks</th>
                <th>Level</th>
                <th>Course Outcome</th>
                <th>Checkbox</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {mod.qs.map((q) =>
                q === "OR" ? (
                  <tr key={`${mod.name}-or`}>
                    <td colSpan="7" style={{ textAlign: "center", fontWeight: "bold" }}>
                      OR
                    </td>
                  </tr>
                ) : (
                  renderQuestionRow(mod.name, q)
                )
              )}
            </tbody>
          </table>
        </div>
      ))}
      <button onClick={handleSubmit} style={{ marginRight: "10px" }}>
        Submit
      </button>
      <button onClick={handleArchive}>Archive</button>
    </div>
  );
}

export default Qp1;
