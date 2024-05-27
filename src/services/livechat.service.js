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
                console.info("Live has ENDED, creating new job in 1 minute...");

                setTimeout(async () => {
                  await addJob({ tiktokId, userId });
                }, 60 * 1000);
              }

              if (error.message === "Already connecting!") {
                countAlreadyConnectingError++;

                if (countAlreadyConnectingError > 15) {
                  clearInterval(intervalId);

                  console.info(
                    `@${tiktokId}: Stopped interval, creating new job...`
                  );

                  await addJob({ tiktokId, userId });
                }
              }

              // if (error.message.includes("display_id")) {
              //   clearInterval(intervalId);

              //   console.log(
              //     `@${tiktokId}: 🫥 Starting handle error display_id...`
              //   );

              // setTimeout(async () => {
              //   await addJob({ tiktokId, userId });
              // }, 11 * 60 * 1000);
              // }
            });
        } catch (err) {
          console.log(`getRoomInfo failed @${tiktokId}, ${err.message}`);
          return;
        }
      }, 11000);

      tiktokLiveConnection.on("connected", async (state) => {
        newRoom = await RoomService.get(state.roomId);
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
