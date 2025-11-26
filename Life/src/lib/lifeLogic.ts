import { getWeeksInYear } from './dateUtils';

export type CellStatus = 'lived' | 'active' | 'retirement';

export interface WeekCell {
  id: number; // Absolute week index
  weekInYear: number;
  status: CellStatus;
  year: number;
}

export interface YearData {
  year: number;
  age: number;
  weeks: WeekCell[];
}

export const DEFAULT_LIFE_EXPECTANCY = 90;

export const generateLifeGrid = (birthYear: number, lifeExpectancy: number = DEFAULT_LIFE_EXPECTANCY, activeAge: number = 80) => {
  const currentYear = new Date().getFullYear();
  const currentWeekDate = new Date(); // Now
  
  // Assumption: Birth is Jan 1st of birthYear for simplified "lived" logic
  // or we just check if the week's date is in the past.
  
  let absoluteWeekIndex = 0;
  const years: YearData[] = [];
  
  let livedWeeksCount = 0;
  let activeWeeksCount = 0;
  let retirementWeeksCount = 0;

  for (let i = 0; i < lifeExpectancy; i++) {
    const year = birthYear + i;
    const weeksInThisYear = getWeeksInYear(year);
    const weeks: WeekCell[] = [];
    const age = i;
    
    // Determine if this year is active or retirement phase
    // If activeAge is 80, then ages 0..79 are active. 80+ are retirement.
    const isRetirementYear = age >= activeAge;

    for (let w = 0; w < weeksInThisYear; w++) {
      // Approximate start date of this week
      // precise calculation: ISO week date...
      // Simple heuristic: "Is this week in the past?"
      // We can check if the year < currentYear -> all lived.
      // If year > currentYear -> all future.
      // If year == currentYear -> check week index.
      
      let status: CellStatus = 'lived';
      
      if (year < currentYear) {
        status = 'lived';
      } else if (year > currentYear) {
        status = isRetirementYear ? 'retirement' : 'active';
      } else {
        // Current year logic
        // We need to know roughly which week of the year we are in.
        // Simple approximation:
        const startOfYear = new Date(year, 0, 1);
        const now = new Date();
        const diff = now.getTime() - startOfYear.getTime();
        const currentWeekIndex = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
        
        if (w < currentWeekIndex) {
          status = 'lived';
        } else {
          status = isRetirementYear ? 'retirement' : 'active';
        }
      }
      
      if (status === 'lived') livedWeeksCount++;
      else if (status === 'active') activeWeeksCount++;
      else retirementWeeksCount++;

      weeks.push({
        id: absoluteWeekIndex,
        weekInYear: w + 1,
        status,
        year
      });
      absoluteWeekIndex++;
    }
    
    years.push({
      year,
      age,
      weeks
    });
  }

  return {
    years: years.reverse(),
    totalWeeks: absoluteWeekIndex,
    livedWeeks: livedWeeksCount,
    activeWeeks: activeWeeksCount,
    retirementWeeks: retirementWeeksCount,
    remainingWeeks: activeWeeksCount + retirementWeeksCount
  };
};
