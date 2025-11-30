import { Sentence, SRSData } from '../types';

// ---------------------------------------------------------------------------
// Content Hashing
// ---------------------------------------------------------------------------

// Simple DJB2 hash for string
const djb2 = (str: string): string => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

export const generateConversationHash = (sentences: Sentence[]): string => {
  // Normalize content to ignore minor whitespace diffs when hashing
  const content = sentences
    .map(s => `${s.target.trim()}|${s.native.trim()}`)
    .join('||');
  return djb2(content);
};

// ---------------------------------------------------------------------------
// SRS Algorithm (SM-2 simplified)
// ---------------------------------------------------------------------------

export const INITIAL_SRS_DATA: SRSData = {
  lastReviewed: 0,
  nextReview: 0,
  interval: 0,
  repetition: 0,
  easeFactor: 2.5,
};

/**
 * Calculates the next review schedule.
 * 
 * @param current The current SRS data state
 * @param grade 0-5 (Standard SM-2). 
 *              If grade is undefined/null, treat as 'Passive Review' (implicit pass, less aggressive interval increase).
 */
export const calculateNextReview = (
  current: SRSData = INITIAL_SRS_DATA,
  grade?: number 
): SRSData => {
  let { interval, repetition, easeFactor } = current;

  // Passive review logic (Implicit Grade)
  // If just listening without grading, we assume it's a 'Pass' (3) but we might want to be conservative.
  // Or we treat it exactly as a 3. 
  // Let's treat undefined grade as 3 (Pass).
  const effectiveGrade = grade !== undefined ? grade : 3;

  if (effectiveGrade >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - effectiveGrade) * (0.08 + (5 - effectiveGrade) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const now = Date.now();
  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return {
    lastReviewed: now,
    nextReview,
    interval,
    repetition,
    easeFactor,
  };
};

export const getReviewStatus = (nextReview: number): 'new' | 'due' | 'future' => {
  if (!nextReview) return 'new';
  if (Date.now() >= nextReview) return 'due';
  return 'future';
};
