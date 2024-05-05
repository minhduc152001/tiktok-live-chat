const UserModel = require("../models/user.model");

class UserService {
  static list = async () => {
    const users = await UserModel.find();

    return users;
  };

  static updateTiktokIdsArray = async (userId, tiktokIds) => {
    const users = await UserModel.findByIdAndUpdate(
      userId,
      { tiktokIds },
      { new: true }
    );

    return users;
  };
}

module.exports = { UserService };
