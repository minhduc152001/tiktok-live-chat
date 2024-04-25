const ChatService = require("../services/chat.service");
const catchAsync = require("../utils/catchAsync");

exports.listChats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const roomId = req.params.roomId;

  const chats = await ChatService.list({ userId, roomId });

  res.status(200).json({
    status: "success",
    data: {
      chats,
    },
  });
});
