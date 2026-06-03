import React, { useEffect, useState } from 'react';

interface LogicalPhysicalBarProps {
  activeTab: 'logical' | 'physical';
  setActiveTab: (tab: 'logical' | 'physical') => void;
  nodeCount: number;
  linkCount: number;
}

export const LogicalPhysicalBar: React.FC<LogicalPhysicalBarProps> = ({
  activeTab,
  setActiveTab,
  nodeCount,
  linkCount,
}) => {
  const [timeSeconds, setTimeSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimeSeconds((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="cisco-logical-bar">
      <div className="cisco-tab-switch">
        <button
          onClick={() => setActiveTab('logical')}
          className={`cisco-tab ${activeTab === 'logical' ? 'active' : ''}`}
        >
          Logical View
        </button>
        <button
          onClick={() => setActiveTab('physical')}
          className={`cisco-tab ${activeTab === 'physical' ? 'active' : ''}`}
        >
          Physical View
        </button>
      </div>

      <div className="cisco-status-metrics">
        <span>
          <strong>Path:</strong>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Root</span>
        </span>
        <span>
          <strong>Topology:</strong>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {nodeCount} Nodes | {linkCount} Links
          </span>
        </span>
        <div className="cisco-status-pill">
          <span>Sim Time</span>
          <span style={{ color: '#fff' }}>{formatTime(timeSeconds)}</span>
        </div>
      </div>
    </div>
  );
};
