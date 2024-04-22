const RoomModel = require("../models/room.model");

class RoomService {
  static add = async (userId, roomId, owner, createTime) => {
    const data = {
      user: userId,
      roomId,
      createTime: new Date(parseInt(createTime) * 1000),
      owner,
    };

    const room = await RoomModel.create(data);

    return room;
  };

  static get = async (roomId) => {
    return await RoomModel.findOne({ roomId });
  };

  static list = async (userId) => {
    const rooms = await RoomModel.find({
      user: userId,
    });

    return rooms;
  };
}

module.exports = RoomService;
