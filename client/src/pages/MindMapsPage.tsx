import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitFork,
  Plus,
  Save,
  Trash2,
  BookOpen,
  Edit2,
  Check,
  Download,
  FolderOpen,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MindMap, MindMapSummary, Note } from '../types';
import { mindmapsService } from '../services/mindmaps.service';

const NODE_COLORS = ['#596A50', '#BF765C', '#D99B26', '#4E7271', '#3D3F37'];

// Custom Interactive Mind Map Node
const MindMapCustomNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState((data.label as string) || 'Topic');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText((data.label as string) || 'Topic');
  }, [data.label]);

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onLabelChange) {
      (data.onLabelChange as Function)(id, text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const nodeColor = (data.color as string) || '#596A50';
  const isRoot = !!data.isRoot;

  return (
    <div
      className={`relative group rounded-xl bg-white border-2 transition-all shadow-card p-3 min-w-[150px] max-w-[240px] ${
        selected ? 'ring-2 ring-offset-2 ring-olive-500' : ''
      }`}
      style={{ borderColor: nodeColor }}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-charcoal-700 border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-charcoal-700 border-2 !border-white" />

      {/* Node Content */}
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full text-xs font-semibold text-charcoal-900 border-0 p-0 focus:outline-none bg-paper-100 px-1 rounded"
            />
          ) : (
            <div
              onDoubleClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-charcoal-900 cursor-text select-none leading-snug break-words"
              title="Double click to edit label"
            >
              {text}
            </div>
          )}

          {/* Linked Note Preview Badge */}
          {Boolean(data.noteTitle) && (
            <div
              onClick={() => {
                if (data.onOpenLinkedNote) {
                  (data.onOpenLinkedNote as Function)(data.noteId);
                }
              }}
              className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-olive-700 bg-olive-50 px-1.5 py-0.5 rounded border border-olive-200 cursor-pointer hover:bg-olive-100 truncate max-w-full"
              title="Open linked note"
            >
              <BookOpen className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{String(data.noteTitle || '')}</span>
            </div>
          )}
        </div>

        {/* Action icons on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              if (data.onAddChild) (data.onAddChild as Function)(id);
            }}
            className="p-1 rounded bg-paper-100 hover:bg-paper-200 text-charcoal-600"
            title="Add Child Node"
          >
            <Plus className="w-3 h-3" />
          </button>
          {!isRoot && (
            <button
              type="button"
              onClick={() => {
                if (data.onDeleteNode) (data.onDeleteNode as Function)(id);
              }}
              className="p-1 rounded bg-paper-100 hover:bg-terracotta-50 text-terracotta-600"
              title="Delete Node"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const mindMapNodeTypes = {
  mindMapNode: MindMapCustomNode,
};

export const MindMapsPage: React.FC = () => {
  const { onOpenEditNote, allNotes } = useOutletContext<any>();

  const [mapsList, setMapsList] = useState<MindMapSummary[]>([]);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [mapName, setMapName] = useState('New Mind Map');
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string>('Saved');
  const [isLoading, setIsLoading] = useState(true);

  // Note linking modal state
  const [selectedNodeForLinking, setSelectedNodeForLinking] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Load user mind maps
  const loadMindMaps = async () => {
    setIsLoading(true);
    try {
      const list = await mindmapsService.getMindMaps();
      setMapsList(list);
      if (list.length > 0 && !activeMapId) {
        loadMapDetails(list[0].id);
      } else if (list.length === 0) {
        initDefaultMap();
      }
    } catch (err) {
      console.error('Failed to load mind maps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMindMaps();
  }, []);

  const initDefaultMap = () => {
    setActiveMapId(null);
    setMapName('My Research & Topic Map');
    const defaultNodes = [
      {
        id: 'node-root',
        type: 'mindMapNode',
        position: { x: 300, y: 220 },
        data: {
          label: 'Central Focus Topic',
          isRoot: true,
          color: '#596A50',
        },
      },
    ];
    setNodes(defaultNodes);
    setEdges([]);
    setSavedStatus('Unsaved New Map');
  };

  const loadMapDetails = async (id: string) => {
    try {
      const fullMap = await mindmapsService.getMindMapById(id);
      setActiveMapId(fullMap._id || fullMap.id || '');
      setMapName(fullMap.name || 'Mind Map');

      // Hydrate custom node handlers
      const hydratedNodes = (fullMap.nodes || []).map((n: any) => ({
        ...n,
        type: 'mindMapNode',
      }));

      setNodes(hydratedNodes);
      setEdges(fullMap.edges || []);
      setSavedStatus('All changes saved');
    } catch (err) {
      console.error('Failed to load map details:', err);
    }
  };

  // Node Handlers (change label, add child, delete node, link note)
  const handleLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, label: newLabel } }
          : n
      )
    );
    setSavedStatus('Unsaved changes');
  }, [setNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSavedStatus('Unsaved changes');
  }, [setNodes, setEdges]);

  const handleAddChild = useCallback((parentId: string) => {
    setNodes((nds) => {
      const parent = nds.find((n) => n.id === parentId);
      const newId = `node-${Date.now()}`;
      const px = parent ? parent.position.x + 220 : 400;
      const py = parent ? parent.position.y + Math.floor(Math.random() * 80) - 40 : 200;

      const randomColor = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];

      const newNode = {
        id: newId,
        type: 'mindMapNode',
        position: { x: px, y: py },
        data: {
          label: 'Sub-topic Node',
          color: randomColor,
        },
      };

      setEdges((eds) => [
        ...eds,
        {
          id: `edge-${parentId}-${newId}`,
          source: parentId,
          target: newId,
          animated: true,
          style: { stroke: randomColor, strokeWidth: 1.5 },
        },
      ]);

      return [...nds, newNode];
    });
    setSavedStatus('Unsaved changes');
  }, [setNodes, setEdges]);

  const handleOpenLinkedNote = (noteId: string) => {
    const target = allNotes.find((n: Note) => String(n._id || n.id) === String(noteId));
    if (target) {
      onOpenEditNote(target);
    }
  };

  // Wire up callbacks to node data
  const processedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onLabelChange: handleLabelChange,
      onDeleteNode: handleDeleteNode,
      onAddChild: handleAddChild,
      onOpenLinkedNote: handleOpenLinkedNote,
    },
  }));

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#596A50', strokeWidth: 1.5 } }, eds));
      setSavedStatus('Unsaved changes');
    },
    [setEdges]
  );

  // Save to Backend
  const handleSaveMap = async () => {
    if (!mapName.trim()) return;

    setIsSaving(true);
    try {
      const cleanNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          label: n.data.label,
          isRoot: n.data.isRoot,
          color: n.data.color,
          noteId: n.data.noteId,
          noteTitle: n.data.noteTitle,
        },
      }));

      if (activeMapId) {
        await mindmapsService.saveMindMap(activeMapId, {
          name: mapName.trim(),
          nodes: cleanNodes,
          edges,
        });
      } else {
        const created = await mindmapsService.createMindMap({
          name: mapName.trim(),
          nodes: cleanNodes,
          edges,
        });
        setActiveMapId(created._id || created.id || '');
      }

      setSavedStatus('All changes saved');
      const list = await mindmapsService.getMindMaps();
      setMapsList(list);
    } catch (err: any) {
      alert(err.message || 'Failed to save mind map');
    } finally {
      setIsSaving(false);
    }
  };

  // Export as JSON
  const handleExportJson = () => {
    const exportData = {
      name: mapName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mapName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-paper-100">
      {/* Top Studio Bar */}
      <div className="px-6 py-3 border-b border-paper-300 bg-white/95 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-terracotta-500 text-white flex items-center justify-center shadow-xs">
            <GitFork className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={mapName}
            onChange={(e) => {
              setMapName(e.target.value);
              setSavedStatus('Unsaved changes');
            }}
            placeholder="Mind Map Title..."
            className="text-base font-semibold text-charcoal-900 bg-transparent border-b border-transparent hover:border-paper-300 focus:border-olive-500 focus:outline-none px-1"
          />

          {/* Map Selector Dropdown */}
          {mapsList.length > 0 && (
            <select
              value={activeMapId || ''}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  initDefaultMap();
                } else {
                  loadMapDetails(e.target.value);
                }
              }}
              className="px-2 py-1 bg-paper-100 text-charcoal-700 text-xs rounded-lg border border-paper-300 focus:ring-0 cursor-pointer"
            >
              <option value="new">+ Create New Map</option>
              {mapsList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.nodeCount} nodes)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Canvas Actions */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] text-charcoal-500 font-mono hidden sm:inline">
            {savedStatus}
          </span>

          <button
            onClick={() => handleAddChild('node-root')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper-100 hover:bg-paper-200 text-charcoal-700 border border-paper-300 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-olive-600" />
            <span>Add Topic Node</span>
          </button>

          <button
            onClick={handleExportJson}
            className="p-1.5 rounded-lg text-charcoal-500 hover:bg-paper-100 border border-paper-300 transition-colors"
            title="Export as JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveMap}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-olive-500 hover:bg-olive-600 disabled:opacity-50 text-white font-semibold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Canvas'}</span>
          </button>
        </div>
      </div>

      {/* React Flow Mind Map Workspace */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={processedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={mindMapNodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={2.0}
        >
          <Background variant={BackgroundVariant.Lines} gap={30} size={1} color="#E8E5DD" />
          <Controls showInteractive={false} position="bottom-left" />
          <MiniMap
            nodeColor={(node: any) => node.data?.color || '#596A50'}
            position="bottom-right"
          />
        </ReactFlow>

        {/* Quick Instructions Overlay */}
        <div className="absolute top-4 left-6 z-10 bg-white/90 backdrop-blur-xs border border-paper-300 rounded-lg p-2.5 shadow-xs text-[11px] text-charcoal-500 hidden md:block max-w-xs">
          <p className="font-semibold text-charcoal-800 mb-0.5">Mind Map Gestures</p>
          <p>• <strong>Double click</strong> any node to edit its text.</p>
          <p>• Hover over a node and click <strong>+</strong> to sprout a connected child.</p>
          <p>• Drag connecting dots to link or disconnect thoughts.</p>
        </div>
      </div>
    </div>
  );
};
