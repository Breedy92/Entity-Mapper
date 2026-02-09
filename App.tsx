
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { EntityNode, Relationship, EntityType, MapData, RelationshipType, Strategy } from './types';
import { EntityCard } from './components/EntityCard';
import { RelationshipEdge } from './components/RelationshipEdge';
import { EntityEditor } from './components/EntityEditor';
import { AIGenerator } from './components/AIGenerator';
import { LandingPage } from './components/LandingPage';
import { ScenarioToggle } from './components/ScenarioToggle';
import { StrategySidebar } from './components/StrategySidebar';

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
    { id: 'e3', sourceId: 'n1', targetId: 'n3', type: RelationshipType.SHAREHOLDER, metadata: { shares: '1' } },
    { id: 'e4', sourceId: 'n2', targetId: 'n3', type: RelationshipType.DIRECTOR },
    { id: 'e5', sourceId: 'n2', targetId: 'n3', type: RelationshipType.SHAREHOLDER, metadata: { shares: '1' } },
    { id: 'e6', sourceId: 'n3', targetId: 'n4', type: RelationshipType.SHAREHOLDER, metadata: { shares: '1000' } },
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Strategy Management
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [activeStrategyId, setActiveStrategyId] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isStrategySidebarOpen, setIsStrategySidebarOpen] = useState(false);

  // Scoped data states
  const [existingData, setExistingData] = useState<MapData>(INITIAL_DATA);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<EntityNode | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Current active data based on selection
  const data = useMemo(() => {
    if (activeStrategyId === null || isComparing) return existingData;
    const strategy = strategies.find(s => s.id === activeStrategyId);
    return strategy ? strategy.data : existingData;
  }, [activeStrategyId, isComparing, existingData, strategies]);

  const activeStrategy = useMemo(() => strategies.find(s => s.id === activeStrategyId), [strategies, activeStrategyId]);

  const updateActiveData = useCallback((newData: MapData) => {
    if (activeStrategyId === null || isComparing) {
      setExistingData(newData);
    } else {
      setStrategies(prev => prev.map(s => s.id === activeStrategyId ? { ...s, data: newData } : s));
    }
  }, [activeStrategyId, isComparing]);

  const handleAddStrategy = () => {
    const newStrategy: Strategy = {
      id: `strat-${Date.now()}`,
      name: `Scenario ${strategies.length + 1}`,
      description: 'New proposed client strategy',
      data: JSON.parse(JSON.stringify(existingData)), // Clone existing as baseline
      createdAt: Date.now()
    };
    setStrategies([...strategies, newStrategy]);
    setActiveStrategyId(newStrategy.id);
    setIsComparing(false);
  };

  const handleSelectStrategy = (id: string | null) => {
    setActiveStrategyId(id);
    if (id === null) setIsComparing(false);
  };

  const handleDeleteStrategy = (id: string) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
    if (activeStrategyId === id) setActiveStrategyId(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('uuid') || params.has('id')) {
      setIsAuthenticated(true);
    }
  }, []);

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

  const handleDragStart = useCallback((e: React.MouseEvent, node: EntityNode) => {
    e.stopPropagation();
    setDraggingNode(node);
    dragOffset.current = { 
      x: (e.clientX - transform.x) / transform.scale - node.x, 
      y: (e.clientY - transform.y) / transform.scale - node.y 
    };
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isAuthenticated) return;
    if (draggingNode) {
      const localX = (e.clientX - transform.x) / transform.scale - dragOffset.current.x;
      const localY = (e.clientY - transform.y) / transform.scale - dragOffset.current.y;
      const newData = {
        ...data,
        nodes: data.nodes.map(n => n.id === draggingNode.id ? { ...n, x: localX, y: localY } : n)
      };
      updateActiveData(newData);
    } else if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [draggingNode, isPanning, transform, isAuthenticated, data, updateActiveData]);

  if (!isAuthenticated) {
    return <LandingPage onEnterSimulation={() => setIsAuthenticated(true)} />;
  }

  const isProposedMode = activeStrategyId !== null && !isComparing;

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden transition-colors duration-1000 relative ${isProposedMode ? 'bg-[#F5F3FF]' : 'bg-[#F8FAFC]'}`}
      onMouseMove={handleMouseMove}
      onMouseUp={() => { setDraggingNode(null); setIsPanning(false); }}
      onMouseDown={(e) => { if (!draggingNode) { setIsPanning(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; } }}
      onWheel={(e) => {
        const scaleFactor = 0.999 ** e.deltaY;
        const newScale = Math.min(Math.max(transform.scale * scaleFactor, 0.05), 5);
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
        const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);
        setTransform({ x: newX, y: newY, scale: newScale });
      }}
    >
      {/* Background Indicators */}
      <div className={`absolute inset-0 graph-grid pointer-events-none transition-opacity duration-1000 z-0 ${isProposedMode ? 'opacity-40' : 'opacity-20'}`} style={{ 
        backgroundPosition: `${transform.x}px ${transform.y}px`, 
        backgroundSize: `${40 * transform.scale}px ${40 * transform.scale}px`,
        backgroundImage: isProposedMode ? 'radial-gradient(#6366f1 1.2px, transparent 1.2px)' : 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)'
      }}></div>

      {activeStrategyId && (
        <ScenarioToggle isComparing={isComparing} onToggle={setIsComparing} strategyName={activeStrategy?.name || 'Proposed'} />
      )}

      <StrategySidebar 
        strategies={strategies} 
        activeStrategyId={activeStrategyId} 
        isOpen={isStrategySidebarOpen} 
        onToggle={() => setIsStrategySidebarOpen(!isStrategySidebarOpen)} 
        onSelect={handleSelectStrategy}
        onAdd={handleAddStrategy}
        onDelete={handleDeleteStrategy}
      />

      <div className="flex-1 relative z-10" onClick={() => { setSelectedNodeId(null); setIsConnecting(null); }}>
        <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', position: 'absolute' }}>
          <svg style={{ overflow: 'visible', position: 'absolute', pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow-default" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 L 2 5 z" fill="#CBD5E1" /></marker>
              <marker id="arrow-highlight" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 L 2 5 z" fill="#4F46E5" /></marker>
            </defs>
            {groupedEdges.map(group => (
              <RelationshipEdge key={`${group.sourceId}-${group.targetId}`} source={data.nodes.find(n => n.id === group.sourceId)!} target={data.nodes.find(n => n.id === group.targetId)!} roles={group.roles} isHighlighted={selectedNodeId === group.sourceId || selectedNodeId === group.targetId} hasSelection={!!selectedNodeId} />
            ))}
          </svg>
          {data.nodes.map(node => (
            <EntityCard key={node.id} node={node} allEdges={data.edges} allNodes={data.nodes} isSelected={selectedNodeId === node.id} isFocused={focusedNodeIds.has(node.id)} hasSelection={!!selectedNodeId} isConnectingSource={isConnecting === node.id} onSelect={(n) => { 
              if (isConnecting && isConnecting !== n.id) { 
                updateActiveData({ ...data, edges: [...data.edges, { id: `e-${Date.now()}`, sourceId: isConnecting, targetId: n.id, type: RelationshipType.SHAREHOLDER }] }); 
                setIsConnecting(null); 
              } else { 
                setSelectedNodeId(prev => prev === n.id ? null : n.id); 
              } 
            }} onDragStart={handleDragStart} />
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-10 left-10 flex flex-col gap-3 z-50">
        <button onClick={() => { 
          const newNode: EntityNode = { id: `n-${Date.now()}`, name: 'New Entity', type: EntityType.INDIVIDUAL, description: 'Notes...', x: (window.innerWidth/2 - transform.x)/transform.scale, y: (window.innerHeight/2 - transform.y)/transform.scale };
          updateActiveData({ ...data, nodes: [...data.nodes, newNode] });
          setSelectedNodeId(newNode.id);
        }} className="bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-3 active:scale-95 group">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Create Entity</span>
        </button>
        
        <button onClick={() => setIsAuthenticated(false)} className="bg-white text-slate-400 px-4 py-2 rounded-2xl shadow-lg hover:text-slate-900 transition-all text-[9px] font-black uppercase tracking-widest border border-slate-100">
          Sign Out
        </button>
      </div>

      {/* Right Sidebar Editor */}
      {selectedNodeId && data.nodes.find(n => n.id === selectedNodeId) && (
        <EntityEditor 
          node={data.nodes.find(n => n.id === selectedNodeId)!} 
          edges={data.edges} 
          allNodes={data.nodes} 
          onStartConnect={() => setIsConnecting(selectedNodeId)} 
          onChange={(u) => updateActiveData({ ...data, nodes: data.nodes.map(n => n.id === u.id ? u : n) })} 
          onDelete={(id) => { updateActiveData({ nodes: data.nodes.filter(n => n.id !== id), edges: data.edges.filter(e => e.sourceId !== id && e.targetId !== id) }); setSelectedNodeId(null); }} 
          onUpdateEdge={(id, type, meta) => updateActiveData({ ...data, edges: data.edges.map(e => e.id === id ? { ...e, type, metadata: meta } : e) })} 
          onDeleteEdge={(id) => updateActiveData({ ...data, edges: data.edges.filter(e => e.id !== id) })} 
          onAddRole={(src, tgt) => updateActiveData({ ...data, edges: [...data.edges, { id: `e-${Date.now()}`, sourceId: src, targetId: tgt, type: RelationshipType.SHAREHOLDER }] })} 
        />
      )}

      {/* AI Assistant */}
      <AIGenerator currentData={data} onGenerated={(newData) => { updateActiveData(newData); setSelectedNodeId(null); }} />

      {/* Strategy Indicator Overlay */}
      {isProposedMode && (
        <div className="fixed bottom-10 right-10 pointer-events-none animate-bounce">
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl text-[10px] font-black uppercase tracking-[0.2em]">
            Mode: Strategy Builder
          </div>
        </div>
      )}

      {/* Comparison Legend */}
      {isComparing && (
        <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl z-50">
          <div className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-2">Comparison Legend</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-slate-400"></div>
              <span className="text-[10px] font-bold">Existing Structure</span>
            </div>
            <div className="flex items-center gap-3 opacity-50 italic">
              <span className="text-[10px]">Strategy values hidden in compare mode</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
