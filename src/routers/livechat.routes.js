const express = require("express");
const {
  connectTiktok,
} = require("../controllers/livechat.controller");
const { protect } = require("../controllers/auth.controller");

const router = express.Router();

// Protected routes
router.post("/", protect, connectTiktok);

module.exports = router;
