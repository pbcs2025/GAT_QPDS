const express = require("express");
const db = require("../db"); // DB connection
const router = express.Router();
const multer = require("multer");

// Multer config for file uploads (store in memory for DB insert)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Save a new question
router.post("/", upload.single("file"), (req, res) => {
  const { subject_code, subject_name, semester, question_number, question_text } = req.body;
  const file = req.file;

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
      console.error("❌ Error checking data:", err.sqlMessage || err);
      return res.status(500).json({ error: "Database error", details: err.sqlMessage || err });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: "Question already exists" });
    }

    // Insert query
    const insertSql = `
        INSERT INTO question_bank 
        (subject_code, subject_name, semester, question_number, question_text, file_name, file_type, question_file) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertSql,
      [
        subject_code,
        subject_name,
        semester,
        question_number,
        question_text,
        file ? file.originalname : null,
        file ? file.mimetype : null,
        file ? file.buffer : null,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Error inserting data:", err.sqlMessage || err);
          return res.status(500).json({ error: "Database error", details: err.sqlMessage || err });
        }
        res.json({ message: "✅ Question saved successfully", id: result.insertId });
      }
    );
  });
});

// Fetch all questions (with file URL if available)
router.get("/", (req, res) => {
  const sql = `
    SELECT id, subject_code, subject_name, semester, question_number, question_text, 
           file_name, file_type 
    FROM question_bank 
    ORDER BY id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching questions:", err.sqlMessage || err);
      return res.status(500).json({ error: "Database error", details: err.sqlMessage || err });
    }

    const withUrls = results.map(q => ({
      ...q,
      file_url: q.file_name ? `http://localhost:5000/api/question-bank/file/${q.id}` : null,
    }));

    res.json(withUrls);
  });
});

// Serve file by ID
router.get("/file/:id", (req, res) => {
  const sql = "SELECT file_name, file_type, question_file FROM question_bank WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching file:", err.sqlMessage || err);
      return res.status(500).json({ error: "Database error", details: err.sqlMessage || err });
    }
    if (results.length === 0) return res.status(404).json({ error: "File not found" });

    const file = results[0];
    res.setHeader("Content-Type", file.file_type);
    res.setHeader("Content-Disposition", `inline; filename=${file.file_name}`);
    res.send(file.question_file);
  });
});

module.exports = router;
