const CustomerModel = require("../models/customer.model");

class CustomerService {
  static update = async ({ customerId, ...arg }) => {
    if (arg.phone && arg.phone.length !== 10)
      throw new Error("Invalid phone number");

    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      customerId,
      arg,
      {
        new: true,
      }
    );

    return updatedCustomer;
  };

  static list = async ({ userId, page = null, limit = null }) => {
    const offset = (page - 1) * limit;

    const query = {
      user: userId,
    };

    const totalCount = await CustomerModel.countDocuments(query);
    const customers = await CustomerModel.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .skip(offset);

    return {
      totalCount,
      display: customers.length,
      customers,
    };
  };
}

module.exports = CustomerService;
