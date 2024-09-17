const ChatModel = require("../models/chat.model");
const CustomerModel = require("../models/customer.model");
class ChatService {
  static add = async ({ msg, room, userId, liveTiktokId }) => {
    const customerData = {
      user: userId,
      tiktokUserId: msg.userId,
      tiktokId: msg.uniqueId,
      displayName: msg.nickname,
      profilePictureUrl: msg.profilePictureUrl,
      phone: null,
      address: null,
    };

    const customer = await CustomerModel.findOneAndUpdate(
      {
        user: userId,
        tiktokUserId: msg.userId,
      },
      {
        $setOnInsert: customerData,
        $addToSet: { inTiktoks: liveTiktokId },
      },
      {
        upsert: true,
        new: true,
      }
    );

    const data = {
      user: userId,
      room,
      customer: customer._id,
      comment: msg.comment,
      msgId: msg.msgId,
      createdAt: new Date(parseInt(msg.createTime)),
    };

    const chat = await ChatModel.create(data);

    return chat;
  };

  static list = async ({ arg, page = null, limit = null, search = "" }) => {
    const offset = (page - 1) * limit;
    const searchConditions = [];

    if (search) {
      // Search comments
      searchConditions.push({ comment: { $regex: search, $options: "i" } });

      // Search customer display names
      const customerSearchResults = await CustomerModel.find({
        displayName: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean()
        .exec();

      const customerIds = customerSearchResults.map((customer) => customer._id);

      if (customerIds.length > 0) {
        searchConditions.push({ customer: { $in: customerIds } });
      }
    }

    const query = {
      ...arg,
      ...(searchConditions.length > 0 && { $or: searchConditions }),
    };

    const comments = await ChatModel.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .skip(offset)
      .populate(
        "customer",
        "tiktokUserId displayName phone profilePictureUrl tiktokId address"
      )
      .lean()
      .exec();

    return comments;
  };
}

module.exports = ChatService;
