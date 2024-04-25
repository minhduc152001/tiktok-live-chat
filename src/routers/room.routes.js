const express = require("express");
const { listRooms } = require("../controllers/room.controller");
const { protect, restrictTo } = require("../controllers/auth.controller");

const router = express.Router();

// Protected routes
router.get("/", protect, restrictTo("user"), listRooms);

module.exports = router;
