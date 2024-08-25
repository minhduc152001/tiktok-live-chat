const CustomerService = require("../services/customer.service");
const catchAsync = require("../utils/catchAsync");

exports.updateCustomer = catchAsync(async (req, res, next) => {
  const customer = await CustomerService.update(req.body);

  res.status(200).json({
    status: "success",
    data: {
      customer,
    },
  });
});

exports.listCustomers = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;

  const data = await CustomerService.list({
    userId: req.user.id,
    page,
    limit,
  });

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getDetailCustomer = catchAsync(async (req, res, next) => {
  const { tiktokUserId } = req.params;

  // Need to check user info (paid user or something)

  const customer = await CustomerService.findDetailCustomer({ tiktokUserId });

  res.status(200).json({ status: "success", data: { customer } });
});

exports.listCustomersByAdmin = catchAsync(async (req, res, next) => {
  const { page, limit } = req.query;

  const data = await CustomerService.listByAdmin({
    page,
    limit,
  });

  res.status(200).json({
    status: "success",
    data,
  });
});
