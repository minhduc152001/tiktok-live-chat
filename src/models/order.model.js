const mongoose = require("mongoose");
const { isVietnamesePhoneNumberValid } = require("../utils/checkValidPhone");

const orderSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
      unique: true,
      require: [true, "Chat info can not be empty"],
    },
    phone: {
      type: String,
      required: [true, "Phone number can not be empty"],
      validate: {
        validator: isVietnamesePhoneNumberValid,
        message: "Invalid phone number",
      },
    },
  },
  {
    toJSON: true,
    toObject: true,
  }
);

orderSchema.pre(/^find/, function (next) {
  this.populate("chat");

  next();
});

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
