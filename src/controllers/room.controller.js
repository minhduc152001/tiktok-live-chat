const RoomService = require("../services/room.service");
const catchAsync = require("../utils/catchAsync");

exports.listRooms = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { tiktokId } = req.query;
  let rooms = await RoomService.list(userId);
  if (tiktokId)
    rooms = rooms.filter((room) => room.owner.displayId === tiktokId);

  res.status(200).json({
    status: "success",
    data: {
      display: rooms.length,
      rooms,
    },
  });
});
