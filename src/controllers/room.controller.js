const RoomService = require("../services/room.service");
const catchAsync = require("../utils/catchAsync");

exports.listRooms = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const rooms = await RoomService.list(userId);

  res.status(200).json({
    status: "success",
    data: {
      display: rooms.length,
      rooms,
    },
  });
});
