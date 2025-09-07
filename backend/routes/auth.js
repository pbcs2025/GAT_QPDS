const express = require("express");
const router = express.Router();
const db = require("../db");
const crypto = require("crypto");
const sendEmail = require('../utils/mailer');


// Generate unique username
async function generateUniqueUsername(baseName) {
  let username, isUnique = false;
  while (!isUnique) {
    const rand = Math.floor(100 + Math.random() * 900);
    username = `${baseName}${rand}`;
    const [rows] = await db.promise().query(
      "SELECT * FROM faculty_registration_data WHERE username = ?", [username]
    );
    if (rows.length === 0) isUnique = true;
  } 
  return username;
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { username: baseName, clgName, deptName, email, phoneNo } = req.body;
    const username = await generateUniqueUsername(baseName.toLowerCase());
    const name = baseName;
    const password = crypto.randomBytes(4).toString("hex");

    const sql = `INSERT INTO faculty_registration_data 
      (name, username, clgName, deptName, email, phoneNo, password,usertype) 
      VALUES (?, ?, ?, ?, ?, ?, ?,?)`;

    db.query(sql, [name, username, clgName, deptName, email, phoneNo, password,'internal'], async (err) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ error: "Database insert failed" });
      }
      console.log("Sending email to:", email);
     try { await sendEmail(
      email,
      "Welcome to GAT Portal","",
      `<p>Hi ${baseName},<br><br>Your username: ${username}<br>Password: ${password}<br>Please change your password after logging in.</p>`  
    );
    } catch (mailError) {
  console.error("Failed to send email:", mailError);
}
      res.status(201).json({ message: "Registration successful", credentials: { username, password } });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM faculty_registration_data WHERE username = ? AND password = ?", [username, password]
    );

    if (rows.length > 0) {
      res.status(200).json({ message: "Login successful", username });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  console.log(req.body);
  const { username, oldPassword, newPassword } = req.body;
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM faculty_registration_data WHERE username = ? AND password = ?", [username, oldPassword]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    await db.promise().query(
      "UPDATE faculty_registration_data SET password = ? WHERE username = ?", [newPassword, username]
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Get all faculty registrations
router.get("/users", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM faculty_registration_data where usertype='internal'");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get all external faculty registrations
router.get("/externalusers", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM faculty_registration_data where usertype='external' order by id desc");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// External Register
router.post("/externalregister", async (req, res) => {
  try {
    const { username: baseName, clgName, deptName, email, phoneNo } = req.body;

    // Validate input
    if (!baseName || !clgName || !deptName || !email || !phoneNo) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const username = await generateUniqueUsername(baseName.toLowerCase());
    const name = baseName;
    const password = crypto.randomBytes(4).toString("hex");

    const sql = `INSERT INTO faculty_registration_data 
      (name, username, clgName, deptName, email, phoneNo, password , usertype) 
      VALUES (?, ?, ?, ?, ?, ?, ?,?)`;

    db.query(sql, [name, username, clgName, deptName, email, phoneNo, password,'external'], (err) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ error: "Database insert failed" });
      }

      res.status(201).json({
        message: "Registration successful",
        credentials: { username, password },
      });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Assign QP Setter 
router.post("/assignQPSetter", async (req, res) => {
  const { emails, subjectCode, submitDate } = req.body;

  console.log("Assign QP Setter called with:", emails, subjectCode, submitDate);

  // Validation
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "No emails provided" });
  }
  if (!subjectCode) {
    return res.status(400).json({ error: "Subject code missing" });
  }
  if (!submitDate) {
    return res.status(400).json({ error: "Submission date missing" });
  }

  try {
    // Avoid duplicates by checking before inserting
    const insertPromises = emails.map(async (email) => {
      // Check if already assigned
      const [existing] = await db.promise().query(
        `SELECT id FROM qp_setters WHERE email = ? AND subject_code = ?`,
        [email, subjectCode]
      );

      if (existing.length > 0) {
        console.log(`Skipping duplicate: ${email} already assigned to ${subjectCode}`);
        return null; // Skip insert
      }

      console.log(`Inserting: ${email} -> ${subjectCode}`);
      return db.promise().query(
        `INSERT INTO qp_setters (email, subject_code, submit_date) VALUES (?, ?, ?)`,
        [email, subjectCode, submitDate]
      );
    });

    await Promise.all(insertPromises);

    res.status(200).json({ message: "QP setters assigned successfully" });
  } catch (err) {
    console.error("Error assigning QP setters:", err);
    res.status(500).json({ error: "Failed to assign QP setters" });
  }
});


// Get all assigned QP setters grouped by subject_code
router.get("/assignedSubjects", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT qp.id, qp.email, qp.subject_code, qp.submit_date, qp.assigned_at,
              frd.name, frd.clgName, frd.deptName
       FROM qp_setters qp
       JOIN faculty_registration_data frd ON qp.email = frd.email
       ORDER BY qp.subject_code, qp.submit_date DESC`
    );

    // Group by subject_code
    const grouped = {};
    rows.forEach((row) => {
      if (!grouped[row.subject_code]) {
        grouped[row.subject_code] = {
          subject_code: row.subject_code,
          submit_date: row.submit_date,
          assigned_at: row.assigned_at,
          assignees: []
        };
      }
      grouped[row.subject_code].assignees.push({
        id: row.id,
        name: row.name,
        clgName: row.clgName,
        deptName: row.deptName,
        email: row.email
      });
    });

    // Convert grouped object to array for frontend
    const result = Object.values(grouped);

    res.json(result);
  } catch (err) {
    console.error("Error fetching assigned subjects:", err);
    res.status(500).json({ error: "Failed to fetch assigned subjects" });
  }
});

// GET assignments for a single subject code
router.get("/assignments/:subjectCode", async (req, res) => {
  const subjectCode = req.params.subjectCode;

  try {
    const [rows] = await db.promise().query(
      `SELECT qp.id, qp.email, qp.subject_code, qp.submit_date, qp.assigned_at,
              frd.name as facultyName, frd.clgName, frd.deptName
       FROM qp_setters qp
       JOIN faculty_registration_data frd ON qp.email = frd.email
       WHERE qp.subject_code = ?
       ORDER BY qp.submit_date DESC`,
      [subjectCode]
    );

    // Normalize shape for frontend
    const result = rows.map(r => ({
      id: r.id,
      email: r.email,
      subjectCode: r.subject_code,
      submitDate: r.submit_date,
      assignedAt: r.assigned_at,
      facultyName: r.facultyName,
      clgName: r.clgName,
      deptName: r.deptName,
      //done: !!r.done // fallback to false if null/undefined
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({
      error: "Failed to fetch assignments. Please try again later."
    });
  }
});

// ================= Subjects Management =================

// Get all subjects grouped (frontend will group them)
router.get("/subjects", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM subjects ORDER BY department, semester, subject_code");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});


// Add a new subject
router.post("/subjects", async (req, res) => {
  const { subject_code, subject_name, department, semester, credits } = req.body;
console.log(req.body);
  if (!subject_code || !subject_name || !department || !semester || !credits) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await db.promise().query(
      `INSERT INTO subjects (subject_code, subject_name, department, semester, credits) VALUES (?, ?, ?, ?, ?)`,
      [subject_code, subject_name, department, semester, credits]
    );
    res.status(201).json({ message: "Subject added successfully" });
  } catch (err) {
    console.error("Error adding subject:", err);
    res.status(500).json({ error: "Failed to add subject" });
  }
});

// Update subject
router.put("/subjects/:id", async (req, res) => {
  const { id } = req.params;
  const { subject_code, subject_name, department, semester, credits } = req.body;

  try {
    await db.promise().query(
      `UPDATE subjects SET subject_code=?, subject_name=?, department=?, semester=?, credits=? WHERE id=?`,
      [subject_code, subject_name, department, semester, credits, id]
    );
    res.json({ message: "Subject updated successfully" });
  } catch (err) {
    console.error("Error updating subject:", err);
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// Delete subject
router.delete("/subjects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query(`DELETE FROM subjects WHERE id=?`, [id]);
    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("Error deleting subject:", err);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

// Get all subject codes in select QP setters section
router.get("/subject-codes", (req, res) => {
  const sql = "SELECT subject_code FROM subjects";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results.map(row => row.subject_code));
  });
});

// ================= Departments Management =================

// Get all departments
router.get("/departments", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT * FROM departments ORDER BY department");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});


// Add a new department
router.post("/departments", async (req, res) => {
  const { department } = req.body;
  if (!department) {
    return res.status(400).json({ error: "Department name is required" });
  }

  try {
    await db.promise().query(
      "INSERT INTO departments (department) VALUES (?)",
      [department]
    );
    res.status(201).json({ message: "Department added successfully" });
  } catch (err) {
    console.error("Error adding department:", err);
    res.status(500).json({ error: "Failed to add department" });
  }
});

// Update department
router.put("/departments/:department", async (req, res) => {
  const { department } = req.params; // old department name (primary key)
  const { newDepartment } = req.body; // new name

  if (!newDepartment) {
    return res.status(400).json({ error: "New department name is required" });
  }

  try {
    await db.promise().query(
      "UPDATE departments SET department=? WHERE department=?",
      [newDepartment, department]
    );
    res.json({ message: "Department updated successfully" });
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ error: "Failed to update department" });
  }
});

// Delete department
router.delete("/departments/:department", async (req, res) => {
  const { department } = req.params;

  try {
    await db.promise().query("DELETE FROM departments WHERE department=?", [department]);
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ error: "Failed to delete department" });
  }
});

// ================= Verifier Login =================
router.post("/verifier/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM verifier_data WHERE userid = ? AND password = ?",
      [username, password]
    );

    if (rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Verifier login successful",
        user: {
          id: rows[0].id,
          userid: rows[0].userid,
          department: rows[0].department,
        },
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid verifier credentials" });
    }
  } catch (err) {
    console.error("Verifier login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// ================= Semester -> Subjects (Filtered by Department) =================

// Get unique semesters
router.get("/semesters", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT DISTINCT semester FROM subjects ORDER BY semester"
    );
    res.json(rows.map(row => row.semester));
  } catch (err) {
    console.error("Error fetching semesters:", err);
    res.status(500).json({ error: "Failed to fetch semesters" });
  }
});

// Get subjects for a given semester and department
router.get("/subjects/:semester/:department", async (req, res) => {
  const { semester, department } = req.params;
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM subjects WHERE semester = ? AND department = ? ORDER BY subject_code",
      [semester, department]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching subjects by semester and department:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});


module.exports = router;




module.exports = router;
