const express = require("express");
const {
  signup,
  login,
  protect,
  restrictTo,
  logout,
  createUser,
  getAllUsers,
  updateUser,
} = require("../controllers/auth.controller");
const { getMe } = require("../controllers/user.controller");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

// Protected routes
router.get("/me", protect, getMe);

// Strict routes
router
  .route("/")
  .get(protect, restrictTo("admin"), getAllUsers)
  .post(protect, restrictTo("admin"), createUser)
  .put(protect, restrictTo("admin"), updateUser);

module.exports = router;
