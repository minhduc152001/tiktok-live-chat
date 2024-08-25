const CustomerModel = require("../models/customer.model");
const { paginateArray } = require("../utils/paginateArray");

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

  static listByAdmin = async ({ page = null, limit = null }) => {
    const aggregation = [
      {
        $sort: {
          phone: -1,
        },
      },
      {
        $group: {
          _id: "$tiktokUserId",
          document: {
            $first: "$$ROOT",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$document",
        },
      },
    ];
    const allCustomers = await CustomerModel.aggregate(aggregation);
    const customers = paginateArray(allCustomers, +page, +limit);

    return {
      totalCount: allCustomers.length,
      display: customers.length,
      customers,
    };
  };

  static findDetailCustomer = async ({ tiktokUserId }) => {
    const customers = await CustomerModel.find({ tiktokUserId });
    const detailCustomer = customers.find((cus) => !!cus.phone);

    return detailCustomer || customers[0];
  };
}

module.exports = CustomerService;
