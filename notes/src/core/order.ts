export const nextOrderAtEnd = (orders: number[]): number => {
  if (orders.length === 0) return 1;
  const max = Math.max(...orders);
  return Math.floor(max) + 1;
};

export const orderBeforeFirst = (orders: number[]): number => {
  if (orders.length === 0) return 1;
  const min = Math.min(...orders);
  return min - 1;
};

export const midpointOrder = (before: number | null, after: number | null): number => {
  if (before === null && after === null) return 1;
  if (before === null) return (after as number) - 1;
  if (after === null) return Math.floor(before) + 1;
  return (before + after) / 2;
};

export const needsRenumber = (orders: number[]): boolean => {
  for (let i = 0; i < orders.length; i += 1) {
    const str = orders[i].toString();
    const dotIdx = str.indexOf('.');
    if (dotIdx !== -1 && str.length - dotIdx - 1 > 6) {
      return true;
    }
    if (i > 0 && orders[i] === orders[i - 1]) {
      return true;
    }
  }
  return false;
};

export const renumberSiblings = <T extends { order: number }>(items: T[]): T[] => {
  return items.map((item, idx) => ({ ...item, order: idx + 1 }));
};
