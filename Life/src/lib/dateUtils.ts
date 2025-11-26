/**
 * Calculates the number of ISO weeks in a given year.
 * According to ISO 8601:
 * A year has 53 weeks if:
 * 1. It starts on a Thursday.
 * 2. It is a leap year and starts on a Wednesday.
 * Otherwise, it has 52 weeks.
 */
export const getWeeksInYear = (year: number): number => {
  const p = (y: number) => (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400)) % 7;
  
  // p(year) gives the day of the week for Jan 1st (0 = Sunday, 1 = Monday, ..., 6 = Saturday) in a Gregorian calendar adjustment?
  // Wait, the formula p(y) above usually calculates the day of week index or similar offset.
  // Let's use the standard Date object to be safe and readable.
  
  const date = new Date(year, 0, 1);
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  
  // Thursday is 4. Wednesday is 3.
  if (day === 4 || (isLeap && day === 3)) {
    return 53;
  }
  
  return 52;
};

