import { analyticsService } from "../services/analytics.service.js";

// ============================================
// TEACHER ANALYTICS (Existing)
// ============================================
export async function getAnalyticsController(req, res, next) {
  try {
    const analytics = await analyticsService.getTeacherAnalytics(req.user._id);
    res.json(analytics);
  } catch (err) {
    next(err);
  }
}

// ============================================
// ADMIN ANALYTICS (New Upgrade)
// ============================================

// 1. Overview Dashboard Metrics
export async function getOverview(req, res, next) {
  try {
    const data = await analyticsService.getOverviewAnalytics();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

// 2. User Behaviour, Growth and Active Trends
export async function getUsers(req, res, next) {
  try {
    const data = await analyticsService.getUserAnalytics(req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

// 3. Course enrollments, funnels and completion metrics
export async function getCourses(req, res, next) {
  try {
    const data = await analyticsService.getCourseAnalytics(req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

// 4. Financial totals, monthly sales curves and commissions
export async function getRevenue(req, res, next) {
  try {
    const data = await analyticsService.getRevenueAnalytics(req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

// 5. Quiz scores, accuracies, assignment rates & leaderboard
export async function getPerformance(req, res, next) {
  try {
    const data = await analyticsService.getPerformanceAnalytics(req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

// 6. Attendance ratios, course stats, daily trends & warnings
export async function getAttendance(req, res, next) {
  try {
    const data = await analyticsService.getAttendanceAnalytics(req.query);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

// 7. Live online users, micro-telemetry feeds within last 24h
export async function getRealtime(req, res, next) {
  try {
    const data = await analyticsService.getRealTimeAnalytics();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}
