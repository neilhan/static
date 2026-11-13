import React from 'react';
import { ConversationCollection } from '../types';
import { getReviewStatus } from '../utils/srs';

interface CollectionManagerProps {
  collections: ConversationCollection[];
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  collections,
}) => {
  return (
    <div className="collection-manager">
      <div className="collection-header">
        <h2>Spanish B1</h2>
      </div>

      <ul className="collection-list">
        {collections.map((collection) => {
          const total = collection.conversations.length;
          const entries = Object.values(collection.srsData);
          const mastered = entries.filter((s) => s.interval >= 21).length;
          const learning = entries.filter(
            (s) => s.repetition > 0 && s.interval < 21
          ).length;
          const newCount = Math.max(0, total - mastered - learning);
          const due = entries.filter(
            (s) => getReviewStatus(s.nextReview) === 'due'
          ).length;

          const masteredPct = total > 0 ? (mastered / total) * 100 : 0;
          const learningPct = total > 0 ? (learning / total) * 100 : 0;

          return (
            <li key={collection.id} className="collection-item">
              <div className="collection-row source-card source-card--static">
                <div className="source-card-top">
                  <span className="collection-name">{collection.name}</span>
                  {due > 0 && <span className="source-due-badge">{due} due</span>}
                </div>

                <div className="source-progress-track mastery-track">
                  <div
                    className="mastery-fill-mastered"
                    style={{ width: `${masteredPct}%` }}
                  />
                  <div
                    className="mastery-fill-learning"
                    style={{ width: `${learningPct}%` }}
                  />
                </div>

                <div className="mastery-breakdown">
                  <span className="mastery-chip mastered">
                    Mastered: {mastered}
                  </span>
                  <span className="mastery-chip learning">
                    Learning: {learning}
                  </span>
                  <span className="mastery-chip new">New: {newCount}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
