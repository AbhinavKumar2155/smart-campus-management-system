// Utility to calculate GPA on a 10‑point scale
/**
 * Calculate GPA based on examResult array.
 * @param {Array<{ marksObtained: number }>} examResults
 * @returns {number|null} GPA rounded to 2 decimals, or null if no results.
 */
export const calculateGpa = (examResults) => {
  if (!Array.isArray(examResults) || examResults.length === 0) return null;
  const totalPoints = examResults.reduce((sum, r) => {
    const m = r.marksObtained ?? 0;
    let point = 0;
    if (m >= 90) point = 10;
    else if (m >= 80) point = 9;
    else if (m >= 70) point = 8;
    else if (m >= 60) point = 7;
    else if (m >= 50) point = 6;
    else if (m >= 40) point = 5;
    else point = 0;
    return sum + point;
  }, 0);
  const gpa = totalPoints / examResults.length;
  return Number(gpa.toFixed(2));
};
