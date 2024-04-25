const express = require("express");
const { listChats } = require("../controllers/chat.controller");
const { protect } = require("../controllers/auth.controller");

const router = express.Router();

// Protected routes
router.get("/:roomId", protect, listChats);

module.exports = router;
