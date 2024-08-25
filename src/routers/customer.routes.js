const express = require("express");
const {
  updateCustomer,
  listCustomers,
  getDetailCustomer,
  listCustomersByAdmin,
} = require("../controllers/customer.controller");
const { protect, restrictTo } = require("../controllers/auth.controller");

const router = express.Router();

// Protected routes
router.route("/").get(protect, listCustomers).put(protect, updateCustomer);
router.route("/detail/:tiktokUserId").get(protect, getDetailCustomer);

// Restricted routes
router.route("/admin").get(protect, restrictTo("admin"), listCustomersByAdmin);

module.exports = router;
