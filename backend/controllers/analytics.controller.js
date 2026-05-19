import { analyticsService } from "../services/analytics.service.js";

export async function getAnalyticsController(req, res, next) {
  try {
    const analytics = await analyticsService.getTeacherAnalytics(req.user._id);
    res.json(analytics);
  } catch (err) {
    next(err);
  }
}