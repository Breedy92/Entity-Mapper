
import React, { useState } from 'react';
import { EntityNode, EntityType, Relationship, RelationshipType } from '../types';
import { UserIcon, BuildingIcon, ShieldIcon, PiggyIcon } from './Icons';

interface EntityCardProps {
  node: EntityNode;
  isSelected: boolean;
  isFocused: boolean;
  hasSelection: boolean;
  isConnectingSource?: boolean;
  allEdges: Relationship[];
  allNodes: EntityNode[];
  onSelect: (node: EntityNode) => void;
  onDragStart: (e: React.MouseEvent, node: EntityNode) => void;
}

const getIcon = (type: EntityType) => {
  switch (type) {
    case EntityType.INDIVIDUAL: return <UserIcon />;
    case EntityType.COMPANY: return <BuildingIcon />;
    case EntityType.TRUST: return <ShieldIcon />;
    case EntityType.SMSF: return <PiggyIcon />;
    default: return <BuildingIcon />;
  }
};

const getColors = (type: EntityType) => {
  switch (type) {
    case EntityType.INDIVIDUAL: return 'border-blue-500 text-blue-600 bg-white';
    case EntityType.COMPANY: return 'border-emerald-500 text-emerald-600 bg-white';
    case EntityType.TRUST: return 'border-amber-500 text-amber-600 bg-white';
    case EntityType.SMSF: return 'border-purple-500 text-purple-600 bg-white';
    default: return 'border-slate-500 text-slate-600 bg-white';
  }
};

export const EntityCard: React.FC<EntityCardProps> = ({ 
  node, 
  isSelected, 
  isFocused, 
  hasSelection, 
  isConnectingSource, 
  allEdges,
  allNodes,
  onSelect, 
  onDragStart 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = getColors(node.type);
  
  const opacityClass = hasSelection && !isFocused && !isSelected ? 'opacity-30 grayscale-[0.5] scale-95' : 'opacity-100 scale-100';

  const shareholders = allEdges.filter(e => e.targetId === node.id && e.type === RelationshipType.SHAREHOLDER);

  const handleInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node);
  };

  return (
    <div
      className={`absolute w-72 p-6 rounded-[2rem] border-2 cursor-move select-none transition-all duration-500 ease-out shadow-lg ${colors} ${opacityClass} ${isSelected ? 'ring-[6px] ring-indigo-500/10 border-indigo-500 shadow-2xl z-[100]' : 'z-40'} ${isConnectingSource ? 'border-dashed border-indigo-400 animate-pulse bg-indigo-50' : ''}`}
      style={{ 
        left: node.x, 
        top: node.y, 
        transform: 'translate(-50%, -50%)',
        height: isExpanded ? 'auto' : '160px'
      }}
      onMouseDown={(e) => {
        handleInteraction(e);
        onDragStart(e, node);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className={`p-3 rounded-2xl shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'} transition-all`}>
          {getIcon(node.type)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-1.5">
            {node.type}
          </div>
          <div className="font-bold text-sm truncate leading-tight text-slate-900">
            {node.name}
          </div>
        </div>
      </div>
      
      <div className={`transition-all duration-300 overflow-hidden relative z-10 ${isExpanded ? 'max-h-[600px]' : 'max-h-12'}`}>
        <p className={`text-[11px] leading-relaxed text-slate-500 font-medium ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {node.description || 'No detailed legal notes provided for this entity.'}
        </p>

        {isExpanded && node.type === EntityType.COMPANY && shareholders.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
              Shareholder Ledger
            </h4>
            <div className="space-y-2">
              {shareholders.map(sh => {
                const owner = allNodes.find(n => n.id === sh.sourceId);
                return (
                  <div key={sh.id} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-700 truncate mr-2">{owner?.name || 'Unknown'}</span>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                      {sh.metadata?.shares ? `${sh.metadata.shares} Shares` : '1 Share'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={(e) => { 
          e.stopPropagation();
          setIsExpanded(!isExpanded); 
        }}
        className="mt-4 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 transition-colors relative z-10"
      >
        {isExpanded ? 'Collapse Details ▲' : 'Detailed View ▼'}
      </button>
    </div>
  );
};
