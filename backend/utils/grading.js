/**
 * utils/grading.js
 * Philippine Grading Scale helpers — single source of truth.
 */

/**
 * Maps a percentage score to its numeric letter-grade equivalent.
 * @param {number} pct  0–100
 * @returns {number}    1.00 – 5.00
 */
function toLetterGrade(pct) {
  if (pct >= 99) return 1.0;
  if (pct >= 96) return 1.25;
  if (pct >= 93) return 1.5;
  if (pct >= 90) return 1.75;
  if (pct >= 87) return 2.0;
  if (pct >= 84) return 2.25;
  if (pct >= 81) return 2.5;
  if (pct >= 78) return 2.75;
  if (pct >= 75) return 3.0;
  return 5.0;
}

/**
 * Returns "Passed" for grades 1.00–3.00, "Failed" for 5.00.
 * @param {number} letterGrade
 * @returns {string}
 */
function toPerformanceStatus(letterGrade) {
  return letterGrade <= 3.0 ? "Passed" : "Failed";
}

/**
 * Computes GWA as the arithmetic mean of letter-grade equivalents,
 * rounded to two decimal places.
 * Returns null when the grades array is empty.
 * @param {number[]} letterGrades  Array of numeric letter grades (1.00–5.00)
 * @returns {number|null}
 */
function computeGWA(letterGrades) {
  if (!letterGrades.length) return null;
  const sum = letterGrades.reduce((acc, g) => acc + g, 0);
  return parseFloat((sum / letterGrades.length).toFixed(2));
}

module.exports = { toLetterGrade, toPerformanceStatus, computeGWA };
