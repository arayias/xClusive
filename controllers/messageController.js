const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.message_create_get = function (req, res, next) {
  res.render("message_create_form");
};

exports.message_create_post = [
  body("title", "Title must be above 3 characters").trim().isLength({ min: 3 }),
  body("message", "message must be above 3 characters")
    .trim()
    .isLength({ min: 3 }),
];
