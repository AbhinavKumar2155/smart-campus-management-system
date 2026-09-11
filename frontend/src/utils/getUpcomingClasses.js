// Utility to compute upcoming classes for a student dashboard
// Accepts an array of subject/course objects (as returned by ClassSubjects endpoint)
// Returns up to 3 upcoming class objects sorted chronologically.
// Each returned object contains:
//   subName, subCode, day, startTime, endTime, room, teacher (optional), statusLabel

/**
 * Convert a time string "HH:MM" (24h) to a Date object on the given base date.
 * @param {Date} baseDate - The date part (year/month/day) to apply.
 * @param {string} timeStr - "HH:MM" format.
 * @returns {Date|null}
 */
function timeStringToDate(baseDate, timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  if (h === undefined || m === undefined) return null;
  const date = new Date(baseDate);
  date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  return date;
}

/**
 * Get the next Date for a given weekday name (Monday...Saturday) relative to today.
 * If targetDay is today and includeToday is true, returns today.
 */
function getNextDateForWeekday(targetDay, includeToday = false) {
  const daysMap = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  const target = daysMap[targetDay];
  if (!target) return null;
  const now = new Date();
  const todayIdx = now.getDay(); // 0=Sunday,1=Monday,...6=Saturday
  let diff = target - todayIdx;
  if (diff < 0 || (diff === 0 && !includeToday)) diff += 7;
  const result = new Date(now);
  result.setDate(now.getDate() + diff);
  // keep only date part (midnight)
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Determine upcoming classes based on current time.
 * @param {Array} subjects - array of subject objects (may contain schedule fields).
 * @returns {Array} up to 3 upcoming class objects.
 */
export function getUpcomingClasses(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) return [];

  const now = new Date();
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"

  const candidates = [];

  subjects.forEach((sub) => {
    const { day, startTime, endTime } = sub;
    if (!day || !startTime) return; // ignore unscheduled
    // compute the date for this class occurrence
    const isToday = day === todayName;
    const classDate = getNextDateForWeekday(day, isToday);
    if (!classDate) return;
    const startDate = timeStringToDate(classDate, startTime);
    const endDate = endTime ? timeStringToDate(classDate, endTime) : null;
    if (!startDate) return;
    // Determine if this occurrence should be shown (still upcoming)
    if (isToday) {
      // For today we only include if end time is in the future
      if (endDate && now > endDate) return; // already finished
    } else {
      // Future day always included
    }
    // Determine status label
    let statusLabel = '';
    if (isToday) {
      if (endDate && now >= startDate && now <= endDate) {
        statusLabel = 'Ongoing';
      } else if (now < startDate) {
        statusLabel = 'Today';
      }
    } else {
      statusLabel = day; // future weekday name
    }
    candidates.push({
      subName: sub.subName,
      subCode: sub.subCode,
      day,
      startTime,
      endTime,
      room: sub.room,
      teacher: sub.teacher, // may be populated or undefined
      statusLabel,
      _startDate: startDate, // for sorting only
    });
  });

  // Sort by start datetime ascending
  candidates.sort((a, b) => a._startDate - b._startDate);

  // Remove helper property before returning
  const result = candidates.slice(0, 3).map(({ _startDate, ...rest }) => rest);
  return result;
}
