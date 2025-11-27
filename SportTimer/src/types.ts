export type TimerSegment = {
  id: string;
  name: string;
  duration: number; // in seconds
  color: string;
};

export type Program = {
  id: string;
  name: string;
  segments: TimerSegment[];
  rounds: number; // 1 = no repeat, 2+ = repeat that many times, 0 = infinite
  beepEnabled: boolean; // Play sound at end of each segment
  createdAt: number;
};

export type CounterItem = {
  id: string;
  name: string;
  value: number;
};

export type Tracker = {
  id: string;
  name: string;
  items: CounterItem[];
};

export type ViewMode = 'list' | 'timer_runner' | 'tracker_runner';

export type TimerState = {
  currentSegmentIndex: number;
  remainingTime: number;
  isPaused: boolean;
  isComplete: boolean;
  currentRound: number;
  totalRounds: number;
};
