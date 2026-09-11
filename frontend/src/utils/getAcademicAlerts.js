// Utility to compute academic alerts for a student dashboard
// Returns an array of alert objects (max 2) in priority order.
// Each alert has: type ("warning" | "info"), title, message

import { calculateAttendanceSummary } from './calculateAttendance';

export function getAcademicAlerts(userDetails) {
  if (!userDetails) return [];

  const alerts = [];

  // Low attendance alert (threshold 75%)
  const attendanceSummary = calculateAttendanceSummary(userDetails.attendance);
  if (attendanceSummary && attendanceSummary.percentage < 75) {
    alerts.push({
      type: 'warning',
      title: 'Low Attendance',
      message: 'Your overall attendance is below 75%. Please attend upcoming classes regularly.'
    });
  }

  // Department / Semester missing alert
  if (!userDetails.department || !userDetails.semester) {
    alerts.push({
      type: 'info',
      title: 'Complete Academic Information',
      message: 'Please update your department and semester information.'
    });
  }

  // Limit to maximum 2 alerts (as per spec) – order already priority based
  return alerts.slice(0, 2);
}
