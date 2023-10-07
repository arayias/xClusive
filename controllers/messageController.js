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
