const asyncHandler = require("express-async-handler");
const Message = require("../model/messageModel");
const User = require("../model/userModel");
const Chat = require("../model/chatModel");

// @description     Get all Messages
// @route           GET /api/message/:chatId
// @access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    // Check if messages are found
    if (!messages) {
      res.status(404).json({ message: "No messages found" });
      return;
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @description     Create New Message
// @route           POST /api/message/
// @access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(400).json({ message: "Content and chatId are required" });
    return;
  }

  try {
    let newMessage = {
      sender: req.user._id,
      content,
      chat: chatId,
    };

    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update the latest message in the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = { allMessages, sendMessage };
