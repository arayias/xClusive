const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");

exports.user_create_get = function (req, res, next) {
  res.render("user_signup_form");
};

exports.user_create_post = [
  body("username", "username must be above 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("username", "username must be unique").custom(async (value) => {
    const usernameExists = await User.findOne({ username: value });
    if (usernameExists) {
      return Promise.reject();
    }
    return Promise.resolve();
  }),
  body("password", "Password must be above 7 characters")
    .trim()
    .isLength({ min: 7 })
    .escape(),
  body("password2", "Passwords must match")
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .escape(),
  asyncHandler(async (req, res, next) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      const errors = validationResult(req);

      const user = new User({
        username: req.body.username,
        password: hashedPassword,
      });

      if (!errors.isEmpty()) {
        res.render("user_signup_form", {
          user: user,
          errors: errors.array(),
        });
      } else {
        await user.save();
        // req.session.user = user;
        res.redirect("/");
      }
    });
  }),
];

exports.user_login_get = function (req, res, next) {
  res.render("user_login_form", { title: "Login" });
};

exports.user_login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/user/login",
});

exports.user_logout_get = function (req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.user_permissions_get = function (req, res, next) {
  if (!req.user) {
    res.render("unathorized", {
      errors: [{ msg: "You must be logged in to view permissions" }],
    });
    return;
  }
  res.render("user_permissions_form");
};

exports.user_permissions_post = [
  body("permissions", "You must select one permission").isString().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    console.log(
      "permissions: " + JSON.stringify(req.body.permissions, null, 2),
      "errors: " + JSON.stringify(errors, null, 2),
      "user" + JSON.stringify(req.user, null, 2)
    );
    if (!errors.isEmpty()) {
      res.render("user_permissions_form", {
        errors: errors.array(),
      });
    } else {
      const user = await User.findById(req.user.id);
      switch (req.body.permissions) {
        case "admin":
          user.isAdmin = true;
          user.isMember = true;
          break;
        case "member":
          user.isAdmin = false;
          user.isMember = true;
          break;
        default:
          user.isAdmin = false;
          user.isMember = false;
          break;
      }
      await user.save();
      res.redirect("/");
    }
  }),
];
