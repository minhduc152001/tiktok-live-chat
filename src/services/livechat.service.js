const { TikTokConnectionWrapper } = require("../utils/connectionWrapper");
const ChatService = require("./chat.service");
const RoomService = require("./room.service");

class LiveService {
  static startTrackLive = async (tiktokId, userId) => {
    const tiktokConnectionWrapper = new TikTokConnectionWrapper(
      tiktokId,
      {},
      true
    );

    let newRoom = undefined;

    // Connect to the given username (uniqueId)
    try {
      setInterval(() => {
        tiktokConnectionWrapper.connect();
      }, 5000);
    } catch (err) {
      console.error("tiktokDisconnected", err.toString());
      return;
    }

    // Redirect wrapper control events once
    tiktokConnectionWrapper.once("connected", async (state) => {
      let roomId;

      try {
        const owner = {
          displayId: state.roomInfo.owner.display_id,
          nickname: state.roomInfo.owner.nickname,
        };

        roomId = state.roomId;
        const { create_time: roomCreateTime, title } = state.roomInfo;

        newRoom = await RoomService.add(
          userId,
          roomId,
          owner,
          title,
          roomCreateTime
        );
      } catch (error) {
        console.error("Error when storing new room:", error);
        newRoom = await RoomService.get(roomId);
      }
    });

    tiktokConnectionWrapper.connection.on("chat", async (msg) => {
      // Store chat
      try {
        await ChatService.add(msg, newRoom.id, userId);
      } catch (error) {
        console.log("Error when adding new chat", error);
      }
    });
  };
}

module.exports = LiveService;
