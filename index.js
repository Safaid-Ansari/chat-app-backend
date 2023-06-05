const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoute = require("./routes/user.route");
const chatRoute = require("./routes/chat.route");
const messageRoute = require("./routes/message.route");
const colors = require("colors");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
dotenv.config();
const app = express();
const PORT = 8000;
connectDB();
app.use(express.json());
app.use(cors());
app.use("/api/user", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/message", messageRoute);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`our server listening on port", ${PORT}`.yellow.bold);
});
