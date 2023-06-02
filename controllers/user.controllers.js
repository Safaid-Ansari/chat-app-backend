const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");
module.exports.Register = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please enter all the required fields ",
    });
  }

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: encryptedPassword,
    pic,
  });

  if (user) {
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return res.status(400).json({
      message: "Failed to create a new user",
    });
  }
});

module.exports.Login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  const checkPassword = await bcrypt.compare(password, user.password);

  if (user && checkPassword) {
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return res.status(403).json({
      message: "Invalid username  or password",
    });
  }
};

module.exports.allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  return res.status(200).json(users);
};
