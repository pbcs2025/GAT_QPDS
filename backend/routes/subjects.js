// routes/subjects.js
const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:semesterId", (req, res) => {
   const { semesterId } = req.params;
  const sql = "SELECT id, code, name FROM subject WHERE semester_id = ?";
  db.query(sql, [semesterId], (err, results) => {
    if (err) {
      console.error("Error fetching subjects:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;  // 👈 VERY IMPORTANT
