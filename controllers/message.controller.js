const asyncHandler = require("express-async-handler");
const Message = require("../models/message.model");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");
module.exports.sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    return res.status(404).json({
      message: "Invalid data passed into request",
    });
  }

  let newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name email pic",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

module.exports.allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email pic")
      .populate("chat");

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});
