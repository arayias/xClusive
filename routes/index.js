const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const Message = require("../models/message");

/* GET home page. */
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const messages = await Message.find().sort({ time: -1 }).populate("author");

    messages.map((message) => {
      message.time = message.time.toLocaleString();
      message.author.username = "🤫";
      //
    });
    res.render("index", { messages: messages });
  })
);

module.exports = router;
