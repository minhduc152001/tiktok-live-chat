const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Types.ObjectId,
      ref: "Room",
      required: [true, "Room info can not be empty"],
      index: true,
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
    },
    comment: {
      type: String,
      required: [true, "Comment can not be empty"],
    },
    msgId: {
      type: String,
      unique: true,
    },
    user: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: true,
    toObject: true,
  }
);

chatSchema.index({ comment: "text" });
chatSchema.index({ room: 1 });
chatSchema.index({ customer: 1 });
chatSchema.index({ user: 1, msgId: 1 }, { unique: true });

const ChatModel = mongoose.model("Chat", chatSchema);

module.exports = ChatModel;
