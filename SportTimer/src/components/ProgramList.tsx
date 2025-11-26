import { Program } from '../types';
import { formatTime, calculateTotalDuration } from '../utils/helpers';
import homeIcon from '../assets/home.svg';
import './ProgramList.css';

interface ProgramListProps {
  programs: Program[];
  onCreateNew: () => void;
  onEdit: (program: Program) => void;
  onDelete: (programId: string) => void;
  onRun: (program: Program) => void;
}

export const ProgramList = ({ programs, onCreateNew, onEdit, onDelete, onRun }: ProgramListProps) => {
  return (
    <div className="program-list">
      <div className="program-list-header">
        <div className="header-title-group">
          <a href="https://neilhan.github.io/static" className="btn-icon home-link" title="Back to Home">
            <img src={homeIcon} alt="Home" width="24" height="24" />
          </a>
          <span className="breadcrumb-separator">/</span>
          <h1>Timers</h1>
        </div>
        <button className="btn-primary" onClick={onCreateNew}>
          + Create New Program
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="empty-state">
          <p>No programs yet. Create your first timer program!</p>
        </div>
      ) : (
        <div className="program-grid">
          {programs.map(program => {
            const totalDuration = calculateTotalDuration(program.segments);
            return (
              <div key={program.id} className="program-card">
                <div className="program-card-header">
                  <h3>{program.name}</h3>
                  <div className="program-card-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => onEdit(program)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon btn-delete" 
                      onClick={() => onDelete(program.id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="program-card-info">
                  <div className="info-item">
                    <span className="label">Duration:</span>
                    <span className="value">
                      {program.rounds === 0 ? '∞' : formatTime(totalDuration * program.rounds)}
                      {program.rounds > 1 && (
                        <span className="cycle-badge">{program.rounds} x ({formatTime(totalDuration)})</span>
                      )}
                      {program.rounds === 0 && (
                        <span className="cycle-badge">∞ x ({formatTime(totalDuration)})</span>
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Segments:</span>
                    <span className="value">
                      {program.segments.length}
                      {program.beepEnabled && (
                        <span className="beep-indicator" title="Sound enabled">🔔</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="segment-list-container">
                  <div className="segment-list">
                    {program.segments.map(segment => (
                      <div key={segment.id} className="segment-row">
                        <div 
                          className="segment-color-dot" 
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="segment-name">{segment.name}</span>
                        <span className="segment-duration">{formatTime(segment.duration)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className="btn-run"
                  onClick={() => onRun(program)}
                >
                  ▶ Start Program
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

