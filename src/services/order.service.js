const OrderModel = require("../models/order.model");

class OrderService {
  static add = async ({ chatId, phone }) => {
    const order = await OrderModel.create({
      chat: chatId,
      phone,
    });

    return order;
  };

  static listByUserId = async (userId) => {
    const orders = await OrderModel.find()
      .populate({
        path: "chat",
        match: { user: userId },
      })
      .exec();

    return orders;
  };

  static listByRoomId = async (roomId) => {
    const orders = await OrderModel.find()
      .populate({
        path: "chat",
        match: { room: roomId },
      })
      .exec();

    return orders;
  };
}

module.exports = OrderService;
