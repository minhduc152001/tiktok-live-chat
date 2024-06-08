const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
      unique: true,
      require: [true, "Chat info can not be empty"],
    },
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
