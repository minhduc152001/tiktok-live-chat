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

  static updateJobIdForTiktokId = async ({ userId, tiktokId, jobId }) => {
    const user = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        "tiktokIds.tiktokId": tiktokId,
      },
      {
        $set: {
          "tiktokIds.$.jobId": jobId,
        },
      },
      {
        new: true,
      }
    );

    return user;
  };
}

module.exports = UserService;
