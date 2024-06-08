const express = require("express");
const {
  updateCustomer,
  listCustomers,
} = require("../controllers/customer.controller");
const { protect } = require("../controllers/auth.controller");

const router = express.Router();

// Protected routes
router.route("/").get(protect, listCustomers).put(protect, updateCustomer);

module.exports = router;
