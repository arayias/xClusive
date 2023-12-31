const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
    unique: true,
  },

  // will be a salted hash of the password
  password: {
    type: String,
    required: true,
  },
  isMember: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
