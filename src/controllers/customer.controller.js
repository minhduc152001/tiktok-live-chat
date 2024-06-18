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
