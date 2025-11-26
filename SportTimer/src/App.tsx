import { useState, useEffect } from 'react';
import { Program, ViewMode } from './types';
import { ProgramList } from './components/ProgramList';
import { ProgramEditor } from './components/ProgramEditor';
import { TimerRunner } from './components/TimerRunner';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateId } from './utils/helpers';
import './App.css';

function App() {
  // Load programs and migrate data if necessary
  const [programs, setPrograms] = useLocalStorage<Program[]>('sporttimer-programs', []);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

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
    // Create a new program immediately
    const newProgram: Program = {
      id: generateId(),
      name: 'New Program',
      segments: [],
      rounds: 1,
      beepEnabled: true,
      createdAt: Date.now(),
    };
    
    // Add to programs list
    setPrograms([...programs, newProgram]);
    
    // Open editor with this program
    setSelectedProgram(newProgram);
    setViewMode('editor');
  };

  const handleEdit = (program: Program) => {
    setSelectedProgram(program);
    setViewMode('editor');
  };

  const handleSave = (program: Program) => {
    const existingIndex = programs.findIndex(p => p.id === program.id);
    
    const updatedPrograms = existingIndex >= 0
      ? programs.map((p, i) => i === existingIndex ? program : p)
      : [...programs, program];
    
    setPrograms(updatedPrograms);
  };

  const handleDelete = (programId: string) => {
    setPrograms(programs.filter(p => p.id !== programId));
  };

  const handleRun = (program: Program) => {
    setSelectedProgram(program);
    setViewMode('runner');
  };

  const handleCancel = (finalProgram?: Program) => {
    // Check the final program state if provided, otherwise fallback to selectedProgram
    const programToCheck = finalProgram || selectedProgram;
    
    // If the program has no segments, delete it
    if (programToCheck && programToCheck.segments.length === 0) {
      setPrograms((currentPrograms: Program[]) => currentPrograms.filter(p => p.id !== programToCheck.id));
    }
    
    setViewMode('list');
    setSelectedProgram(null);
  };

  return (
    <div className="app">
      {viewMode === 'list' && (
        <ProgramList
          programs={programs}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRun={handleRun}
        />
      )}

      {viewMode === 'editor' && (
        <ProgramEditor
          program={selectedProgram || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {viewMode === 'runner' && selectedProgram && (
        <TimerRunner
          program={selectedProgram}
          onExit={handleCancel}
        />
      )}
    </div>
  );
}

export default App;

