// server.js
const express = require("express");
const cors = require("cors");
const bodyParser=require("body-parser");
const dotenv = require("dotenv");
const db = require("./db"); // ✅ your db.js
const subjectRoutes = require("./routes/subjects"); // ✅ check path
const semesterRoutes = require("./routes/semesters"); // ✅ check path
const authRoutes=require("./routes/auth");
const questionBankRoutes = require("./routes/questionBank");
const paperRoutes = require("./routes/papers");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


// Routes
app.use("/api/subject", subjectRoutes);
app.use("/api/semester", semesterRoutes);
app.use("/api", authRoutes);
app.use("/api/question-bank", questionBankRoutes);
app.use("/api", paperRoutes);


// Health check route
app.get("/", (req, res) => {
  res.send("🚀 Backend server is running!");
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
