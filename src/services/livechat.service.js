const UserModel = require("../models/user.model");
const ChatService = require("./chat.service");
const RoomService = require("./room.service");
const {
  WebcastPushConnection,
  signatureProvider,
} = require("tiktok-live-connector");

class LiveService {
  static startTrackLive = async ({ tiktokId, userId }) => {
    // Check tiktokId belongs to this user
    const user = await UserModel.findById(userId);
    if (!user?.tiktokIds.includes(tiktokId))
      throw new Error("This tiktok ID does not belong to you!");

    // Define new live connection
    let tiktokLiveConnection = new WebcastPushConnection(tiktokId);
    signatureProvider.config.extraParams.apiKey = process.env.TIKTOK_API_KEY;

    // Define room info
    let newRoom = undefined;

    try {
      const roomInfo = await tiktokLiveConnection.getRoomInfo();

      tiktokLiveConnection
        .connect()
        .then(async (state) => {
          let roomId = roomInfo.id_str || state.roomId;

          console.info(
            `@${tiktokId} - Connected to room ID ${roomId}, state with roomInfoID:`,
            state.roomInfo.id
          );

          const owner = {
            displayId: tiktokId,
            nickname: roomInfo.owner?.nickname || tiktokId,
          };

          const { create_time: roomCreateTime, title } = roomInfo;

          newRoom = await RoomService.add(
            userId,
            roomId,
            owner,
            title || "",
            roomCreateTime || parseInt(Date.now() / 1000)
          );
        })
        .catch(async (error) => {
          console.info(`Connection failed @${tiktokId}, ${error}`);

          const { create_time: createTime, finish_time: finishTime } = roomInfo;

          if (
            createTime !== finishTime &&
            error.message === "Already connected!"
          ) {
            console.info(
              "👀 Live's online but start and end time are not same..."
            );

            await RoomService.updateLiveEnds(tiktokId);
          } else if (error.message.includes("status code 429")) {
            console.info(
              `@${tiktokId}: You spam so many requests, try later in 15 minutes!`
            );
          }
        });
    } catch (err) {
      console.info(`getRoomInfo failed @${tiktokId}, ${err.message}`);
      return;
    }

    // tiktokLiveConnection.on("connected", async (state) => {
    //   let roomId;
    //   try {
    //     const owner = {
    //       displayId: tiktokId,
    //       nickname: state.roomInfo.owner?.nickname || tiktokId,
    //     };

    //     roomId = state.roomId;
    //     const { create_time: roomCreateTime, title } = state.roomInfo;

    //     newRoom = await RoomService.add(
    //       userId,
    //       roomId,
    //       owner,
    //       title || "",
    //       roomCreateTime || parseInt(Date.now() / 1000)
    //     );
    //     console.log("newRoom on connected:", newRoom);
    //   } catch (error) {
    //     console.error("Error when storing new room:", error);
    //     newRoom = await RoomService.get({ roomId, userId });
    //     console.log("newRoom on connected catch:", newRoom);
    //   }
    // });

    tiktokLiveConnection.on("chat", async (msg) => {
      try {
        const roomObjectId = newRoom._id;

        // Add new chat
        await ChatService.add({
          msg,
          room: roomObjectId,
          userId,
          liveTiktokId: tiktokId,
        });
      } catch (error) {
        console.error("Error when adding new chat", error);
      }
    });

    tiktokLiveConnection.on("streamEnd", async () => {
      try {
        await RoomService.updateLiveEnds(tiktokId);
      } catch (error) {
        console.error("Error when stream ends", error);
      }
    });

    tiktokLiveConnection.on("error", (err) => {
      console.error(
        `@${tiktokId} - Error event triggered: ${err.info}, ${err.exception}`
      );
    });
  };
}

module.exports = LiveService;
