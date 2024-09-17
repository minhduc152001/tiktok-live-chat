const LiveService = require("../services/livechat.service");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.connectTiktok = catchAsync(async (req, res, next) => {
  const { tiktokId } = req.body;
  const userId = req.user.id;

  try {
    await LiveService.startTrackLive({ tiktokId, userId });
  } catch (error) {
    console.error(error);
    return next(new AppError(error.message, error.code));
  }

  return res.status(200).json({
    status: "success",
  });
});
