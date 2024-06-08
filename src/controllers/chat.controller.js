const ChatService = require("../services/chat.service");
const catchAsync = require("../utils/catchAsync");

exports.listChats = catchAsync(async (req, res, next) => {
  const roomId = req.params.roomId;
  const { page, limit, search } = req.query;

  const chats = await ChatService.list({
    arg: { room: roomId },
    page,
    limit,
    search: search?.trim(),
  });

  res.status(200).json({
    status: "success",
    data: {
      display: chats.length,
      chats,
    },
  });
});

exports.listChatsByCustomerId = catchAsync(async (req, res, next) => {
  const { roomId, customerId } = req.params;
  const { page, limit } = req.query;

  const chats = await ChatService.list({
    arg: { room: roomId, customer: customerId },
    page,
    limit,
  });

  res.status(200).json({
    status: "success",
    data: {
      display: chats.length,
      chats,
    },
  });
});
