const OrderModel = require("../models/order.model");

class OrderService {
  static add = async ({ chatId }) => {
    const order = await OrderModel.create({
      chat: chatId,
    });

    return order;
  };

  static listByUserId = async ({ userId }) => {
    const orders = (await OrderModel.find()).filter(
      (order) => order?.chat?.customer?.user == userId
    );

    return orders;
  };

  static listByRoomId = async ({ roomId }) => {
    const orders = (await OrderModel.find().lean()).filter(
      (order) => order?.chat?.room == roomId
    );

    return orders;
  };

  static listByEachCustomerInRoom = async ({ roomId }) => {
    const orders = (await OrderModel.find()).filter(
      (order) => order?.chat?.room == roomId
    );

    return orders;
  };

  static listByRoomAndCustomerId = async ({ roomId, customerId }) => {
    const orders = (await OrderModel.find()).filter(
      (order) =>
        order?.chat?.room == roomId && order?.chat?.customer?._id == customerId
    );

    return orders;
  };
}

module.exports = OrderService;
