const UserModel = require("../models/user.model");

class UserService {
  static list = async () => {
    const users = await UserModel.find();

    return users;
  };
}

module.exports = UserService;
