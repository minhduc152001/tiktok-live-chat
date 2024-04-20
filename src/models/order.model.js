const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    room: {
      type: {
        roomId: String,
        createTime: Date,
        _id: false,
      },
      // ref: "Room",
      required: [true, "Room info can not be empty"],
    },
    owner: {
      type: {
        displayId: String,
        nickname: String,
        _id: false,
      },
      required: [true, "Owner info can not be empty"],
    },
    user: {
      type: String, // mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User ID can not be empty"],
    },
    comment: {
      type: String,
      required: [true, "Comment can not be empty"],
    },
    viewerUniqueId: {
      type: String,
      required: [true, "Viewer unique ID can not be empty"],
    },
    nickname: {
      type: String,
    },
    msgId: {
      type: String,
      unique: true,
    },
  },
  {
    toJSON: true,
    toObject: true,
  }
);

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
