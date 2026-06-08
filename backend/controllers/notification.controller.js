import { Notification } from "../models/Notification.js";
import { BadRequestError } from "../utils/errors.js";

export async function getUserNotificationsController(req, res, next) {
  try {
    const now = new Date();
    const notifications = await Notification.find({
      $or: [
        { recipientId: req.user._id },
        {
          recipientId: null,
          targetRole: { $in: [req.user.role, "all"] },
          scheduledAt: { $lte: now }
        }
      ]
    })
      .populate("senderId", "name avatar")
      .sort({ createdAt: -1 });

    const formatted = notifications.map(n => {
      const doc = n.toObject();
      if (n.recipientId) {
        doc.read = n.read;
      } else {
        doc.read = n.readBy.some(id => id.toString() === req.user._id.toString());
      }
      return doc;
    });

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationReadController(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new BadRequestError("Notification not found");
    }

    if (notification.recipientId) {
      if (notification.recipientId.toString() !== req.user._id.toString()) {
        throw new BadRequestError("Unauthorized to mark this notification as read");
      }
      notification.read = true;
    } else {
      if (!notification.readBy.some(uid => uid.toString() === req.user._id.toString())) {
        notification.readBy.push(req.user._id);
      }
    }

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsReadController(req, res, next) {
  try {
    const now = new Date();
    
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { $set: { read: true } }
    );

    await Notification.updateMany(
      {
        recipientId: null,
        targetRole: { $in: [req.user.role, "all"] },
        scheduledAt: { $lte: now },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotificationController(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new BadRequestError("Notification not found");
    }

    if (notification.recipientId && notification.recipientId.toString() !== req.user._id.toString()) {
      throw new BadRequestError("Unauthorized to delete this notification");
    }

    await notification.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (err) {
    next(err);
  }
}
