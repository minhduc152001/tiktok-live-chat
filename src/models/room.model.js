const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: [true, "Room ID can not be empty"],
  },
  ownerId: {
    type: String,
    required: [true, "Owner ID can not be empty"],
  },
  ownerDisplayId: {
    type: String,
    required: [true, "Owner Unique ID can not be empty"],
  },
  ownerNickname: {
    type: String,
  },
});

const RoomModel = mongoose.model("Room", roomSchema);

module.exports = RoomModel;
