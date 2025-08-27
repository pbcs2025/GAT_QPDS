const express = require("express");
const db = require("../db");   // your db connection
const router = express.Router();

// Save a new question
router.post("/", (req, res) => {
  const { subject_code, subject_name, semester, question_number, question_text } = req.body;

  if (!subject_code || !subject_name || !semester || !question_number || !question_text) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check if already exists
  const checkSql = `
      SELECT id FROM question_bank 
      WHERE subject_code = ? AND semester = ? AND question_number = ?
  `;
  db.query(checkSql, [subject_code, semester, question_number], (err, results) => {
    if (err) {
      console.error("❌ Error checking data:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: "Question already exists" });
    }

    // Insert new question
    const insertSql = `
        INSERT INTO question_bank 
        (subject_code, subject_name, semester, question_number, question_text) 
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(insertSql, [subject_code, subject_name, semester, question_number, question_text], (err, result) => {
      if (err) {
        console.error("❌ Error inserting data:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "✅ Question saved successfully", id: result.insertId });
    });
  });
});

// (Optional) Fetch all questions
router.get("/", (req, res) => {
  const sql = "SELECT * FROM question_bank ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching questions:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ Export router
module.exports = router;
