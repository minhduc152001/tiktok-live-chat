const express = require("express");
const {
  createOrder,
  listOrdersByUserId,
  listOrdersByRoomId,
} = require("../controllers/order.controller");
const { protect } = require("../controllers/auth.controller");

const router = express.Router();

// Protected routes
router.route("/").get(protect, listOrdersByUserId).post(protect, createOrder);
router.get("/:roomId", protect, listOrdersByRoomId);

module.exports = router;
