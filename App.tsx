
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { EntityNode, Relationship, EntityType, MapData, RelationshipType } from './types';
import { EntityCard } from './components/EntityCard';
import { RelationshipEdge } from './components/RelationshipEdge';
import { EntityEditor } from './components/EntityEditor';
import { AIGenerator } from './components/AIGenerator';

const INITIAL_DATA: MapData = {
  nodes: [
    { id: 'n1', name: 'Alessandro Vicinanza', type: EntityType.INDIVIDUAL, description: 'Managing Director & Principal.', x: 300, y: 150 },
    { id: 'n2', name: 'Korine Vicinanza', type: EntityType.INDIVIDUAL, description: 'Director & Spouse.', x: 700, y: 150 },
    { id: 'n3', name: 'Vicio Pty Limited', type: EntityType.COMPANY, description: 'Holding Company & Trustee Layer.', x: 500, y: 400 },
    { id: 'n4', name: 'Cose Buone Pty Ltd', type: EntityType.COMPANY, description: 'Core Trading & Operating Entity.', x: 500, y: 650 },
    { id: 'n5', name: 'AK Italia Family Trust', type: EntityType.TRUST, description: 'Discretionary Wealth Vehicle.', x: 200, y: 800 },
    { id: 'n6', name: 'AK Italia Family Inv. Trust', type: EntityType.TRUST, description: 'Investment Accumulation Trust.', x: 800, y: 800 },
  ],
  edges: [
    { id: 'e1', sourceId: 'n1', targetId: 'n2', type: RelationshipType.PARTNER },
    { id: 'e2', sourceId: 'n1', targetId: 'n3', type: RelationshipType.DIRECTOR },
    { id: 'e3', sourceId: 'n1', targetId: 'n3', type: RelationshipType.SHAREHOLDER },
    { id: 'e4', sourceId: 'n2', targetId: 'n3', type: RelationshipType.DIRECTOR },
    { id: 'e5', sourceId: 'n2', targetId: 'n3', type: RelationshipType.SHAREHOLDER },
    { id: 'e6', sourceId: 'n3', targetId: 'n4', type: RelationshipType.SHAREHOLDER },
    { id: 'e7', sourceId: 'n1', targetId: 'n4', type: RelationshipType.DIRECTOR },
    { id: 'e8', sourceId: 'n2', targetId: 'n4', type: RelationshipType.DIRECTOR },
    { id: 'e9', sourceId: 'n3', targetId: 'n6', type: RelationshipType.TRUSTEE },
    { id: 'e10', sourceId: 'n1', targetId: 'n5', type: RelationshipType.BENEFICIARY },
    { id: 'e11', sourceId: 'n2', targetId: 'n5', type: RelationshipType.BENEFICIARY },
    { id: 'e12', sourceId: 'n1', targetId: 'n6', type: RelationshipType.BENEFICIARY },
  ]
};

export interface GroupedRole {
  type: RelationshipType;
  originalSourceId: string;
}

export interface GroupedEdge {
  sourceId: string;
  targetId: string;
  roles: GroupedRole[];
}

const App: React.FC = () => {
  const [data, setData] = useState<MapData>(INITIAL_DATA);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<EntityNode | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  const groupedEdges = useMemo(() => {
    const groups: Record<string, GroupedEdge> = {};
    data.edges.forEach(edge => {
      const [id1, id2] = [edge.sourceId, edge.targetId].sort();
      const key = `${id1}-${id2}`;
      if (!groups[key]) {
        groups[key] = { sourceId: id1, targetId: id2, roles: [] };
      }
      groups[key].roles.push({ type: edge.type, originalSourceId: edge.sourceId });
    });
    return Object.values(groups);
  }, [data.edges]);

  const focusedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>([selectedNodeId]);
    data.edges.forEach(e => {
      if (e.sourceId === selectedNodeId) ids.add(e.targetId);
      if (e.targetId === selectedNodeId) ids.add(e.sourceId);
    });
    return ids;
  }, [selectedNodeId, data.edges]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 0.999 ** e.deltaY;
    const newScale = Math.min(Math.max(transform.scale * scaleFactor, 0.05), 5);
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);
    setTransform({ x: newX, y: newY, scale: newScale });
  }, [transform]);

  const handleDragStart = useCallback((e: React.MouseEvent, node: EntityNode) => {
    e.stopPropagation();
    setDraggingNode(node);
    dragOffset.current = { 
      x: (e.clientX - transform.x) / transform.scale - node.x, 
      y: (e.clientY - transform.y) / transform.scale - node.y 
    };
  }, [transform]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.button === 0 || e.button === 1) && !draggingNode) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [draggingNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNode) {
      const localX = (e.clientX - transform.x) / transform.scale - dragOffset.current.x;
      const localY = (e.clientY - transform.y) / transform.scale - dragOffset.current.y;
      setData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === draggingNode.id ? { ...n, x: localX, y: localY } : n)
      }));
    } else if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [draggingNode, isPanning, transform]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
  }, []);

  const handleNodeSelection = useCallback((node: EntityNode) => {
    if (isConnecting) {
      if (isConnecting !== node.id) {
        const newEdge: Relationship = { 
          id: `e-${Date.now()}`, 
          sourceId: isConnecting, 
          targetId: node.id, 
          type: RelationshipType.SHAREHOLDER 
        };
        setData(prev => ({ ...prev, edges: [...prev.edges, newEdge] }));
        setIsConnecting(null);
      } else {
        setIsConnecting(null);
      }
    } else {
      setSelectedNodeId(prev => prev === node.id ? null : node.id);
    }
  }, [isConnecting]);

  const handleAddEntity = useCallback(() => {
    const viewportCenterX = (window.innerWidth / 2 - transform.x) / transform.scale;
    const viewportCenterY = (window.innerHeight / 2 - transform.y) / transform.scale;
    const newNode: EntityNode = {
      id: `n-${Date.now()}`,
      name: 'New Entity',
      type: EntityType.INDIVIDUAL,
      description: 'Newly created entity. Edit to add details.',
      x: viewportCenterX,
      y: viewportCenterY
    };
    setData(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setSelectedNodeId(newNode.id);
  }, [transform]);

  const connectingNodeName = useMemo(() => {
    if (!isConnecting) return null;
    return data.nodes.find(n => n.id === isConnecting)?.name;
  }, [isConnecting, data.nodes]);

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      style={{ cursor: isPanning ? 'grabbing' : draggingNode ? 'grabbing' : isConnecting ? 'crosshair' : 'auto' }}
    >
      <div 
        className="absolute inset-0 graph-grid pointer-events-none opacity-30 z-0"
        style={{ 
          backgroundPosition: `${transform.x}px ${transform.y}px`,
          backgroundSize: `${40 * transform.scale}px ${40 * transform.scale}px`
        }}
      ></div>
      
      <div className="flex-1 relative overflow-hidden z-10" onClick={() => { setSelectedNodeId(null); setIsConnecting(null); }}>
        <div style={{ 
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, 
          transformOrigin: '0 0', 
          width: '0px', 
          height: '0px', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          transition: draggingNode || isPanning ? 'none' : 'transform 0.1s ease-out' 
        }}>
          <svg style={{ overflow: 'visible', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow-default" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 L 2 5 z" fill="#CBD5E1" />
              </marker>
              <marker id="arrow-highlight" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 L 2 5 z" fill="#4F46E5" />
              </marker>
            </defs>
            {groupedEdges.map(group => {
              const source = data.nodes.find(n => n.id === group.sourceId);
              const target = data.nodes.find(n => n.id === group.targetId);
              if (!source || !target) return null;
              return (
                <RelationshipEdge
                  key={`edge-${group.sourceId}-${group.targetId}`}
                  source={source}
                  target={target}
                  roles={group.roles}
                  isHighlighted={selectedNodeId === group.sourceId || selectedNodeId === group.targetId}
                  hasSelection={!!selectedNodeId}
                />
              );
            })}
          </svg>

          {data.nodes.map(node => (
            <EntityCard
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isFocused={focusedNodeIds.has(node.id)}
              hasSelection={!!selectedNodeId}
              isConnectingSource={isConnecting === node.id}
              onSelect={handleNodeSelection}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-10 left-10 flex flex-col gap-3 z-50">
        <button 
          onClick={handleAddEntity}
          className="bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-3 active:scale-95 group"
        >
          <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white group-hover:text-indigo-600 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Create Entity</span>
        </button>
      </div>

      {isConnecting && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[200] pointer-events-none animate-in fade-in slide-in-from-top-4">
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-indigo-400">
            <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
            <span className="text-[11px] font-black uppercase tracking-widest">
              Connecting <span className="underline decoration-indigo-300 underline-offset-4">{connectingNodeName}</span>... Select target node
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsConnecting(null); }}
              className="pointer-events-auto ml-2 bg-indigo-500 hover:bg-indigo-400 p-1 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-10 right-10 flex flex-col gap-2 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-1 flex flex-col gap-1">
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.min(t.scale + 0.2, 5) }))} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg></button>
          <div className="h-px bg-slate-100 mx-2" />
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.max(t.scale - 0.2, 0.05) }))} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg></button>
        </div>
        <button onClick={() => setTransform({ x: window.innerWidth/4, y: window.innerHeight/4, scale: 0.8 })} className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all">Reset View</button>
      </div>

      {selectedNodeId && data.nodes.find(n => n.id === selectedNodeId) && (
        <EntityEditor
          node={data.nodes.find(n => n.id === selectedNodeId)!}
          edges={data.edges}
          allNodes={data.nodes}
          onStartConnect={() => setIsConnecting(selectedNodeId)}
          onChange={(u) => setData(p => ({ ...p, nodes: p.nodes.map(n => n.id === u.id ? u : n) }))}
          onDelete={(id) => {
            setData(p => ({ nodes: p.nodes.filter(n => n.id !== id), edges: p.edges.filter(e => e.sourceId !== id && e.targetId !== id) }));
            setSelectedNodeId(null);
          }}
          onUpdateEdge={(id, type) => setData(p => ({ ...p, edges: p.edges.map(e => e.id === id ? { ...e, type } : e) }))}
          onDeleteEdge={(id) => setData(p => ({ ...p, edges: p.edges.filter(e => e.id !== id) }))}
          onAddRole={(src, tgt) => {
             const newEdge: Relationship = { id: `e-${Date.now()}`, sourceId: src, targetId: tgt, type: RelationshipType.SHAREHOLDER };
            setData(prev => ({ ...prev, edges: [...prev.edges, newEdge] }));
          }}
        />
      )}
      <AIGenerator onGenerated={(newData) => { setData(newData); setSelectedNodeId(null); setTransform({ x: 0, y: 0, scale: 1 }); }} />
    </div>
  );
};

export default App;
