import { AIChat } from "../models/AIChat.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

// ============================================
// GET /api/ai/chats
// Fetch all conversations for active user
// ============================================
export async function getAiChats(req, res, next) {
  try {
    const userId = req.user._id;
    const chats = await AIChat.find({ user: userId })
      .select("title messages createdAt updatedAt")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: chats.map((chat) => ({
        _id: chat._id,
        title: chat.title,
        messageCount: chat.messages.length,
        lastMessage: chat.messages[chat.messages.length - 1] || null,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// POST /api/ai/chats
// Create a new conversation thread
// ============================================
export async function createAiChat(req, res, next) {
  try {
    const userId = req.user._id;
    const { title = "New Conversation" } = req.body ?? {};

    const chat = new AIChat({
      user: userId,
      title: title.trim() || "New Conversation",
      messages: [],
    });

    await chat.save();

    return res.status(201).json({
      success: true,
      message: "AI conversation thread initialized successfully",
      data: chat,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// GET /api/ai/chats/:chatId
// Fetch a single conversation with complete logs
// ============================================
export async function getAiChatDetails(req, res, next) {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    if (!chatId) {
      throw new BadRequestError("Chat ID is required");
    }

    const chat = await AIChat.findOne({ _id: chatId, user: userId });
    if (!chat) {
      throw new NotFoundError("Conversation thread not found");
    }

    return res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// DELETE /api/ai/chats/:chatId
// Remove conversation thread
// ============================================
export async function deleteAiChat(req, res, next) {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    if (!chatId) {
      throw new BadRequestError("Chat ID is required");
    }

    const chat = await AIChat.findOneAndDelete({ _id: chatId, user: userId });
    if (!chat) {
      throw new NotFoundError("Conversation thread not found or unauthorized");
    }

    return res.status(200).json({
      success: true,
      message: "AI conversation thread cleared successfully",
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// POST /api/ai/chats/:chatId/retry
// Pop the last AI and last user message to retry
// ============================================
export async function retryAiMessage(req, res, next) {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    if (!chatId) {
      throw new BadRequestError("Chat ID is required");
    }

    const chat = await AIChat.findOne({ _id: chatId, user: userId });
    if (!chat) {
      throw new NotFoundError("Conversation thread not found");
    }

    if (chat.messages.length === 0) {
      throw new BadRequestError("No messages to retry");
    }

    // If last message is AI, pop it
    let lastMsg = chat.messages[chat.messages.length - 1];
    if (lastMsg && lastMsg.sender === "ai") {
      chat.messages.pop();
    }

    // Now the last message should be the user message
    let lastUserMsg = chat.messages[chat.messages.length - 1];
    let queryText = "";
    if (lastUserMsg && lastUserMsg.sender === "user") {
      queryText = lastUserMsg.content;
      chat.messages.pop(); // Pop user message too so socket can re-add it cleanly
    } else {
      throw new BadRequestError("No user message found to retry");
    }

    await chat.save();

    return res.status(200).json({
      success: true,
      queryText,
      data: chat,
    });
  } catch (err) {
    next(err);
  }
}
