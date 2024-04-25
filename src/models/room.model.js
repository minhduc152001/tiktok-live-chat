const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: [true, "Room ID can not be empty"],
    unique: true,
  },
  title: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "User ID can not be empty"],
  },
  owner: {
    type: {
      displayId: String,
      nickname: String,
      _id: false,
    },
    required: [true, "Owner info can not be empty"],
  },
  createTime: {
    type: Date,
  },
});

const RoomModel = mongoose.model("Room", roomSchema);

module.exports = RoomModel;
