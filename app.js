const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/user");
const messageRouter = require("./routes/message");
require("dotenv").config();

const app = express();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// NOTE STRATEGIES ONLY CHECK FOR USERNAME AND PASSWORD FIELDS
// FOR CUSTOM FIELDS, USE LocalStrategy({usernameField: "email", passwordField: "password"})
// ...
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("Authenticating");
      const user = await User.findOne({ username: username });
      const match = await bcrypt.compare(password, user.password);
      if (!user) {
        console.log("Incorrect username");
        return done(null, false, { message: "Incorrect username" });
      }
      if (!match) {
        console.log("Incorrect password");
        return done(null, false, { message: "Incorrect password" });
      }
      console.log("Successfully authenticated");
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  console.log("Serializing user");
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user");
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  // res.locals.isLoggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  // res.locals.isUserAdmin = req.user?.admin;
  // res.locals.isUserMember = req.user?.member;
  // res.locals.path = req.path;
  next();
});
app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/message", messageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
