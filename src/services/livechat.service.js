const ChatService = require("./chat.service");
const RoomService = require("./room.service");
const { WebcastPushConnection } = require("tiktok-live-connector");
const UserService = require("./user.service");
const { addJob } = require("../utils/addJob");

class LiveService {
  static startTrackLive = async ({ tiktokId, userId, jobId }) => {
    // Create live connector
    const tiktokLiveConnection = new WebcastPushConnection(tiktokId);

    // Update job ID
    await UserService.updateJobIdForTiktokId({
      userId,
      tiktokId,
      jobId,
    });

    let newRoom = undefined;

    // Connect to the given username (uniqueId)
    try {
      let countAlreadyConnectingError = 0;

      const intervalId = setInterval(async () => {
        tiktokLiveConnection
          .connect()
          .then(async (state) => {
            let roomId = state.roomId;

            console.log(`Connected to room ID ${roomId}`);

            const owner = {
              displayId: state.roomInfo.owner.display_id,
              nickname: state.roomInfo.owner.nickname,
            };

            const { create_time: roomCreateTime, title } = state.roomInfo;

            newRoom = await RoomService.add(
              userId,
              roomId,
              owner,
              title,
              roomCreateTime
            );
          })
          .catch(async (error) => {
            console.log(`Connection failed @${tiktokId}, ${error}`);

            if (error === "Already connecting!") {
              countAlreadyConnectingError++;

              if (countAlreadyConnectingError > 10) {
                clearInterval(intervalId);

                console.log(
                  `@${tiktokId}: Stopped interval, creating new job...`
                );

                const job = await addJob({
                  tiktokId,
                  userId,
                });

                // Update job ID
                await UserService.updateJobIdForTiktokId({
                  userId,
                  tiktokId,
                  jobId: job.id,
                });
              }
            }
          });
      }, 11000);
    } catch (err) {
      console.error("tiktokDisconnected", err.toString());
      return;
    }

    // Redirect wrapper control events once
    tiktokLiveConnection.on("connected", async (state) => {
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

    tiktokLiveConnection.on("chat", async (msg) => {
      // Store chat
      try {
        await ChatService.add(msg, newRoom._id, userId);
      } catch (error) {
        console.log("Error when adding new chat", error);
      }
    });

    tiktokLiveConnection.on(
      "streamEnd",
      async () => await RoomService.update({ id: newRoom._id, isLive: false })
    );

    tiktokLiveConnection.on("error", (err) => {
      console.error(
        `@${tiktokId} - Error event triggered: ${err.info}, ${err.exception}`
      );
    });
  };
}

module.exports = LiveService;
