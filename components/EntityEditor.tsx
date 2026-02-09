
import React from 'react';
import { EntityNode, EntityType, Relationship, RelationshipType } from '../types';

interface EntityEditorProps {
  node: EntityNode;
  edges: Relationship[];
  allNodes: EntityNode[];
  onStartConnect: () => void;
  onChange: (updated: EntityNode) => void;
  onDelete: (id: string) => void;
  onUpdateEdge: (edgeId: string, type: RelationshipType, metadata?: any) => void;
  onDeleteEdge: (edgeId: string) => void;
  onAddRole: (sourceId: string, targetId: string) => void;
}

export const EntityEditor: React.FC<EntityEditorProps> = ({ 
  node, 
  edges, 
  allNodes, 
  onStartConnect, 
  onChange, 
  onDelete,
  onUpdateEdge,
  onDeleteEdge,
  onAddRole
}) => {
  const nodeEdges = edges.filter(e => e.sourceId === node.id || e.targetId === node.id);
  
  const groupedByTarget: Record<string, Relationship[]> = {};
  nodeEdges.forEach(e => {
    const otherId = e.sourceId === node.id ? e.targetId : e.sourceId;
    if (!groupedByTarget[otherId]) groupedByTarget[otherId] = [];
    groupedByTarget[otherId].push(e);
  });

  return (
    <div className="w-96 bg-white border-l border-slate-200 h-full p-8 overflow-y-auto flex flex-col shadow-2xl z-50 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Entity Editor</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {node.id.slice(0, 8)}</p>
        </div>
        <button 
          onClick={() => onDelete(node.id)}
          className="text-slate-300 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Legal Name</label>
          <input
            type="text"
            value={node.name}
            onChange={(e) => onChange({ ...node, name: e.target.value })}
            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-800 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Entity Type</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(EntityType).map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...node, type: t })}
                className={`py-2.5 px-4 rounded-xl text-[10px] font-black border-2 transition-all uppercase tracking-tighter ${node.type === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Description & Notes</label>
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-sm">
            <textarea
              value={node.description}
              onChange={(e) => onChange({ ...node, description: e.target.value })}
              className="w-full h-32 bg-transparent outline-none resize-none text-[11px] text-slate-600 leading-relaxed font-medium"
              placeholder="Registration details..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Relationships</label>
            <button 
              onClick={onStartConnect}
              className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              Connect
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(groupedByTarget).map(([otherId, rels]) => {
              const otherNode = allNodes.find(n => n.id === otherId);
              return (
                <div key={otherId} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-700 mb-3 truncate">{otherNode?.name || 'Unknown'}</p>
                  <div className="space-y-3">
                    {rels.map(rel => (
                      <div key={rel.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={rel.type}
                            onChange={(e) => onUpdateEdge(rel.id, e.target.value as RelationshipType, rel.metadata)}
                            className="flex-1 bg-transparent text-[10px] font-black uppercase text-indigo-600 outline-none"
                          >
                            {Object.values(RelationshipType).map(rt => (
                              <option key={rt} value={rt}>{rt}</option>
                            ))}
                          </select>
                          <button onClick={() => onDeleteEdge(rel.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        
                        {(rel.type === RelationshipType.SHAREHOLDER) && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Qty</span>
                            <input
                              type="text"
                              value={rel.metadata?.shares || ''}
                              onChange={(e) => onUpdateEdge(rel.id, rel.type, { ...rel.metadata, shares: e.target.value })}
                              placeholder="e.g. 100"
                              className="flex-1 bg-slate-50 text-[10px] font-bold text-slate-600 outline-none px-2 py-1 rounded"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
