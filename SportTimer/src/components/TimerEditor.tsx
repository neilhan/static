import { useState, useEffect, useRef, SyntheticEvent } from 'react';
import { Program, TimerSegment } from '../types';
import { SoundIcon } from './icons/SoundIcon';
import { generateId, getRandomColor, formatTime, calculateTotalDuration } from '../utils/helpers';
import './TimerEditor.css';

interface TimerEditorProps {
  program?: Program;
  onSave: (program: Program) => void;
  onCancel: (program?: Program) => void;
}

export const TimerEditor = ({ program, onSave, onCancel }: TimerEditorProps) => {
  const [programName, setProgramName] = useState(program?.name || '');
  const [segments, setSegments] = useState<TimerSegment[]>(
    program?.segments || []
  );
  const [rounds, setRounds] = useState<number>(program?.rounds ?? 1);
  const [roundsInput, setRoundsInput] = useState<string>((program?.rounds ?? 1).toString());
  const [beepEnabled, setBeepEnabled] = useState<boolean>(program?.beepEnabled ?? true);

  const [editingSegment, setEditingSegment] = useState<{
    name: string;
    minutes: string;
    seconds: string;
  }>({
    name: '',
    minutes: '0',
    seconds: '30',
  });

  const [editingField, setEditingField] = useState<{
    segmentId: string | null;
    field: 'name' | 'time' | null;
  }>({ segmentId: null, field: null });
  
  const [editingName, setEditingName] = useState('');
  const [editingMinutes, setEditingMinutes] = useState('');
  const [editingSeconds, setEditingSeconds] = useState('');

  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    programName?: boolean;
    segmentName?: boolean;
    newSegmentName?: boolean;
    newSegmentDuration?: boolean;
  }>({});

  // Track if this is the initial load to prevent auto-save on mount
  const isInitialMount = useRef(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayMouseDownRef = useRef(false);

  const stopSliderPropagation = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  useEffect(() => {
    if (program) {
      setProgramName(program.name);
      setSegments(program.segments);
      setRounds(program.rounds);
      setRoundsInput(program.rounds.toString());
      setBeepEnabled(program.beepEnabled);
    }
  }, [program]);

  useEffect(() => {
    setRoundsInput(rounds.toString());
  }, [rounds]);

  // Centralized data change handler - watches all state and saves immediately
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only auto-save if we have a program to update
    if (!program) return;

    // Check if anything has changed from the original program
    const hasChanges = 
      programName.trim() !== program.name ||
      rounds !== program.rounds ||
      beepEnabled !== program.beepEnabled ||
      JSON.stringify(segments) !== JSON.stringify(program.segments);

    if (!hasChanges) return;

    const updatedProgram: Program = {
      id: program.id,
      name: programName.trim() || 'Untitled Timer',
      segments,
      rounds,
      beepEnabled,
      createdAt: program.createdAt,
    };
    
    onSave(updatedProgram);
  }, [programName, rounds, beepEnabled, segments, program, onSave]); // Watch all data fields and program

  const addSegment = () => {
    const minutes = parseInt(editingSegment.minutes) || 0;
    const seconds = parseInt(editingSegment.seconds) || 0;
    const totalSeconds = minutes * 60 + seconds;

    // Validate
    const hasNameError = !editingSegment.name.trim();
    const hasDurationError = totalSeconds <= 0;

    if (hasNameError || hasDurationError) {
      setValidationErrors({
        newSegmentName: hasNameError,
        newSegmentDuration: hasDurationError,
      });
      return;
    }

    // Clear validation errors
    setValidationErrors({});

    const newSegment: TimerSegment = {
      id: generateId(),
      name: editingSegment.name.trim(),
      duration: totalSeconds,
      color: getRandomColor(),
    };

    setSegments([...segments, newSegment]);
    setEditingSegment({ name: '', minutes: '0', seconds: '30' });
  };

  const startEditName = (segment: TimerSegment) => {
    setEditingName(segment.name);
    setEditingField({ segmentId: segment.id, field: 'name' });
  };

  const startEditTime = (segment: TimerSegment) => {
    const minutes = Math.floor(segment.duration / 60);
    const seconds = segment.duration % 60;
    setEditingMinutes(minutes.toString());
    setEditingSeconds(seconds.toString());
    setEditingField({ segmentId: segment.id, field: 'time' });
  };

  const saveNameEdit = (segmentId: string) => {
    if (!editingName.trim()) {
      setValidationErrors({ segmentName: true });
      return;
    }

    setValidationErrors({});
    setSegments(segments.map(seg => 
      seg.id === segmentId ? { ...seg, name: editingName.trim() } : seg
    ));
    setEditingField({ segmentId: null, field: null });
  };

  const saveTimeEdit = (segmentId: string) => {
    const minutes = parseInt(editingMinutes) || 0;
    const seconds = parseInt(editingSeconds) || 0;
    const totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      setValidationErrors({ segmentName: true }); // Show error
      return;
    }

    setValidationErrors({});
    setSegments(segments.map(seg => 
      seg.id === segmentId ? { ...seg, duration: totalSeconds } : seg
    ));
    setEditingField({ segmentId: null, field: null });
  };

  const handleNameKeyDown = (e: React.KeyboardEvent, segmentId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveNameEdit(segmentId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingField({ segmentId: null, field: null });
    }
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent, segmentId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTimeEdit(segmentId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingField({ segmentId: null, field: null });
    }
  };

  const deleteSegment = (segmentId: string) => {
    setSegments(segments.filter(s => s.id !== segmentId));
  };

  const moveSegment = (index: number, direction: 'up' | 'down') => {
    const newSegments = [...segments];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= segments.length) return;

    [newSegments[index], newSegments[newIndex]] = [newSegments[newIndex], newSegments[index]];
    setSegments(newSegments);
  };

  // UI event handlers
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    overlayMouseDownRef.current = e.target === e.currentTarget;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayMouseDownRef.current) {
      return;
    }
    overlayMouseDownRef.current = false;
    // Check if click is outside the modal content
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      // Prevent closing if text is being selected
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        return;
      }
      handleClose();
    }
  };

  const handleClose = () => {
    // Save current state before closing
    if (program) {
      const updatedProgram: Program = {
        id: program.id,
        name: programName.trim() || 'Untitled Timer',
        segments,
        rounds,
        beepEnabled,
        createdAt: program.createdAt,
      };
      onSave(updatedProgram);
      // Pass the updated program to onCancel so parent knows final state
      onCancel(updatedProgram);
    } else {
      onCancel();
    }
  };

  // Done button - save and close (same as clicking outside)
  const handleDone = () => {
    handleClose();
  };

  const handleRoundsInputChange = (value: string) => {
    if (!/^\d*$/.test(value)) {
      return;
    }
    setRoundsInput(value);
    if (value !== '') {
      const parsed = parseInt(value, 10);
      setRounds(parsed);
    }
  };

  const handleRoundsInputBlur = () => {
    if (roundsInput === '') {
      setRoundsInput(rounds.toString());
      return;
    }
    const parsed = parseInt(roundsInput, 10);
    if (Number.isNaN(parsed)) {
      setRoundsInput(rounds.toString());
      return;
    }
    setRounds(parsed);
  };

  const totalDuration = calculateTotalDuration(segments);
  const sliderMax = Math.max(10, rounds);

  return (
    <div 
      className="timer-editor-overlay" 
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="timer-editor"
      >
        <div className="editor-header">
          <h2>{program ? 'Edit Timer' : 'Create New Timer'}</h2>
          <button className="btn-close" onClick={handleClose}>✕</button>
        </div>

      <div className="editor-content">
        <div className="form-group">
          <label htmlFor="program-name">Timer Name</label>
          <input
            id="program-name"
            type="text"
            value={programName}
            onChange={e => {
              setProgramName(e.target.value);
              if (validationErrors.programName) {
                setValidationErrors({ ...validationErrors, programName: false });
              }
            }}
            placeholder="e.g., HIIT Workout"
            className={`input-text ${validationErrors.programName ? 'input-error' : ''}`}
          />
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="program-rounds">
              Rounds 
              <span className="label-hint">
                {rounds === 0 ? ' (Infinite)' : rounds === 1 ? ' (No repeat)' : ` (Repeat ${rounds} times)`}
              </span>
            </label>
            <div className="cycle-controls">
              <div className="rounds-slider-wrapper">
                <input
                  id="program-rounds"
                  type="range"
                  min="0"
                  max={sliderMax}
                  value={Math.min(rounds, sliderMax)}
                  onChange={e => setRounds(parseInt(e.target.value))}
                  className="input-range"
                  onPointerDown={stopSliderPropagation}
                  onPointerUp={stopSliderPropagation}
                  onMouseDown={stopSliderPropagation}
                  onMouseUp={stopSliderPropagation}
                  onClick={stopSliderPropagation}
                />
                <div className="rounds-input-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    className="input-text rounds-input"
                    value={roundsInput}
                    onChange={e => handleRoundsInputChange(e.target.value)}
                    onBlur={handleRoundsInputBlur}
                    aria-label="Set custom rounds"
                    placeholder="Enter rounds"
                  />
                  <span className="rounds-input-hint">0 = Infinite rounds</span>
                </div>
              </div>
              <div className="cycle-buttons">
                <button
                  type="button"
                  className={`btn-cycle ${rounds === 1 ? 'active' : ''}`}
                  onClick={() => setRounds(1)}
                >
                  1×
                </button>
                <button
                  type="button"
                  className={`btn-cycle ${rounds === 3 ? 'active' : ''}`}
                  onClick={() => setRounds(3)}
                >
                  3×
                </button>
                <button
                  type="button"
                  className={`btn-cycle ${rounds === 5 ? 'active' : ''}`}
                  onClick={() => setRounds(5)}
                >
                  5×
                </button>
                <button
                  type="button"
                  className={`btn-cycle ${rounds === 0 ? 'active' : ''}`}
                  onClick={() => setRounds(0)}
                >
                  ∞
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="beep-toggle">Sound Alert</label>
            <button
              type="button"
              id="beep-toggle"
              className={`btn-toggle ${beepEnabled ? 'active' : ''}`}
              onClick={() => setBeepEnabled(!beepEnabled)}
              title={beepEnabled ? 'Beep enabled' : 'Beep disabled'}
            >
              <span className="toggle-icon">
                <SoundIcon
                  muted={!beepEnabled}
                  title={beepEnabled ? 'Sound enabled' : 'Sound disabled'}
                />
              </span>
              <span className="toggle-text">{beepEnabled ? 'ON' : 'OFF'}</span>
            </button>
            <p className="toggle-description">
              Play sound at end of each segment
            </p>
          </div>
        </div>

        <div className="segments-section">
          <h3>Timer Segments</h3>
          
          <div className="segment-list">
            {segments.map((segment, index) => (
              <div 
                key={segment.id} 
                className="segment-item"
              >
                <div 
                  className="segment-color" 
                  style={{ backgroundColor: segment.color }}
                />
                
                <div className="segment-info">
                  {/* Editable name */}
                  {editingField.segmentId === segment.id && editingField.field === 'name' ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => {
                        setEditingName(e.target.value);
                        if (validationErrors.segmentName) {
                          setValidationErrors({ ...validationErrors, segmentName: false });
                        }
                      }}
                      onBlur={() => saveNameEdit(segment.id)}
                      onKeyDown={e => handleNameKeyDown(e, segment.id)}
                      className={`inline-input inline-input-name ${validationErrors.segmentName ? 'input-error' : ''}`}
                      placeholder="Segment name"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="segment-name editable"
                      onClick={() => startEditName(segment)}
                      title="Click to edit"
                    >
                      {segment.name}
                    </div>
                  )}

                  {/* Editable time */}
                  {editingField.segmentId === segment.id && editingField.field === 'time' ? (
                    <div className="inline-time-edit">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={editingMinutes}
                        onChange={e => setEditingMinutes(e.target.value)}
                        onKeyDown={e => handleTimeKeyDown(e, segment.id)}
                        className="inline-input inline-input-time"
                        placeholder="min"
                        autoFocus
                      />
                      <span className="time-separator">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={editingSeconds}
                        onChange={e => setEditingSeconds(e.target.value)}
                        onBlur={() => saveTimeEdit(segment.id)}
                        onKeyDown={e => handleTimeKeyDown(e, segment.id)}
                        className="inline-input inline-input-time"
                        placeholder="sec"
                      />
                    </div>
                  ) : (
                    <div 
                      className="segment-duration editable"
                      onClick={() => startEditTime(segment)}
                      title="Click to edit"
                    >
                      {formatTime(segment.duration)}
                    </div>
                  )}
                </div>

                <div className="segment-actions">
                  <button
                    className="btn-mini"
                    onClick={() => moveSegment(index, 'up')}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="btn-mini"
                    onClick={() => moveSegment(index, 'down')}
                    disabled={index === segments.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    className="btn-mini btn-delete"
                    onClick={() => deleteSegment(segment.id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {segments.length === 0 && (
              <div className="empty-segments">
                No segments yet. Add your first segment below.
              </div>
            )}
          </div>

          <div className="add-segment-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="segment-name">Segment Name</label>
                <input
                  id="segment-name"
                  type="text"
                  value={editingSegment.name}
                  onChange={e => {
                    setEditingSegment({ ...editingSegment, name: e.target.value });
                    if (validationErrors.newSegmentName) {
                      setValidationErrors({ ...validationErrors, newSegmentName: false });
                    }
                  }}
                  placeholder="e.g., Warm Up"
                  className={`input-text ${validationErrors.newSegmentName ? 'input-error' : ''}`}
                />
              </div>
              <div className="form-group">
                <label htmlFor="segment-minutes">Minutes</label>
                <input
                  id="segment-minutes"
                  type="number"
                  min="0"
                  max="99"
                  value={editingSegment.minutes}
                  onChange={e => {
                    setEditingSegment({ ...editingSegment, minutes: e.target.value });
                    if (validationErrors.newSegmentDuration) {
                      setValidationErrors({ ...validationErrors, newSegmentDuration: false });
                    }
                  }}
                  className={`input-number ${validationErrors.newSegmentDuration ? 'input-error' : ''}`}
                />
              </div>
              <div className="form-group">
                <label htmlFor="segment-seconds">Seconds</label>
                <input
                  id="segment-seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={editingSegment.seconds}
                  onChange={e => {
                    setEditingSegment({ ...editingSegment, seconds: e.target.value });
                    if (validationErrors.newSegmentDuration) {
                      setValidationErrors({ ...validationErrors, newSegmentDuration: false });
                    }
                  }}
                  className={`input-number ${validationErrors.newSegmentDuration ? 'input-error' : ''}`}
                />
              </div>
            </div>
            <button className="btn-add" onClick={addSegment}>
              + Add Segment
            </button>
          </div>
        </div>

        <div className="editor-summary">
          <div className="summary-item">
            <span className="summary-label">Duration per Round:</span>
            <span className="summary-value">{formatTime(totalDuration)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Duration:</span>
            <span className="summary-value">
              {rounds === 0 ? '∞' : formatTime(totalDuration * rounds)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Segments:</span>
            <span className="summary-value">{segments.length}</span>
          </div>
        </div>
      </div>

      <div className="editor-footer">
        <button className="btn-primary btn-done" onClick={handleDone}>
          ✓ Done
        </button>
      </div>
      </div>
    </div>
  );
};


