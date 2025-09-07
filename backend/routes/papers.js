const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Get list of submitted papers
router.get("/submitted-list", (req, res) => {
  const sql = `
    SELECT 
      subject_code, 
      subject_name, 
      semester, 
      COUNT(*) AS total_questions,
      MAX(id) AS last_question_id
    FROM question_bank
    GROUP BY subject_code, subject_name, semester
    ORDER BY last_question_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching submitted list:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ Get full question paper by subject & semester
router.get("/paper/:subjectCode/:semester", (req, res) => {
  const { subjectCode, semester } = req.params;
  const sql = `
    SELECT question_number, question_text
    FROM question_bank
    WHERE subject_code = ? AND semester = ?
    ORDER BY question_number ASC
  `;
  db.query(sql, [subjectCode, semester], (err, results) => {
    if (err) {
      console.error("❌ Error fetching paper:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;
