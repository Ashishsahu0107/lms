import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getUserNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  deleteNotificationController,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getUserNotificationsController);
router.patch("/read-all", markAllNotificationsReadController);
router.patch("/:id/read", markNotificationReadController);
router.delete("/:id", deleteNotificationController);

export default router;
