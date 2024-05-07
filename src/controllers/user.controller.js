const { jobQueue } = require("../clients/queue");
const UserModel = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await UserModel.findById(userId);

  if (!user) {
    return next(new AppError("Could not find user with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.startTrackingLive = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await UserModel.findById(userId);

  if (!user) {
    return next(new AppError("Could not find user with that ID", 404));
  }

  const newTiktokIdsArr = await Promise.all(
    user.tiktokIds.map(async ({ tiktokId }) => {
      const job = await jobQueue.add({
        tiktokId,
        userId,
      });

      return {
        tiktokId,
        jobId: job.id,
      };
    })
  );

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      tiktokIds: newTiktokIdsArr,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});
