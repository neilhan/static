import React from 'react';
import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  subtitle: React.ReactNode;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actions,
}) => (
  <div className="study-section-header">
    <div>
      <h2>{title}</h2>
      <p className="study-section-subtitle">{subtitle}</p>
    </div>
    {actions && <div className="study-section-actions">{actions}</div>}
  </div>
);

