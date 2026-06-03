import React from 'react';
import type { Link } from '../../types/network';

interface ConnectorLineProps {
  link: Link;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isSelected: boolean;
  onSelect: (linkId: string) => void;
  onDelete: (linkId: string) => void;
}

export const ConnectorLine: React.FC<ConnectorLineProps> = ({
  link,
  x1,
  y1,
  x2,
  y2,
  isSelected,
  onSelect,
  onDelete
}) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Subtle curve for visual clarity
  const pathData = `M ${x1} ${y1} Q ${midX + (y2 - y1) * 0.05} ${midY - (x2 - x1) * 0.05} ${x2} ${y2}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(link.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(link.id);
  };

  // Endpoint indicators
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const offset = 34;

  let p1 = { x: x1, y: y1 };
  let p2 = { x: x2, y: y2 };

  if (len > 0) {
    const ux = dx / len;
    const uy = dy / len;
    p1 = { x: x1 + ux * offset, y: y1 + uy * offset };
    p2 = { x: x2 - ux * offset, y: y2 - uy * offset };
  }

const isLinkActive = link.status === 'active';
   const indicatorColor = isLinkActive ? 'var(--accent-magenta)' : 'var(--accent-magenta)';

   const lineGradId = `lineGrad-${link.id}`;

   return (
     <g onClick={handleClick} style={{ cursor: 'pointer' }}>
       <defs>
         <linearGradient id={lineGradId} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
           <stop offset="0%" stopColor={isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
           <stop offset="50%" stopColor={isSelected ? 'var(--accent-secondary)' : 'var(--text-tertiary)'} />
           <stop offset="100%" stopColor={isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
         </linearGradient>
       </defs>

       {/* Invisible fat hit area */}
       <path
         d={pathData}
         fill="none"
         stroke="transparent"
         strokeWidth="16"
       />

       {/* Glow layer for selected state */}
       {isSelected && (
         <path
           d={pathData}
           fill="none"
           stroke="var(--accent-primary)"
           strokeWidth="6"
           style={{ opacity: 0.15, filter: 'blur(4px)' }}
         />
       )}

       {/* Main visible line */}
       <path
         d={pathData}
         fill="none"
         stroke={`url(#${lineGradId})`}
         strokeWidth={isSelected ? '2.5' : '1.5'}
         style={{
           transition: 'stroke-width 0.25s ease',
         }}
       />

       {/* Animated flow dash */}
       <path
         d={pathData}
         fill="none"
         stroke={isSelected ? 'var(--text-primary)' : 'var(--accent-primary)'}
         strokeWidth="1"
         strokeDasharray="6 18"
         style={{
           animation: 'flow-dash 2s linear infinite',
           opacity: 0.7,
         }}
       />

       {/* Link status indicators (small circles instead of triangles for cleaner look) */}
       <circle
         cx={p1.x}
         cy={p1.y}
         r="3.5"
         fill={indicatorColor}
         stroke="rgba(0,0,0,0.3)"
         strokeWidth="0.5"
         style={{ filter: `drop-shadow(0 0 3px var(--border-active))` }}
       />
       <circle
         cx={p2.x}
         cy={p2.y}
         r="3.5"
         fill={indicatorColor}
         stroke="rgba(0,0,0,0.3)"
         strokeWidth="0.5"
         style={{ filter: `drop-shadow(0 0 3px var(--border-active))` }}
       />

       {/* Delete handle */}
       {isSelected && (
         <g transform={`translate(${midX - 9}, ${midY - 9})`} onClick={handleDelete} style={{ cursor: 'pointer' }}>
           <circle cx="9" cy="9" r="10" fill="var(--accent-magenta)" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5"
             style={{ filter: 'drop-shadow(0 2px 6px var(--border-active))' }} />
           <path d="M6 6l6 6M12 6l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
         </g>
       )}
    </g>
  );
};
