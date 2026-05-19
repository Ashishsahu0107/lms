import { Message } from "../models/Message.js";

export const messageService = {
  async getConversations(userId) {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    }).populate("senderId", "name avatar").populate("recipientId", "name avatar");

    const conversationMap = new Map();
    for (const msg of messages) {
      const key =
        msg.senderId._id.toString() === userId.toString()
          ? msg.recipientId._id.toString()
          : msg.senderId._id.toString();

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          participant: msg.senderId._id.toString() === userId.toString()
            ? msg.recipientId
            : msg.senderId,
          lastMessage: msg,
          unread: 0,
        });
      }

      if (!msg.read && msg.recipientId._id.toString() === userId.toString()) {
        conversationMap.get(key).unread += 1;
      }
    }

    return Array.from(conversationMap.values());
  },

  async getMessages(userId, otherId) {
    return Message.find({
      $or: [
        { senderId: userId, recipientId: otherId },
        { senderId: otherId, recipientId: userId },
      ],
    })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 });
  },

  async sendMessage(senderId, recipientId, content, attachments = []) {
    const message = await Message.create({
      senderId,
      recipientId,
      content,
      attachments,
    });
    return message.populate("senderId", "name avatar");
  },

  async markRead(recipientId, senderId) {
    await Message.updateMany(
      { senderId, recipientId, read: false },
      { read: true }
    );
  },
};