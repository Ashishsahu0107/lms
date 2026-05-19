import { messageService } from "../services/message.service.js";

export async function getConversationsController(req, res, next) {
  try {
    const conversations = await messageService.getConversations(req.user._id);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

export async function getMessagesController(req, res, next) {
  try {
    const { otherId } = req.params;
    const messages = await messageService.getMessages(req.user._id, otherId);
    await messageService.markRead(req.user._id, otherId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

export async function sendMessageController(req, res, next) {
  try {
    const { recipientId, content, attachments } = req.body;
    const message = await messageService.sendMessage(req.user._id, recipientId, content, attachments);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}