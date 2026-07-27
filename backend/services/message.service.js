import mongoose from "mongoose";

import { Message } from "../models/Message.js";

import { BadRequestError, UnauthorizedError } from "../utils/errors.js";

export const messageService = {
  // =====================================
  // GET CONVERSATIONS
  // =====================================
  async getConversations(userId) {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
      .populate("senderId", "name avatar isOnline")
      .populate("recipientId", "name avatar isOnline")
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    for (const msg of messages) {
      const participant =
        msg.senderId._id.toString() === userId.toString()
          ? msg.recipientId
          : msg.senderId;

      const key = participant._id.toString();

      // First Message
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          participant,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Unread Counter
      if (!msg.read && msg.recipientId._id.toString() === userId.toString()) {
        conversationMap.get(key).unreadCount += 1;
      }
    }

    return Array.from(conversationMap.values());
  },

  // =====================================
  // GET MESSAGES
  // =====================================
  async getMessages(userId, otherId) {
    if (!mongoose.Types.ObjectId.isValid(otherId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const messages = await Message.find({
      $or: [
        {
          senderId: userId,
          recipientId: otherId,
        },
        {
          senderId: otherId,
          recipientId: userId,
        },
      ],
    })
      .populate("senderId", "name avatar role isOnline")
      .populate("recipientId", "name avatar role isOnline")
      .sort({ createdAt: 1 });

    return messages;
  },

  // =====================================
  // SEND MESSAGE
  // =====================================
  async sendMessage(senderId, recipientId, content, attachments = []) {
    if (!recipientId) {
      throw new BadRequestError("Recipient ID is required");
    }

    if (!content && (!attachments || attachments.length === 0)) {
      throw new BadRequestError("Message content required");
    }

    let messageType = "text";
    if (attachments && attachments.length > 0) {
      messageType = attachments[0].type || "file";
    }

    // Create Message
    const message = await Message.create({
      senderId,
      recipientId,
      content,
      attachments,
      messageType,
      read: false,
    });

    // Populate Users
    await message.populate("senderId", "name avatar role isOnline");

    await message.populate("recipientId", "name avatar role isOnline");

    return message;
  },

  // =====================================
  // MARK READ
  // =====================================
  async markRead(recipientId, senderId) {
    await Message.updateMany(
      {
        senderId,
        recipientId,
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      },
    );
  },

  // =====================================
  // DELETE MESSAGE
  // =====================================
  async deleteMessage(userId, messageId) {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new BadRequestError("Invalid message ID");
    }

    const message = await Message.findById(messageId);

    if (!message) {
      throw new BadRequestError("Message not found");
    }

    // Only Sender Can Delete
    if (message.senderId.toString() !== userId.toString()) {
      throw new UnauthorizedError("Not allowed to delete this message");
    }

    await message.deleteOne();

    return true;
  },

  // =====================================
  // GROUPS SERVICES
  // =====================================
  async getGroups(userId) {
    const { ChatGroup } = await import("../models/ChatGroup.js");
    return ChatGroup.find({ members: userId })
      .populate("members", "name avatar role isOnline")
      .populate("createdBy", "name")
      .sort({ updatedAt: -1 });
  },

  async createGroup(name, description, members, createdBy) {
    const { ChatGroup } = await import("../models/ChatGroup.js");

    // Ensure creator is in the members list
    const memberIds = new Set(members.map((m) => m.toString()));
    memberIds.add(createdBy.toString());

    const group = await ChatGroup.create({
      name,
      description,
      members: Array.from(memberIds),
      createdBy,
    });

    return group.populate("members", "name avatar role isOnline");
  },

  async getGroupMessages(groupId, userId) {
    const { ChatGroup } = await import("../models/ChatGroup.js");
    const group = await ChatGroup.findById(groupId);
    if (!group) {
      throw new BadRequestError("Group not found");
    }

    if (!group.members.includes(userId)) {
      throw new UnauthorizedError("You are not a member of this group");
    }

    const messages = await Message.find({ groupId })
      .populate("senderId", "name avatar role isOnline")
      .sort({ createdAt: 1 });

    return messages;
  },

  async sendGroupMessage(senderId, groupId, content, attachments = []) {
    const { ChatGroup } = await import("../models/ChatGroup.js");
    const group = await ChatGroup.findById(groupId);
    if (!group) {
      throw new BadRequestError("Group not found");
    }

    if (!group.members.includes(senderId)) {
      throw new UnauthorizedError("You are not a member of this group");
    }

    let messageType = "text";
    if (attachments && attachments.length > 0) {
      messageType = attachments[0].type || "file";
    }

    const message = await Message.create({
      senderId,
      groupId,
      content,
      attachments,
      messageType,
      read: false,
    });

    await message.populate("senderId", "name avatar role isOnline");

    // Update group timestamp
    group.updatedAt = new Date();
    await group.save();

    return message;
  },
};
