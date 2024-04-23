const express = require("express");
const { createOrder } = require("../controllers/order.controller");
const { protect } = require("../controllers/auth.controller");

const router = express.Router();

// Protected routes
router.post("/", protect, createOrder);

module.exports = router;
