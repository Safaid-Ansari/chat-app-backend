const asyncHandler = require("express-async-handler");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");

module.exports.accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(403).json({
      message: "userId param not send with request",
    });
  }

  let isChat = Chat.find({
    isGroupChat: false,
    $and: [
      {
        users: { $elemMatch: { $eq: req.user._id } },
        users: { $elemMatch: { $eq: userId } },
      },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage    .sender",
    select: "name email pic",
  });

  if (isChat.length > 0) {
    return res.status(200).json(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.find({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return res.status.json(fullChat);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
});

module.exports.fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name email pic",
        });
        return res.status(200).json(results);
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports.createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res
      .status(404)
      .json({ message: "Please fill out all the required fields" });
  }
  const users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "More than 2 users are required for group chat " });
  }

  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullGroupChat);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

module.exports.renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updateGroupChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updateGroupChat) {
    return res.status(404).json({
      message: "chat not found",
    });
  } else {
    return res.status(200).json(updateGroupChat);
  }
});

module.exports.addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const groupChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!groupChat) {
    return res.status(404).json({
      message: "UserId or ChatId not found",
    });
  } else {
    return res.status(200).json(groupChat);
  }
});
