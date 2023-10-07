const mongoose = require("mongoose");
const { Types } = mongoose;

const messageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 40,
  },
  contents: {
    type: String,
    required: true,
    minlength: 1,
  },
  author: {
    type: Types.ObjectId,
    ref: "User",
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.statics.create = function (title, contents, author) {
  const message = new this({
    title,
    contents,
    author,
  });
  return message.save();
};

messageSchema.virtual("url").get(function () {
  return `/messages/${this._id}`;
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
