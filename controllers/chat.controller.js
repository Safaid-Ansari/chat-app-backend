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
      return res.status(400).json({
        message: error.message,
      });
    }
  }
});
