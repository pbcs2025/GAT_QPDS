const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
process.env['NODE_TLS_REJECT_UNAUTHORIZED']=0

const app = express();
const authRoutes = require("./routes/auth");
const questionBankRoutes = require("./routes/questionBank");


app.use(cors());
app.use(bodyParser.json());
app.use("/api", authRoutes);
app.use("/api/question-bank", questionBankRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
