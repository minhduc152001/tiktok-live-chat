const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const { isVietnamesePhoneNumberValid } = require("../utils/checkValidPhone");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      default: randomUUID(),
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Email can not be empty"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      unique: true,
      required: [true, "Phone number can not be empty"],
      validate: {
        validator: isVietnamesePhoneNumberValid,
        message: "Invalid phone number",
      },
    },
    password: {
      type: String,
      required: [true, "Password can not be empty"],
    },
    tiktokIds: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    paid: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // Only run this function if password actually modified
  if (!this.isModified("password")) return next();

  // Hash this password with cost of 12 (16 is much longer)
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
