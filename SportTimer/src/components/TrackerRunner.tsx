import { IconGraphic } from '@static/shared/react';
import fastBackIcon from '@static/shared/assets/icons/fast-back.svg?raw';
import { Tracker, CounterItem } from '../types.ts';
import './TrackerRunner.css';

type TrackerRunnerProps = {
  tracker: Tracker;
  onUpdateCounter: (counterId: string, delta: number) => void;
  onResetTracker: () => void;
  onExit: () => void;
};

export const TrackerRunner = ({ tracker, onUpdateCounter, onResetTracker, onExit }: TrackerRunnerProps) => {
  return (
    <div className="tracker-runner">
      <div className="runner-container">
        <div className="runner-header">
          <button className="btn-back btn-with-icon" onClick={onExit}>
            <IconGraphic svgMarkup={fastBackIcon} size="sm" />
            <span>Back</span>
          </button>
          <h2>{tracker.name}</h2>
        </div>

        {tracker.items.length === 0 ? (
          <div className="empty-tracker-runner">
            <p>No counter items in this tracker.</p>
            <button className="btn-large btn-secondary btn-with-icon" onClick={onExit}>
              <IconGraphic svgMarkup={fastBackIcon} size="sm" />
              <span>Back to Edit</span>
            </button>
          </div>
        ) : (
          <>
            <div className="tracker-items-display">
              {tracker.items.map((item: CounterItem) => (
                <div key={item.id} className="tracker-item-large">
                  <div className="item-name-large">{item.name}</div>
                  <div className="item-value-large">{item.value}</div>
                  <div className="item-controls-large">
                    <button 
                      className="btn-control-large btn-minus-large"
                      onClick={() => onUpdateCounter(item.id, -1)}
                    >
                      −
                    </button>
                    <button 
                      className="btn-control-large btn-plus-large"
                      onClick={() => onUpdateCounter(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="tracker-actions">
              <button className="btn-large btn-reset" onClick={onResetTracker}>
                ↻ Reset All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

