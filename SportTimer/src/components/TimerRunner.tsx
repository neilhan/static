import { Program } from '../types';
import { useTimer } from '../hooks/useTimer';
import { formatTime, calculateTotalDuration } from '../utils/helpers';
import './TimerRunner.css';

interface TimerRunnerProps {
  program: Program;
  onExit: () => void;
}

export const TimerRunner = ({ program, onExit }: TimerRunnerProps) => {
  const { timerState, togglePause, reset, skip } = useTimer(program);
  const currentSegment = program.segments[timerState.currentSegmentIndex];
  const totalDuration = calculateTotalDuration(program.segments);

  const calculateProgress = (): number => {
    const completedDuration = program.segments
      .slice(0, timerState.currentSegmentIndex)
      .reduce((sum, seg) => sum + seg.duration, 0);
    const currentSegmentProgress = currentSegment.duration - timerState.remainingTime;
    return ((completedDuration + currentSegmentProgress) / totalDuration) * 100;
  };

  const nextSegment = program.segments[timerState.currentSegmentIndex + 1];

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
          <h2>
            {program.name}
            {program.beepEnabled && (
              <span className="sound-indicator" title="Sound alerts enabled">🔔</span>
            )}
          </h2>
        </div>

        {timerState.isComplete ? (
          <div className="completion-screen">
            <div className="completion-icon">🎉</div>
            <h1>Program Complete!</h1>
            <p>Great job finishing your workout!</p>
            <div className="completion-actions">
              <button className="btn-large btn-primary" onClick={reset}>
                ↻ Restart
              </button>
              <button className="btn-large btn-secondary" onClick={() => onExit()}>
                ← Back to Programs
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="timer-display">
              <div className="segment-name" style={{ color: currentSegment?.color }}>
                {currentSegment?.name}
              </div>
              <div className="time-display">
                {formatTime(timerState.remainingTime)}
              </div>
              <div className="segment-progress-bar">
                <div 
                  className="segment-progress-fill"
                  style={{ 
                    width: `${((currentSegment.duration - timerState.remainingTime) / currentSegment.duration) * 100}%`,
                    backgroundColor: currentSegment?.color 
                  }}
                />
              </div>
            </div>

            <div className="timer-info">
              <div className="info-card">
                <div className="info-label">Segment</div>
                <div className="info-value">
                  {timerState.currentSegmentIndex + 1} of {program.segments.length}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">Round</div>
                <div className="info-value">
                  {program.rounds === 0 ? (
                    <>∞ <span className="cycle-count-small">(Round {timerState.currentRound})</span></>
                  ) : (
                    `${timerState.currentRound} of ${program.rounds}`
                  )}
                </div>
              </div>
              {nextSegment && (
                <div className="info-card">
                  <div className="info-label">Next Up</div>
                  <div className="info-value next-segment">
                    <span 
                      className="next-color-dot" 
                      style={{ backgroundColor: nextSegment.color }}
                    />
                    {nextSegment.name}
                  </div>
                </div>
              )}
            </div>

            <div className="overall-progress">
              <div className="progress-label">Overall Progress</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
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

