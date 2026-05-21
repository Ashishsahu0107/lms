import { messageService } from "../services/message.service.js";

import { getIO } from "../socket/index.js";

// =====================================
// GET ALL CONVERSATIONS
// =====================================
export async function getConversationsController(
  req,
  res,
  next
) {
  try {

    const conversations =
      await messageService.getConversations(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      data: conversations,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// GET MESSAGES
// =====================================
export async function getMessagesController(
  req,
  res,
  next
) {
  try {

    const { otherId } = req.params;

    // Get Messages
    const messages =
      await messageService.getMessages(
        req.user._id,
        otherId
      );

    // Mark Read
    await messageService.markRead(
      req.user._id,
      otherId
    );

    // Realtime Read Receipt
    const io = getIO();

    io.to(`user:${otherId}`).emit(
      "messages-read",
      {
        readerId: req.user._id,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// SEND MESSAGE
// =====================================
export async function sendMessageController(
  req,
  res,
  next
) {
  try {

    const {
      recipientId,
      content,
      attachments = [],
    } = req.body;

    // Save Message
    const message =
      await messageService.sendMessage(
        req.user._id,
        recipientId,
        content,
        attachments
      );

    // Socket Emit
    const io = getIO();

    // Send To Recipient
    io.to(`user:${recipientId}`).emit(
      "new-message",
      message
    );

    // Send To Sender
    io.to(`user:${req.user._id}`).emit(
      "message-sent",
      message
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// MARK MESSAGES READ
// =====================================
export async function markMessagesReadController(
  req,
  res,
  next
) {
  try {

    const { otherId } = req.params;

    await messageService.markRead(
      req.user._id,
      otherId
    );

    // Realtime Read Receipt
    const io = getIO();

    io.to(`user:${otherId}`).emit(
      "messages-read",
      {
        readerId: req.user._id,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });

  } catch (err) {
    next(err);
  }
}

// =====================================
// DELETE MESSAGE
// =====================================
export async function deleteMessageController(
  req,
  res,
  next
) {
  try {

    const { messageId } = req.params;

    await messageService.deleteMessage(
      req.user._id,
      messageId
    );

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });

  } catch (err) {
    next(err);
  }
}