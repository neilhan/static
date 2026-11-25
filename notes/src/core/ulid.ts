const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const generateUlid = (nowMs = Date.now()): string => {
  let time = Math.max(0, Math.floor(nowMs));
  let timeChars = '';
  for (let i = 0; i < 10; i += 1) {
    timeChars = CROCKFORD[time % 32] + timeChars;
    time = Math.floor(time / 32);
  }

  let randomChars = '';
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  for (let i = 0; i < 16; i += 1) {
    randomChars += CROCKFORD[bytes[i] % 32];
  }

  return timeChars + randomChars;
};

export const isNumericId = (id: string): boolean => /^\d+$/.test(id);
