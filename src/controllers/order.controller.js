const OrderService = require("../services/order.service");

exports.createOrder = async (req, res, next) => {
  const data = req.body;
  const order = await OrderService.add(data);

  res.status(200).json({
    status: "success",
    data: {
      data: order,
    },
  });
};
