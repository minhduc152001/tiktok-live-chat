const RoomModel = require("../models/room.model");

class RoomService {
  static add = async (userId, roomId, owner, title, createTime) => {
    const data = {
      user: userId,
      roomId,
      owner,
      title,
      createTime: new Date(parseInt(createTime) * 1000),
      isLive: true,
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

  static update = async (data) => {
    const { id, ...rest } = data;
    const room = await RoomModel.findByIdAndUpdate(id, rest, { new: true });

    return room;
  };
}

module.exports = RoomService;
