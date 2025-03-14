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
        active: true,
      };

      const room = await RoomModel.create(data);

      return room;
    } catch (error) {
      console.error("error adding room:", error);
      return await this.get({ roomId, userId });
    }
  };

  static get = async ({ roomId, userId }) => {
    const room = await RoomModel.findOne({ roomId, user: userId });
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
