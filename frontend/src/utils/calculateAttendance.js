/* Utility for calculating attendance summary */
export const calculateAttendanceSummary = (attendance) => {
  // Guard against missing or malformed data
  if (!Array.isArray(attendance) || attendance.length === 0) {
    return null;
  }
  // Keep only valid records with explicit Present/Absent status
  const valid = attendance.filter(
    (a) => a && (a.status === 'Present' || a.status === 'Absent')
  );
  if (valid.length === 0) {
    return null;
  }
  const present = valid.filter((a) => a.status === 'Present').length;
  const total = valid.length;
  const percentage = Number(((present / total) * 100).toFixed(2));
  const status = percentage >= 75 ? 'Good' : 'Low Attendance';
  return { present, total, percentage, status };
};
