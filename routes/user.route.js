const express = require("express");
const userController = require("../controllers/user.controllers");
const protect = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", protect, userController.allUsers);
router.route("/login").post(userController.Login);
router.post("/register", userController.Register);
module.exports = router;
