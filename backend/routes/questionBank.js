// routes/questionBank.js
const express = require("express");
const db = require("../db");   // ✅ DB connection file
const router = express.Router();

/**
 * @route   POST /api/questionbank
 * @desc    Save a new question
 */
router.post("/", (req, res) => {
  const { subject_code, subject_name, semester, question_number, question_text } = req.body;

  // ✅ Validation
  if (!subject_code || !subject_name || !semester || !question_number || !question_text) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // ✅ Check if the question already exists
  const checkSql = `
    SELECT id FROM question_bank 
    WHERE subject_code = ? AND semester = ? AND question_number = ?
  `;

  db.query(checkSql, [subject_code, semester, question_number], (err, results) => {
    if (err) {
      console.error("❌ Error checking existing question:", err);
      return res.status(500).json({ error: "Database error while checking" });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: "⚠️ Question already exists for this subject & semester" });
    }

    // ✅ Insert new question
    const insertSql = `
      INSERT INTO question_bank 
      (subject_code, subject_name, semester, question_number, question_text) 
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [subject_code, subject_name, semester, question_number, question_text],
      (err, result) => {
        if (err) {
          console.error("❌ Error inserting question:", err);
          return res.status(500).json({ error: "Database error while inserting" });
        }

        res.status(201).json({
          message: "✅ Question saved successfully",
          id: result.insertId,
        });
      }
    );
  });
});

/**
 * @route   GET /api/questionbank
 * @desc    Fetch all questions
 */
router.get("/", (req, res) => {
  const sql = "SELECT * FROM question_bank ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching questions:", err);
      return res.status(500).json({ error: "Database error while fetching" });
    }

    res.json(results);
  });
});

/**
 * @route   GET /api/questionbank/:id
 * @desc    Fetch single question by ID
 */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM question_bank WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching question:", err);
      return res.status(500).json({ error: "Database error while fetching single question" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(results[0]);
  });
});

/**
 * @route   DELETE /api/questionbank/:id
 * @desc    Delete a question
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM question_bank WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting question:", err);
      return res.status(500).json({ error: "Database error while deleting" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({ message: "🗑️ Question deleted successfully" });
  });
});

/* ---------- existing routes here (POST /, GET /, GET /:id, DELETE /:id) ---------- */

/**
 * @route   GET /api/question-bank/submitted-list
 * @desc    Distinct list of submitted papers (grouped by subject & semester)
 */
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

/**
 * @route   GET /api/question-bank/submitted
 * @desc    All questions for a given subject & semester (detail view)
 * @query   subject_code, semester
 */
router.get("/submitted", (req, res) => {
  const { subject_code, semester } = req.query;

  if (!subject_code || !semester) {
    return res
      .status(400)
      .json({ error: "subject_code and semester are required" });
  }

  const sql = `
    SELECT id, subject_code, subject_name, semester, question_number, question_text
    FROM question_bank
    WHERE subject_code = ? AND semester = ?
    ORDER BY question_number ASC
  `;
  db.query(sql, [subject_code, semester], (err, results) => {
    if (err) {
      console.error("❌ Error fetching submitted questions:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ Export router
module.exports = router;
