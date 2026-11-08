// Date helpers for event listings. Dates are plain YYYY-MM-DD strings in IST.
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parts = (date) => {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m: months[m - 1], d };
};

/** "26 Sep", "26–27 Sep", "30 Oct – 1 Nov"; with a year: "30 Dec 2024 – 2 Jan 2025". */
export function formatRange(start, end = start, withYear = false) {
  const a = parts(start);
  const b = parts(end);
  const yb = withYear ? ` ${b.y}` : '';
  if (start === end) return `${a.d} ${a.m}${yb}`;
  if (a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${b.m}${yb}`;
  const ya = withYear && a.y !== b.y ? ` ${a.y}` : '';
  return `${a.d} ${a.m}${ya} – ${b.d} ${b.m}${yb}`;
}

/** Today's date in IST as YYYY-MM-DD. The site is rebuilt daily, so pages built with it stay current. */
export const todayIST = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
