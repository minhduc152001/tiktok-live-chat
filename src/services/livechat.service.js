const ChatService = require("./chat.service");
const RoomService = require("./room.service");
const { WebcastPushConnection } = require("tiktok-live-connector");
const UserService = require("./user.service");

class LiveService {
  static startTrackLive =
    (addJob) =>
    async ({ tiktokId, userId, jobId }) => {
      let tiktokLiveConnection = new WebcastPushConnection(tiktokId);

      await UserService.updateJobIdForTiktokId({ userId, tiktokId, jobId });

      let newRoom = undefined;

      let countAlreadyConnectingError = 0;

      const intervalId = setInterval(async () => {
        try {
          const roomInfo = await tiktokLiveConnection.getRoomInfo();

          tiktokLiveConnection
            .connect()
            .then(async (state) => {
              let roomId = roomInfo.id_str;

              console.log(
                `Connected to room ID ${roomId}, state:`,
                JSON.stringify(state)
              );

              const owner = {
                displayId: roomInfo.owner.display_id,
                nickname: roomInfo.owner.nickname,
              };

              const { create_time: roomCreateTime, title } = roomInfo;

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

              const { create_time: createTime, finish_time: finishTime } =
                roomInfo;

              if (
                createTime !== finishTime &&
                error.message === "Already connected!"
              ) {
                console.log(
                  "👀 Live's online but start and end time are not same..."
                );

                await RoomService.update({ id: newRoom?._id, isLive: false });

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

                console.log(
                  `@${tiktokId}: 🫥 Starting handle error 429, start job after 11m...`
                );

                setTimeout(async () => {
                  await addJob({ tiktokId, userId });
                }, 11 * 60 * 1000);
              }
            });
        } catch (err) {
          console.log(`getRoomInfo failed @${tiktokId}, ${err.message}`);
          return;
        }
      }, 11000);

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
