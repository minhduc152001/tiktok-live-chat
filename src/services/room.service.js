const RoomModel = require("../models/room.model");

class RoomService {
  static add = async ({ userId, roomId, owner, title, createTime }) => {
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
      if (error.code === 11000) return await this.get(roomId);
      else
        console.error(`❌ Failed to add new room @${owner.displayId}`, error);
    }
  };

  static get = async (roomId) => {
    return await RoomModel.findOne({ roomId });
  };

  static list = async (userId) => {
    const rooms = await RoomModel.find({
      user: userId,
    }).sort({ _id: -1 });

    return rooms;
  };

  static updateLiveEnds = async (displayId) => {
    await RoomModel.updateMany(
      { "owner.displayId": displayId },
      { isLive: false }
    );
  };
}

module.exports = RoomService;
