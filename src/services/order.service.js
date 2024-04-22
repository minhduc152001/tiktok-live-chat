const OrderModel = require("../models/order.model");

class OrderService {
  static add = async (data) => {
    const order = await OrderModel.create(data);

    return order;
  };

  static list = async (userId) => {
    const orders = await OrderModel.find({
      user: userId,
    });

    return orders;
  };
}

module.exports = OrderService;
