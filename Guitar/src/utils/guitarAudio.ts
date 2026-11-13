// Web Audio API plucked-guitar synthesizer (zero external audio assets)

export const STANDARD_OPEN_MIDI = [64, 59, 55, 50, 45, 40] as const; // S1 E4 .. S6 E2

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function getFretMidi(
  openPc: number,
  stringIndex: number,
  fret: number
): number {
  const base = STANDARD_OPEN_MIDI[stringIndex] ?? 64;
  // Nearest octave to standard tuning for alternate tunings (e.g. Drop D -> D2 = 38)
  const diff = ((openPc - (base % 12) + 18) % 12) - 6;
  return base + diff + fret;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export interface PlayNoteOptions {
  delaySec?: number;
  durationSec?: number;
  gain?: number;
}

export function playMidiNote(midi: number, options: PlayNoteOptions = {}): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const { delaySec = 0, durationSec = 1.3, gain = 0.22 } = options;
  const startTime = ctx.currentTime + delaySec;
  const freq = midiToFreq(midi);

  // Warm plucked string: triangle fundamental + subtle 2nd harmonic through a decaying lowpass
  const oscMain = ctx.createOscillator();
  const oscHarmonic = ctx.createOscillator();
  const harmonicGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();

  oscMain.type = 'triangle';
  oscMain.frequency.setValueAtTime(freq, startTime);

  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);
  harmonicGain.gain.setValueAtTime(0.28, startTime);

  filter.type = 'lowpass';
  filter.Q.setValueAtTime(1.2, startTime);
  filter.frequency.setValueAtTime(Math.min(freq * 7, 4800), startTime);
  filter.frequency.exponentialRampToValueAtTime(
    Math.max(Math.min(freq * 2.2, 1400), 180),
    startTime + Math.min(0.45, durationSec * 0.5)
  );

  amp.gain.setValueAtTime(0.0001, startTime);
  amp.gain.linearRampToValueAtTime(gain, startTime + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0008, startTime + durationSec);

  oscMain.connect(filter);
  oscHarmonic.connect(harmonicGain);
  harmonicGain.connect(filter);
  filter.connect(amp);
  amp.connect(ctx.destination);

  oscMain.start(startTime);
  oscHarmonic.start(startTime);
  oscMain.stop(startTime + durationSec + 0.03);
  oscHarmonic.stop(startTime + durationSec + 0.03);
}

export function playFretNote(
  openPc: number,
  stringIndex: number,
  fret: number,
  options?: PlayNoteOptions
): void {
  playMidiNote(getFretMidi(openPc, stringIndex, fret), options);
}

export function playChordNotes(
  notes: Array<{ openPc: number; stringIndex: number; fret: number }>,
  strumStepSec = 0.045,
  initialDelaySec = 0
): void {
  if (!soundEnabled || notes.length === 0) return;
  const ordered = [...notes].sort((a, b) => b.stringIndex - a.stringIndex);
  const perNoteGain = Math.min(0.2, 0.42 / Math.sqrt(ordered.length));
  ordered.forEach((n, idx) => {
    playFretNote(n.openPc, n.stringIndex, n.fret, {
      delaySec: initialDelaySec + idx * strumStepSec,
      durationSec: 1.5,
      gain: perNoteGain,
    });
  });
}

export function playArpeggioThenChord(
  notes: Array<{ openPc: number; stringIndex: number; fret: number }>,
  arpStepSec = 0.18,
  strumStepSec = 0.045
): void {
  if (!soundEnabled || notes.length === 0) return;
  const ordered = [...notes].sort((a, b) => b.stringIndex - a.stringIndex);
  ordered.forEach((n, idx) => {
    playFretNote(n.openPc, n.stringIndex, n.fret, {
      delaySec: idx * arpStepSec,
      durationSec: 0.7,
      gain: 0.2,
    });
  });
  const chordDelay = ordered.length * arpStepSec + 0.12;
  playChordNotes(ordered, strumStepSec, chordDelay);
}

export function playSequence(
  midis: number[],
  stepSec = 0.16,
  durationSec = 0.75
): void {
  if (!soundEnabled || midis.length === 0) return;
  midis.forEach((midi, idx) => {
    playMidiNote(midi, {
      delaySec: idx * stepSec,
      durationSec,
      gain: 0.2,
    });
  });
}
