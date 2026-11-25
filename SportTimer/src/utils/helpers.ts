export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const calculateTotalDuration = (segments: { duration: number }[]): number => {
  return segments.reduce((total, segment) => total + segment.duration, 0);
};

export const formatSpokenRemainingTime = (seconds: number): string => {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(wholeSeconds / 60);
  const secs = wholeSeconds % 60;
  const parts: string[] = [];

  if (mins > 0) {
    parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`);
  }
  if (secs > 0 || mins === 0) {
    parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
  }

  return `${parts.join(' ')} remaining`;
};

