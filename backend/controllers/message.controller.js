import { messageService } from "../services/message.service.js";
import { getIO, ROOMS } from "../socket/index.js";
import { BadRequestError } from "../utils/errors.js";

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

    io.to(ROOMS.student(otherId)).emit(
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
    io.to(ROOMS.student(recipientId)).emit(
      "new-message",
      message
    );

    // Send To Sender
    io.to(ROOMS.student(req.user._id)).emit(
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

    io.to(ROOMS.student(otherId)).emit(
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

// =====================================
// UPLOAD ATTACHMENT
// =====================================
import { buildFileUrl } from "../middleware/upload.js";

export async function uploadAttachmentController(req, res, next) {
  try {
    if (!req.file) {
      throw new BadRequestError("No file uploaded");
    }

    const { mimetype, originalname, size, filename } = req.file;

    // Deduce file type
    let type = "file";
    let subdir = "documents";
    if (mimetype.startsWith("image/")) {
      type = "image";
      subdir = "thumbnails";
    } else if (mimetype.startsWith("video/")) {
      type = "video";
      subdir = "videos";
    } else if (mimetype.startsWith("audio/")) {
      type = "audio";
      subdir = "documents";
    }

    const url = buildFileUrl(req, filename, subdir);

    return res.status(200).json({
      success: true,
      message: "Attachment uploaded successfully",
      data: {
        url,
        type,
        fileName: originalname,
        fileSize: size,
      },
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// GROUPS CONTROLLERS
// =====================================
export async function createGroupController(req, res, next) {
  try {
    const { name, description, members = [] } = req.body;
    if (!name) {
      throw new BadRequestError("Group name is required");
    }

    const group = await messageService.createGroup(
      name,
      description,
      members,
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group,
    });
  } catch (err) {
    next(err);
  }
}

export async function getGroupsController(req, res, next) {
  try {
    const groups = await messageService.getGroups(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Groups fetched successfully",
      data: groups,
    });
  } catch (err) {
    next(err);
  }
}

export async function getGroupMessagesController(req, res, next) {
  try {
    const { groupId } = req.params;
    const messages = await messageService.getGroupMessages(groupId, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Group messages fetched successfully",
      data: messages,
    });
  } catch (err) {
    next(err);
  }
}

export async function sendGroupMessageController(req, res, next) {
  try {
    const { groupId } = req.params;
    const { content, attachments = [] } = req.body;

    const message = await messageService.sendGroupMessage(
      req.user._id,
      groupId,
      content,
      attachments
    );

    // Socket Emit to group members
    const io = getIO();
    io.to(`room:group:${groupId}`).emit("messageReceived", message);
    io.to(`room:group:${groupId}`).emit("new-message", message);
    io.to(`room:group:${groupId}`).emit("newMessage", message);

    return res.status(201).json({
      success: true,
      message: "Group message sent successfully",
      data: message,
    });
  } catch (err) {
    next(err);
  }
}