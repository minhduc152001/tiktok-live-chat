const express = require("express");
const {
  createOrder,
  listOrdersByUserId,
  listOrdersByRoomId,
  listOrderByRoomAndCustomerId,
  listByEachCustomerInRoom,
} = require("../controllers/order.controller");
const { protect } = require("../controllers/auth.controller");

const router = express.Router();

// Protected routes
router.route("/").get(protect, listOrdersByUserId).post(protect, createOrder);
router.get("/:roomId", protect, listOrdersByRoomId);
router.get(
  "/:roomId/customer/:customerId",
  protect,
  listOrderByRoomAndCustomerId
);
router.get("/:roomId/customers", protect, listByEachCustomerInRoom);

module.exports = router;
