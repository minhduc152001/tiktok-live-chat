const OrderService = require("../services/order.service");
const catchAsync = require("../utils/catchAsync");

exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    chatId,
    // roomId,
    // customerId
  } = req.body;
  const order = await OrderService.add({
    chatId,
    // roomId,
    // customerId
  });

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
      display: orders.length,
      orders,
    },
  });
});

exports.listOrdersByRoomId = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;

  const orders = await OrderService.listByRoomId({ roomId });

  res.status(200).json({
    status: "success",
    data: {
      display: orders.length,
      orders,
    },
  });
});

exports.listOrderByRoomAndCustomerId = catchAsync(async (req, res, next) => {
  const { roomId, customerId } = req.params;

  const orders = await OrderService.listByRoomAndCustomerId({
    roomId,
    customerId,
  });

  res.status(200).json({
    status: "success",
    data: {
      display: orders.length,
      orders,
    },
  });
});
