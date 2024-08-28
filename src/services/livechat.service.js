const ChatService = require("./chat.service");
const RoomService = require("./room.service");
const { WebcastPushConnection } = require("tiktok-live-connector");
const UserService = require("./user.service");

class LiveService {
  static startTrackLive =
    (addJob, jobIntervals) =>
    async ({ tiktokId, userId, jobId }) => {
      // Define new live connection
      let tiktokLiveConnection = new WebcastPushConnection(tiktokId);

      // Update job ID
      await UserService.updateJobIdForTiktokId({ userId, tiktokId, jobId });

      // Define room info
      let newRoom = {
        userId,
        roomId: undefined,
        owner: {
          displayId: tiktokId,
          nickname: tiktokId,
        },
        title: "",
        createTime: undefined,
      };

      let countAlreadyConnectingError = 0;

      let isLive = false;

      const intervalId = setInterval(async () => {
        jobIntervals[jobId] = intervalId;

        try {
          const roomInfo = await tiktokLiveConnection.getRoomInfo();
          tiktokLiveConnection
            .connect()
            .then(async (state) => {
              let roomId = roomInfo.id_str || state.roomId;
              isLive = true;

              console.info(
                `@${tiktokId} - Connected to room ID ${roomId}, state with roomInfoID:`,
                state.roomInfo.id
              );

              const owner = {
                displayId: tiktokId,
                nickname: roomInfo.owner?.nickname || tiktokId,
              };

              const { create_time: createTime, title } = roomInfo;

              newRoom.owner = owner;
              newRoom.roomId = roomId;
              newRoom.title = title || "";
              newRoom.createTime = createTime;
            })
            .catch(async (error) => {
              console.info(`Connection failed @${tiktokId}, ${error}`);

              const { create_time: createTime, finish_time: finishTime } =
                roomInfo;

              if (
                createTime !== finishTime &&
                error.message === "Already connected!"
              ) {
                console.info(
                  "👀 Live's online but start and end time are not same..."
                );

                await RoomService.updateLiveEnds(tiktokId);

                clearInterval(intervalId);

                console.info(`@${tiktokId}: Stopped, new job in 11 minute...`);

                setTimeout(async () => {
                  await addJob({ tiktokId, userId });
                }, 11 * 60 * 1000);
              } else if (error.message === "Already connecting!") {
                countAlreadyConnectingError++;

                if (countAlreadyConnectingError > 25) {
                  clearInterval(intervalId);

                  console.info(
                    `@${tiktokId}: Stopped interval, creating new job...`
                  );

                  await addJob({ tiktokId, userId });
                }
              } else if (error.message.includes("status code 429")) {
                clearInterval(intervalId);

                console.info(
                  `@${tiktokId}: 🫥 Starting handle error 429, start job after 11m...`
                );

                setTimeout(async () => {
                  await addJob({ tiktokId, userId });
                }, 11 * 60 * 1000);
              }
            });
        } catch (err) {
          console.info(`getRoomInfo failed @${tiktokId}, ${err.message}`);
          return;
        }
      }, 11000);

      tiktokLiveConnection.on("connected", async (state) => {
        let roomId;
        try {
          const owner = {
            displayId: tiktokId,
            nickname: state.roomInfo.owner?.nickname || tiktokId,
          };

          const { create_time: createTime, title } = state.roomInfo;

          newRoom.roomId = state.roomId;
          newRoom.owner = owner;
          newRoom.title = title || "";
          newRoom.createTime = createTime;
        } catch (error) {
          console.error("Error when storing new room:", error);
          newRoom = await RoomService.get(roomId);
        }
      });

      tiktokLiveConnection.on("chat", async (msg) => {
        try {
          if (newRoom.roomId) {
            newRoom = await RoomService.add({
              ...newRoom,
              createTime: newRoom.createTime || parseInt(Date.now() / 1000),
            });

            await ChatService.add({
              msg,
              room: newRoom._id,
              userId,
              liveTiktokId: tiktokId,
            });
          }
        } catch (error) {
          console.error("Error when adding new chat", error);
        }
      });

      tiktokLiveConnection.on("streamEnd", async () => {
        try {
          await RoomService.updateLiveEnds(tiktokId);

          if (isLive) {
            console.info(`@${tiktokId}: Live ended, stop & create new job!🔋`);

            clearInterval(intervalId);

            setTimeout(async () => {
              await addJob({ tiktokId, userId });
            }, 60 * 1000);
          }
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
