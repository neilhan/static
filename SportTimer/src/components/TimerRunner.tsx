import { Program, TimerSegment } from '../types.ts';
import { useTimer } from '../hooks/useTimer';
import { SoundIcon } from './icons/SoundIcon';
import { formatTime, calculateTotalDuration } from '../utils/helpers';
import './TimerRunner.css';

interface TimerRunnerProps {
  program: Program;
  onExit: () => void;
  onToggleSound: (programId: string) => void;
}

export const TimerRunner = ({ program, onExit, onToggleSound }: TimerRunnerProps) => {
  const { timerState, togglePause, reset, skip } = useTimer(program);
  const currentSegment = program.segments[timerState.currentSegmentIndex];
  const totalDuration = calculateTotalDuration(program.segments);

  const calculateProgress = (): number => {
    if (totalDuration === 0) {
      return 0;
    }
    const completedDuration = program.segments
      .slice(0, timerState.currentSegmentIndex)
      .reduce((sum: number, seg: TimerSegment) => sum + seg.duration, 0);
    const currentSegmentDuration = currentSegment?.duration ?? 0;
    const currentSegmentProgress = currentSegmentDuration - timerState.remainingTime;
    return ((completedDuration + currentSegmentProgress) / totalDuration) * 100;
  };

  const nextSegment = program.segments[timerState.currentSegmentIndex + 1];
  const upcomingSegments: TimerSegment[] = program.segments.slice(
    timerState.currentSegmentIndex + 2,
    timerState.currentSegmentIndex + 4
  );

  return (
    <div 
      className="timer-runner"
      style={{ 
        backgroundColor: currentSegment?.color ? `${currentSegment.color}15` : undefined 
      }}
    >
      <div className="runner-container">
        <div className="runner-header">
          <button className="btn-back" onClick={() => onExit()}>
            ← Back
          </button>
          <h2 className="runner-title">
            {program.name}
            <button
              type="button"
              className={`sound-toggle ${program.beepEnabled ? 'active' : 'muted'}`}
              onClick={() => onToggleSound(program.id)}
              aria-pressed={program.beepEnabled}
              title={program.beepEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
            >
              <SoundIcon muted={!program.beepEnabled} />
            </button>
          </h2>
        </div>

        {timerState.isComplete ? (
          <div className="completion-screen">
            <div className="completion-icon">🎉</div>
            <h1>Timer Complete!</h1>
            <p>Great job finishing your workout!</p>
            <div className="completion-actions">
              <button className="btn-large btn-primary" onClick={reset}>
                ↻ Restart
              </button>
              <button className="btn-large btn-secondary" onClick={() => onExit()}>
                ← Back to Timers
              </button>
            </div>
          </div>
        ) : (
          <>
            <section className="current-segment-card">
              <p className="segment-label">Current Interval</p>
              <div
                className="segment-name"
                style={{ color: currentSegment?.color }}
                aria-live="assertive"
              >
                {currentSegment?.name ?? 'No segments configured'}
              </div>
              <div className="time-display" aria-live="polite">
                {formatTime(timerState.remainingTime)}
              </div>
              <div className="segment-progress-bar">
                <div 
                  className="segment-progress-fill"
                  style={{ 
                    width: `${currentSegment ? ((currentSegment.duration - timerState.remainingTime) / currentSegment.duration) * 100 : 0}%`,
                    backgroundColor: currentSegment?.color || '#4ECDC4' 
                  }}
                />
              </div>
              <div className="segment-meta">
                <div className="meta-item">
                  <span className="meta-label">Segment</span>
                  <span className="meta-value">
                    {timerState.currentSegmentIndex + 1} / {program.segments.length}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Round</span>
                  <span className="meta-value">
                    {program.rounds === 0
                      ? '∞'
                      : `${timerState.currentRound} / ${program.rounds}`}
                  </span>
                </div>
              </div>
            </section>

            <div className="timing-panels">
              <div className="overall-progress">
                <div className="progress-label">Overall Progress</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>

              <section className="next-up-panel" aria-live="polite">
                <div className="next-up-header">
                  <span className="next-label">Next Up</span>
                  {nextSegment && (
                    <span className="next-duration">
                      {formatTime(nextSegment.duration)}
                    </span>
                  )}
                </div>
                {nextSegment ? (
                  <>
                    <div className="next-up-body">
                      <span 
                        className="next-color-dot" 
                        style={{ backgroundColor: nextSegment.color }}
                      />
                      <div>
                        <p className="next-name">{nextSegment.name}</p>
                        <p className="next-round-hint">
                          {program.rounds === 0
                            ? `Round ${timerState.currentRound}`
                            : `Round ${timerState.currentRound} of ${program.rounds}`}
                        </p>
                      </div>
                    </div>
                    {upcomingSegments.length > 0 && (
                      <div className="upcoming-list" aria-label="Upcoming segments">
                        {upcomingSegments.map(segment => (
                          <span key={segment.id} className="upcoming-chip">
                            <span
                              className="chip-dot"
                              style={{ backgroundColor: segment.color }}
                            />
                            {segment.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="next-name muted">Finish strong—last interval!</p>
                )}
              </section>
            </div>

            <div className="timer-controls">
              <button 
                className="btn-control"
                onClick={reset}
                title="Reset"
              >
                ↻
              </button>
              <button 
                className="btn-control btn-play"
                onClick={togglePause}
              >
                {timerState.isPaused ? '▶' : '❚❚'}
              </button>
              <button 
                className="btn-control"
                onClick={skip}
                disabled={timerState.currentSegmentIndex === program.segments.length - 1 && program.rounds !== 0 && timerState.currentRound >= program.rounds}
                title="Skip"
              >
                ⏭
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

