const OrderService = require("../services/order.service");
const catchAsync = require("../utils/catchAsync");

function transformData(data) {
  const customerOrdersMap = {};

  data.forEach((order) => {
    const customer = order.chat.customer;
    const customerId = customer._id;

    if (!customerOrdersMap[customerId]) {
      customerOrdersMap[customerId] = {
        customer: { ...customer },
        orders: [],
      };
    }

    customerOrdersMap[customerId].orders.push({ _id: order._id });
  });

  return Object.values(customerOrdersMap);
}

exports.createOrder = catchAsync(async (req, res, next) => {
  const { chatId } = req.body;
  const order = await OrderService.add({
    chatId,
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

exports.listByEachCustomerInRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;

  const orders = await OrderService.listByRoomId({ roomId });

  const data = transformData(orders);

  res.status(200).json({
    status: "success",
    data,
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
