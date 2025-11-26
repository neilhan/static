import { useState, useEffect } from 'react';
import { Program, ViewMode, Tracker } from './types';
import { ProgramList } from './components/ProgramList';
import { ProgramEditor } from './components/ProgramEditor';
import { TrackerEditor } from './components/TrackerEditor';
import { TimerRunner } from './components/TimerRunner';
import { TrackerRunner } from './components/TrackerRunner';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateId } from './utils/helpers';
import './App.css';

function App() {
  // Load programs and migrate data if necessary
  const [programs, setPrograms] = useLocalStorage<Program[]>('sporttimer-programs', []);
  const [trackers, setTrackers] = useLocalStorage<Tracker[]>('sporttimer-trackers', []);
  const [displayOrder, setDisplayOrder] = useLocalStorage<string[]>('sporttimer-order', []);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [runningTracker, setRunningTracker] = useState<Tracker | null>(null);

  // Migration effect: Check for legacy 'cycles' and map to 'rounds'
  useEffect(() => {
    let hasChanges = false;
    const migratedPrograms = programs.map(p => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyP = p as any;
      if (anyP.cycles !== undefined && p.rounds === undefined) {
        hasChanges = true;
        return { ...p, rounds: anyP.cycles, cycles: undefined };
      }
      // Ensure rounds is defined if it's missing entirely
      if (p.rounds === undefined) {
        hasChanges = true;
        return { ...p, rounds: 1 };
      }
      return p;
    });

    if (hasChanges) {
      console.log('Migrating legacy data: cycles -> rounds');
      setPrograms(migratedPrograms);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleCreateNew = () => {
    // Create a new program for editing
    const newId = generateId();
    const newProgram: Program = {
      id: newId,
      name: 'New Program',
      segments: [],
      rounds: 1,
      beepEnabled: true,
      createdAt: Date.now(),
    };
    
    // Open editor with this program (don't add to list yet)
    setSelectedProgram(newProgram);
  };

  const handleEdit = (program: Program) => {
    setSelectedProgram(program);
  };

  const handleSave = (program: Program) => {
    const existingIndex = programs.findIndex(p => p.id === program.id);
    
    const updatedPrograms = existingIndex >= 0
      ? programs.map((p, i) => i === existingIndex ? program : p)
      : [...programs, program];
    
    setPrograms(updatedPrograms);
    
    // If not in display order, add it
    if (!displayOrder.includes(program.id)) {
      setDisplayOrder([...displayOrder, program.id]);
    }
    
    setSelectedProgram(null);
  };

  const handleDelete = (programId: string) => {
    setPrograms(programs.filter(p => p.id !== programId));
    setDisplayOrder(displayOrder.filter(id => id !== programId));
  };

  const handleRun = (program: Program) => {
    setViewMode('timer_runner');
    setSelectedProgram(program);
  };

  const handleExitTimerRunner = () => {
    setSelectedProgram(null);
    setViewMode('list');
  };

  const handleCancelProgramEditor = () => {
    setSelectedProgram(null);
  };

  // Tracker Handlers
  const handleCreateTracker = () => {
    const newId = generateId();
    const newTracker: Tracker = {
      id: newId,
      name: 'New Tracker',
      items: [],
    };
    setSelectedTracker(newTracker);
    // We don't add to state immediately, only on save
  };

  const handleEditTracker = (tracker: Tracker) => {
    setSelectedTracker(tracker);
  };

  const handleSaveTracker = (tracker: Tracker) => {
    const existingIndex = trackers.findIndex(t => t.id === tracker.id);
    
    if (existingIndex >= 0) {
      // Update existing
      const updatedTrackers = trackers.map((t, i) => i === existingIndex ? tracker : t);
      setTrackers(updatedTrackers);
    } else {
      // Create new
      setTrackers([...trackers, tracker]);
      setDisplayOrder([...displayOrder, tracker.id]);
    }
    
    setSelectedTracker(null);
  };

  const handleCancelTracker = () => {
    setSelectedTracker(null);
  };

  const handleDeleteTracker = (id: string) => {
    setTrackers(trackers.filter(t => t.id !== id));
    setDisplayOrder(displayOrder.filter(orderId => orderId !== id));
  };

  const handleAddCounterToTracker = (trackerId: string, counterName: string) => {
    setTrackers(trackers.map(t => {
      if (t.id === trackerId) {
        return {
          ...t,
          items: [...t.items, { id: generateId(), name: counterName, value: 0 }]
        };
      }
      return t;
    }));
  };

  const handleDeleteCounterFromTracker = (trackerId: string, counterId: string) => {
    setTrackers(trackers.map(t => {
      if (t.id === trackerId) {
        return {
          ...t,
          items: t.items.filter(i => i.id !== counterId)
        };
      }
      return t;
    }));
  };

  const handleUpdateCounter = (trackerId: string, counterId: string, delta: number) => {
    setTrackers(trackers.map(t => {
      if (t.id === trackerId) {
        return {
          ...t,
          items: t.items.map(item => {
            if (item.id === counterId) {
              return { ...item, value: item.value + delta };
            }
            return item;
          })
        };
      }
      return t;
    }));
  };

  const handleResetTracker = (trackerId: string) => {
    setTrackers(trackers.map(t => {
      if (t.id === trackerId) {
        return {
          ...t,
          items: t.items.map(item => ({ ...item, value: 0 }))
        };
      }
      return t;
    }));
  };

  const handleRunTracker = (tracker: Tracker) => {
    setRunningTracker(tracker);
    setViewMode('tracker_runner');
  };

  const handleExitTrackerRunner = () => {
    setRunningTracker(null);
    setViewMode('list');
  };

  const handleUpdateCounterInRunner = (counterId: string, delta: number) => {
    if (!runningTracker) return;
    
    // Update the tracker in state
    setTrackers(trackers.map(t => {
      if (t.id === runningTracker.id) {
        const updatedTracker = {
          ...t,
          items: t.items.map(item => {
            if (item.id === counterId) {
              return { ...item, value: item.value + delta };
            }
            return item;
          })
        };
        // Also update the running tracker state
        setRunningTracker(updatedTracker);
        return updatedTracker;
      }
      return t;
    }));
  };

  const handleResetTrackerInRunner = () => {
    if (!runningTracker) return;
    
    setTrackers(trackers.map(t => {
      if (t.id === runningTracker.id) {
        const resetTracker = {
          ...t,
          items: t.items.map(item => ({ ...item, value: 0 }))
        };
        setRunningTracker(resetTracker);
        return resetTracker;
      }
      return t;
    }));
  };

  const handleReorder = (newOrder: string[]) => {
    setDisplayOrder(newOrder);
  };

  return (
    <div className="app">
      {viewMode === 'list' && (
        <ProgramList
          programs={programs}
          trackers={trackers}
          displayOrder={displayOrder}
          onCreateNew={handleCreateNew}
          onCreateTracker={handleCreateTracker}
          onEdit={handleEdit}
          onEditTracker={handleEditTracker}
          onDelete={handleDelete}
          onRun={handleRun}
          onRunTracker={handleRunTracker}
          onDeleteTracker={handleDeleteTracker}
          onAddCounterToTracker={handleAddCounterToTracker}
          onDeleteCounterFromTracker={handleDeleteCounterFromTracker}
          onUpdateCounter={handleUpdateCounter}
          onResetTracker={handleResetTracker}
          onReorder={handleReorder}
        />
      )}

      {viewMode === 'list' && selectedProgram && (
        <ProgramEditor
          program={selectedProgram}
          onSave={handleSave}
          onCancel={handleCancelProgramEditor}
        />
      )}

      {viewMode === 'list' && selectedTracker && (
        <TrackerEditor
          tracker={selectedTracker}
          onSave={handleSaveTracker}
          onCancel={handleCancelTracker}
        />
      )}

      {viewMode === 'timer_runner' && selectedProgram && (
        <TimerRunner
          program={selectedProgram}
          onExit={handleExitTimerRunner}
        />
      )}

      {viewMode === 'tracker_runner' && runningTracker && (
        <TrackerRunner
          tracker={runningTracker}
          onUpdateCounter={handleUpdateCounterInRunner}
          onResetTracker={handleResetTrackerInRunner}
          onExit={handleExitTrackerRunner}
        />
      )}
    </div>
  );
}

export default App;
