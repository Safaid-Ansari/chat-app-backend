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
const PORT = process.env.PORT || 5000;
connectDB();
app.use(express.json());
app.use(cors());
app.use("/api/user", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/message", messageRoute);
app.get("/", (req, res) => {
  res.send("Hey there");
});
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`our server listening on port", ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 6000,
  cors: {
    origin: "https://chat-application-q25n.onrender.com",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to IO socket");

  socket.on("setup", (user) => {
    socket.join(user._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room", room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat user not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(user._id);
  });
});
