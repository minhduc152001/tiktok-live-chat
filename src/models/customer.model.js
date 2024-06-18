const mongoose = require("mongoose");
const { isVietnamesePhoneNumberValid } = require("../utils/checkValidPhone");

const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User ID can not be empty"],
    },
    tiktokUserId: {
      // type like: "6526379673097322497"
      type: String,
      require: [true, "TikTok user ID can not be empty"],
    },
    inTiktoks: {
      type: [String],
      default: [],
    },
    tiktokId: {
      // type like: "bunvakem"
      type: String,
      require: [true, "TikTok ID can not be empty"],
    },
    displayName: {
      // type like: "Minh Duc Vu"
      type: String,
    },
    profilePictureUrl: {
      type: String,
    },
    phone: {
      type: String,
      default: null,
      validate: {
        validator: isVietnamesePhoneNumberValid,
        message: "Invalid phone number",
      },
    },
    address: {
      type: String,
      default: null,
    },
  },
  {
    toJSON: true,
    toObject: true,
  }
);

customerSchema.index({ user: 1, tiktokUserId: 1 }, { unique: true });
customerSchema.index({ displayName: "text" });
customerSchema.index({ user: 1 });

const CustomerModel = mongoose.model("Customer", customerSchema);

module.exports = CustomerModel;
