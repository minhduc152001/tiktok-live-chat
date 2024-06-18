const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
      unique: true,
      require: [true, "Chat info can not be empty"],
    },
    // room: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "Room",
    //   unique: true,
    //   require: [true, "Room info can not be empty"],
    // },
    // customer: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "Customer",
    //   unique: true,
    //   require: [true, "Customer info can not be empty"],
    // },
  },
  {
    timestamps: true,
    toJSON: true,
    toObject: true,
  }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "chat",
    populate: {
      path: "customer",
      select: "user displayName phone profilePictureUrl tiktokId address", // Specify fields to populate
    },
  });
  next();
});

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
