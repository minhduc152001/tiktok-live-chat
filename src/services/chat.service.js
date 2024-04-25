const ChatModel = require("../models/chat.model");

class ChatService {
  static add = async (msg, room, userId) => {
    const data = {
      room,
      user: userId,
      comment: msg.comment,
      viewerId: msg.userId,
      viewerUniqueId: msg.uniqueId,
      nickname: msg.nickname,
      msgId: msg.msgId,
      createdAt: new Date(parseInt(msg.createTime)),
    };

    const chat = await ChatModel.create(data);

    return chat;
  };

  static list = async ({ userId, roomId }) => {
    const comments = await ChatModel.find({
      user: userId,
      room: roomId,
    });

    return comments;
  };
}

module.exports = ChatService;
