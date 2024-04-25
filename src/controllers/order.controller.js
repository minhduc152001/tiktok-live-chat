const OrderService = require("../services/order.service");
const catchAsync = require("../utils/catchAsync");

exports.createOrder = catchAsync(async (req, res, next) => {
  const { chatId, phone } = req.body;
  const order = await OrderService.add({ chatId, phone });

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

exports.listOrdersByUserId = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const orders = await OrderService.listByUserId({ userId });

  res.status(200).json({
    status: "success",
    data: {
      orders,
    },
  });
});

exports.listOrdersByRoomId = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;

  const orders = await OrderService.listByRoomId(roomId);

  res.status(200).json({
    status: "success",
    data: {
      orders,
    },
  });
});
