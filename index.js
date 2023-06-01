const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config();

const app = express();
const PORT = 8000;

connectDB();
app.listen(PORT, () => {
  console.log("our server listening on port", PORT);
});
