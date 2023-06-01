const express = require("express");
const userController = require("../controllers/user.controllers");
const router = express.Router();
router.route("/login").post(userController.Login);
router.post("/register", userController.Register);
module.exports = router;
