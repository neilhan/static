import React, { useState } from 'react';
import { ConversationCollection } from '../types';

interface CollectionManagerProps {
  collections: ConversationCollection[];
  activeCollectionId: string | null;
  onSelectCollection: (id: string) => void;
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRenameCollection: (id: string, newName: string) => void;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  collections,
  activeCollectionId,
  onSelectCollection,
  onCreateCollection,
  onDeleteCollection,
  onRenameCollection,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsCreating(false);
    }
  };

  const startEditing = (collection: ConversationCollection) => {
    setEditingId(collection.id);
    setEditName(collection.name);
  };

  const saveEditing = (id: string) => {
    if (editName.trim()) {
      onRenameCollection(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="collection-manager">
      <div className="collection-header">
        <h2>My Collections</h2>
        <button 
          className="btn-outline btn-sm"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? 'Cancel' : '+ New Collection'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="create-collection-form">
          <input
            type="text"
            placeholder="Collection Name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary btn-sm">Create</button>
        </form>
      )}

      <ul className="collection-list">
        {collections.map(collection => (
          <li 
            key={collection.id} 
            className={`collection-item ${collection.id === activeCollectionId ? 'active' : ''}`}
          >
            {editingId === collection.id ? (
               <div className="edit-collection-row">
                 <input 
                   type="text" 
                   value={editName} 
                   onChange={(e) => setEditName(e.target.value)}
                   onBlur={() => saveEditing(collection.id)}
                   onKeyDown={(e) => e.key === 'Enter' && saveEditing(collection.id)}
                   autoFocus
                 />
               </div>
            ) : (
              <div className="collection-row" onClick={() => onSelectCollection(collection.id)}>
                <span className="collection-name">{collection.name}</span>
                <div className="collection-meta">
                  {collection.conversations.length} conv
                </div>
                <div className="collection-actions">
                  <button 
                    className="icon-btn"
                    title="Rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(collection);
                    }}
                  >
                    ✎
                  </button>
                  {collections.length > 1 && (
                    <button 
                      className="icon-btn danger"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if(confirm(`Delete "${collection.name}"?`)) {
                          onDeleteCollection(collection.id);
                        }
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

