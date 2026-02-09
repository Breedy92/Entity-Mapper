
import React from 'react';
import { EntityNode, RelationshipType } from '../types';

interface GroupedRole {
  type: RelationshipType;
  originalSourceId: string;
}

interface RelationshipEdgeProps {
  source: EntityNode;
  target: EntityNode;
  roles: GroupedRole[];
  isHighlighted: boolean;
  hasSelection: boolean;
}

/**
 * Calculates the intersection point of a line between two centers and a card boundary.
 * Cards are centered at (x, y) with fixed dimensions.
 */
function getIntersectionPoint(center: {x: number, y: number}, other: {x: number, y: number}) {
  const width = 256; // Card width
  const height = 120; // Card approximate height (based on content)
  
  const dx = other.x - center.x;
  const dy = other.y - center.y;
  
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  // Padding to prevent arrow head from touching the card text
  const padding = 15;
  const targetW = halfWidth + padding;
  const targetH = halfHeight + padding;

  if (Math.abs(dx) === 0 && Math.abs(dy) === 0) return center;

  // Slope-based intersection
  const scaleX = targetW / Math.abs(dx);
  const scaleY = targetH / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale
  };
}

export const RelationshipEdge: React.FC<RelationshipEdgeProps> = ({ 
  source, 
  target, 
  roles, 
  isHighlighted, 
  hasSelection 
}) => {
  if (!source || !target) return null;

  // Calculate clean intersection points so lines don't cross card centers
  const pSource = getIntersectionPoint(source, target);
  const pTarget = getIntersectionPoint(target, source);

  // Determine markers based on roles
  const hasForward = roles.some(r => r.originalSourceId === source.id);
  const hasBackward = roles.some(r => r.originalSourceId === target.id);

  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;

  const strokeColor = isHighlighted ? '#4F46E5' : '#CBD5E1';
  const strokeWidth = isHighlighted ? '2.5' : '1.5';
  const opacity = hasSelection && !isHighlighted ? 'opacity-5' : 'opacity-100';
  const showLabels = !hasSelection || isHighlighted;

  const markerId = isHighlighted ? 'highlight' : 'default';

  return (
    <g className={`transition-all duration-300 ${opacity}`}>
      {/* Interaction glow */}
      {isHighlighted && (
        <line x1={pSource.x} y1={pSource.y} x2={pTarget.x} y2={pTarget.y} stroke="#4F46E5" strokeWidth="8" strokeOpacity="0.08" strokeLinecap="round" />
      )}

      {/* Main Relationship Line with markers */}
      <line 
        x1={pSource.x} 
        y1={pSource.y} 
        x2={pTarget.x} 
        y2={pTarget.y} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        markerEnd={hasForward ? `url(#arrow-${markerId})` : undefined}
        markerStart={hasBackward ? `url(#arrow-${markerId})` : undefined}
        className="transition-colors duration-300"
      />

      {/* Label Pill */}
      {showLabels && (
        <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
          <rect
            x="-75"
            y={-(roles.length * 11 + 8)}
            width="150"
            height={roles.length * 22 + 16}
            rx="14"
            fill="white"
            stroke={isHighlighted ? '#4F46E5' : '#E2E8F0'}
            strokeWidth={isHighlighted ? '2' : '1'}
            className="shadow-xl"
          />
          {roles.map((role, idx) => {
            return (
              <text
                key={`${role.type}-${idx}`}
                y={-(roles.length * 11) + (idx * 22) + 16}
                textAnchor="middle"
                className={`text-[9px] font-black uppercase tracking-[0.1em] ${isHighlighted ? 'fill-indigo-600' : 'fill-slate-500'}`}
              >
                {role.type}
              </text>
            );
          })}
        </g>
      )}
    </g>
  );
};
