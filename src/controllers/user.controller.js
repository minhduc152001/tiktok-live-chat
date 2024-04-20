const UserModel = require("../models/user.model");

exports.getMe = async (req, res, next) => {
  const userId = req.user.id;
  const user = await UserModel.findById(userId);

  if (!user) {
    return next(new AppError("Could not find user with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
};
