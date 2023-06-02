const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chat.controller");
const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.post("/addToGroup", protect, addToGroup);
router.put("/removeFromGroup", protect, removeFromGroup);

module.exports = router;
