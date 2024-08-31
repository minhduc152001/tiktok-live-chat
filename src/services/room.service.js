const RoomModel = require("../models/room.model");

class RoomService {
  static add = async (userId, roomId, owner, title, createTime) => {
    try {
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
    } catch (error) {
      return await this.get(roomId);
    }
  };

  static get = async (roomId) => {
    const room = await RoomModel.findOne({ roomId });
    return room;
  };

  static list = async (userId) => {
    const rooms = await RoomModel.find({
      user: userId,
      active: true,
    }).sort({ _id: -1 });

    return rooms;
  };

  static updateLiveEnds = async (displayId) => {
    await RoomModel.updateMany(
      { "owner.displayId": displayId },
      { isLive: false }
    );
  };

  static updateById = async (id, data) => {
    return await RoomModel.findByIdAndUpdate(id, data, { new: true });
  };
}

module.exports = RoomService;
