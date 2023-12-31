const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.message_create_get = function (req, res, next) {
  if (req.user) {
    res.render("message_create_form");
  } else {
    res.render("unathorized", {
      errors: [{ msg: "You must be logged in to create a message" }],
    });
  }
};

exports.message_create_post = [
  body("title", "Title must be above 3 characters").trim().isLength({ min: 3 }),
  body("message", "message must be above 3 characters")
    .trim()
    .isLength({ min: 3 }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      contents: req.body.message,
      timestamp: Date.now(),
      author: req.user._id,
    });

    if (!errors.isEmpty()) {
      res.render("message_create_form", {
        message: message,
        errors: errors.array(),
      });
    } else {
      await message.save();
      res.redirect("/");
    }
  }),
];

exports.message_detail_get = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id).populate("author");
  if (
    typeof req.user == "undefined" ||
    (!req.user?.isAdmin && !req.user?.isMember)
  ) {
    message.author.username = "🤫";
  }
  console.log(message);
  res.render("message_details", { message: message });
});

exports.message_delete_post = asyncHandler(async (req, res, next) => {
  console.log(req.params.id);
  const message = await Message.findByIdAndDelete(req.params.id);
  res.redirect("/");
});
