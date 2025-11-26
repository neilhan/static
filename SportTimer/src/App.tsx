import { useState } from 'react';
import { Program, ViewMode } from './types';
import { ProgramList } from './components/ProgramList';
import { ProgramEditor } from './components/ProgramEditor';
import { TimerRunner } from './components/TimerRunner';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateId } from './utils/helpers';
import './App.css';

function App() {
  const [programs, setPrograms] = useLocalStorage<Program[]>('sporttimer-programs', []);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleCreateNew = () => {
    // Create a new program immediately
    const newProgram: Program = {
      id: generateId(),
      name: 'New Program',
      segments: [],
      cycles: 1,
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
