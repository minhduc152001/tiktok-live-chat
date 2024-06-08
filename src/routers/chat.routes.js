const express = require("express");
const {
  listChats,
  listChatsByCustomerId,
} = require("../controllers/chat.controller");
const { protect } = require("../controllers/auth.controller");

const router = express.Router();

// Protected routes
router.get("/:roomId", protect, listChats);
router.get("/:roomId/customer/:customerId", protect, listChatsByCustomerId);

module.exports = router;
