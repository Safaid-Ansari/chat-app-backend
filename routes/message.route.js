const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
const messageController = require("../controllers/message.controller");
router.post("/", protect, messageController.sendMessage);
router.get("/:chatId", protect, messageController.allMessages);
module.exports = router;
