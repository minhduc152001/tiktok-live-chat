const ChatService = require("./chat.service");
const RoomService = require("./room.service");
const { WebcastPushConnection } = require("tiktok-live-connector");
const UserService = require("./user.service");

class LiveService {
  static startTrackLive =
    (addJob, jobIntervals) =>
    async ({ tiktokId, userId, jobId }) => {
      let tiktokLiveConnection = new WebcastPushConnection(tiktokId);

      await UserService.updateJobIdForTiktokId({ userId, tiktokId, jobId });

      let newRoom = undefined;

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

              const { create_time: createTime, finish_time: finishTime } =
                roomInfo;

              if (
                createTime !== finishTime &&
                error.message === "Already connected!"
              ) {
                console.info(
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
      }, 30000);

      tiktokLiveConnection.on("connected", async (state) => {
        let roomId;
        try {
          const owner = {
            displayId: tiktokId,
            nickname: state.roomInfo.owner?.nickname || tiktokId,
          };

          roomId = state.roomId;
          const { create_time: roomCreateTime, title } = state.roomInfo;

          newRoom = await RoomService.add(
            userId,
            roomId,
            owner,
            title || "",
            roomCreateTime || parseInt(Date.now() / 1000)
          );
        } catch (error) {
          console.error("Error when storing new room:", error);
          newRoom = await RoomService.get(roomId);
        }
      });

      tiktokLiveConnection.on("chat", async (msg) => {
        try {
          await ChatService.add({
            msg,
            room: newRoom._id,
            userId,
            liveTiktokId: tiktokId,
          });
        } catch (error) {
          console.error("Error when adding new chat", error);
        }
      });

      tiktokLiveConnection.on("streamEnd", async () => {
        try {
          await RoomService.update({ id: newRoom._id, isLive: false });

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
