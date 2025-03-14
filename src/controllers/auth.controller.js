const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const UserModel = require("../models/user.model");
const { promisify } = require("util");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create(req.body);

  createSendToken(newUser, 201, req, res);
});

exports.createUser = catchAsync(async (req, res, next) => {
  try {
    let user = await UserModel.create(req.body);

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      error,
    });
  }
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { userId, ...data } = req.body;

  const user = await UserModel.findByIdAndUpdate(userId, data, { new: true });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  // 2) Check if user exists && password is correct
  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  // 3) if Everything work
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.status(200).json({ status: "success" });
};

exports.getAllUsers = async (req, res) => {
  const { limit, page } = req.query;
  const offset = (page - 1) * limit;

  const query = { role: "user" };

  const totalCount = await UserModel.countDocuments(query);
  const users = await UserModel.find(query).limit(limit).skip(offset);

  res.status(200).json({
    status: "success",
    data: {
      totalCount,
      display: users.length,
      users,
    },
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it true
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  const freshUser = await UserModel.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token does not exsist", 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  // if (freshUser.changePasswordAfter(decoded.iat)) {
  //   return new AppError(
  //     "User recently changed password! Please log in again.",
  //     401
  //   );
  // }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

// Only gor rendered pages, no errors!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exist
      const currentUser = await UserModel.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 4) Check if user changed password after the token was issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return new AppError();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
});

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
