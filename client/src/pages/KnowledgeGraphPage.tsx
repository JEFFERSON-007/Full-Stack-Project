import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network,
  Search,
  BookOpen,
  Code,
  Link as LinkIcon,
  Sparkles,
  Filter,
  ExternalLink,
  Edit3,
  X,
  Star,
  Info
} from 'lucide-react';
import { Note, Collection, NoteType } from '../types';
import { notesService } from '../services/notes.service';

// Custom Knowledge Node for React Flow
const KnowledgeNode: React.FC<NodeProps> = ({ data, selected }) => {
  const getTypeIcon = (type: NoteType) => {
    switch (type) {
      case 'code':
        return <Code className="w-3.5 h-3.5 text-terracotta-600" />;
      case 'link':
        return <LinkIcon className="w-3.5 h-3.5 text-amberGold-500" />;
      case 'research':
        return <Sparkles className="w-3.5 h-3.5 text-sageTeal-500" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-olive-600" />;
    }
  };

  const isMatched = data.isMatched;

  return (
    <div
      className={`px-3.5 py-2.5 rounded-xl bg-white border transition-all duration-200 cursor-pointer shadow-card min-w-[180px] max-w-[220px] ${
        selected
          ? 'border-olive-600 ring-2 ring-olive-500/20 shadow-lg'
          : isMatched
          ? 'border-amberGold-500 ring-2 ring-amberGold-500/30'
          : 'border-paper-300 hover:border-paper-400'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-olive-500 border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-olive-500 border-2 !border-white" />

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-paper-100 border border-paper-300">
            {getTypeIcon(data.type as NoteType)}
          </div>
          {Boolean(data.collectionName) && (
            <span className="flex items-center gap-1 text-[10px] text-charcoal-500 truncate max-w-[110px]">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: String(data.collectionColor || '#596A50') }}
              />
              <span className="truncate">{String(data.collectionName || '')}</span>
            </span>
          )}
        </div>
        {Boolean(data.isFavorite) && (
          <Star className="w-3 h-3 text-amberGold-500 fill-amberGold-500 flex-shrink-0" />
        )}
      </div>

      <h4 className="text-xs font-semibold text-charcoal-900 line-clamp-2 leading-tight">
        {String(data.title || '')}
      </h4>

      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {data.tags.slice(0, 2).map((t: string) => (
            <span
              key={t}
              className="text-[9px] text-charcoal-500 bg-paper-100 px-1 py-0.2 rounded border border-paper-300"
            >
              #{t}
            </span>
          ))}
          {data.tags.length > 2 && (
            <span className="text-[9px] text-charcoal-400">+{data.tags.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  knowledgeNode: KnowledgeNode,
};

export const KnowledgeGraphPage: React.FC = () => {
  const { onOpenEditNote, collections } = useOutletContext<any>();

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCollection, setFilterCollection] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Fetch all notes
  useEffect(() => {
    setIsLoading(true);
    notesService
      .getNotes()
      .then((res) => {
        setNotes(res.notes || []);
      })
      .catch((err) => console.error('Error fetching graph notes:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Compute Layout: radial/circular layout for visual elegance
  useEffect(() => {
    if (notes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Filter notes based on active toolbar filters
    const filteredNotes = notes.filter((n) => {
      if (filterCollection !== 'all' && String(n.collectionId) !== filterCollection) {
        return false;
      }
      if (filterType !== 'all' && n.type !== filterType) {
        return false;
      }
      return true;
    });

    const colMap = new Map();
    for (const c of collections) {
      colMap.set(String(c._id || c.id), c);
    }

    // Compute nodes positions in an aesthetic layout
    const radius = Math.max(260, filteredNotes.length * 40);
    const centerX = 450;
    const centerY = 320;

    const newNodes = filteredNotes.map((note, index) => {
      const angle = (index / filteredNotes.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle) - 100;
      const y = centerY + radius * Math.sin(angle) - 40;

      const col = note.collectionId ? colMap.get(String(note.collectionId)) : null;
      const isMatched =
        searchQuery.trim().length > 0 &&
        (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (note.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      return {
        id: String(note._id || note.id),
        type: 'knowledgeNode',
        position: { x, y },
        data: {
          note,
          title: note.title,
          type: note.type,
          tags: note.tags,
          isFavorite: note.isFavorite,
          collectionName: col?.name || '',
          collectionColor: col?.color || '#596A50',
          isMatched,
        },
      };
    });

    // Compute edges based on:
    // 1. Explicit relatedNotes
    // 2. Shared tags (if they share 2+ tags)
    const newEdges: any[] = [];
    const addedPairs = new Set<string>();

    const noteIdSet = new Set(filteredNotes.map((n) => String(n._id || n.id)));

    for (const note of filteredNotes) {
      const sourceId = String(note._id || note.id);

      // 1. Explicit relatedNotes
      if (Array.isArray(note.relatedNotes)) {
        for (const rel of note.relatedNotes) {
          const targetId = typeof rel === 'object' ? String((rel as any)._id || (rel as any).id) : String(rel);
          if (noteIdSet.has(targetId) && sourceId !== targetId) {
            const pairKey = [sourceId, targetId].sort().join(':::');
            if (!addedPairs.has(pairKey)) {
              addedPairs.add(pairKey);
              newEdges.push({
                id: `edge-${pairKey}`,
                source: sourceId,
                target: targetId,
                animated: false,
                style: { stroke: '#596A50', strokeWidth: 1.5, opacity: 0.7 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#596A50',
                  width: 12,
                  height: 12,
                },
              });
            }
          }
        }
      }

      // 2. Shared tag connections
      for (const other of filteredNotes) {
        const otherId = String(other._id || other.id);
        if (sourceId >= otherId) continue;

        const sharedTags = (note.tags || []).filter((t) => (other.tags || []).includes(t));
        if (sharedTags.length >= 2) {
          const pairKey = [sourceId, otherId].sort().join(':::');
          if (!addedPairs.has(pairKey)) {
            addedPairs.add(pairKey);
            newEdges.push({
              id: `edge-shared-${pairKey}`,
              source: sourceId,
              target: otherId,
              animated: true,
              style: { stroke: '#BF765C', strokeWidth: 1.2, strokeDasharray: '4 4', opacity: 0.6 },
            });
          }
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [notes, collections, filterCollection, filterType, searchQuery]);

  const onNodeClick = useCallback((_: any, node: any) => {
    if (node?.data?.note) {
      setSelectedNote(node.data.note);
    }
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-paper-100">
      {/* Top Controls Toolbar */}
      <div className="px-6 py-3 border-b border-paper-300 bg-white/90 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 z-10 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-olive-500 text-white flex items-center justify-center shadow-xs">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-charcoal-900 leading-tight">
              Knowledge Graph
            </h2>
            <p className="text-[11px] text-charcoal-500">
              {nodes.length} nodes · {edges.length} relationships
            </p>
          </div>
        </div>

        {/* Filters and Search on Canvas */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Node Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find node in graph..."
              className="pl-8 pr-3 py-1.5 text-xs bg-paper-50 border border-paper-300 rounded-lg text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:ring-1 focus:ring-olive-500 w-44 sm:w-56"
            />
          </div>

          {/* Collection Filter */}
          <select
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
            className="px-2.5 py-1.5 bg-paper-100 text-charcoal-700 text-xs rounded-lg border border-paper-300 focus:ring-0 cursor-pointer"
          >
            <option value="all">All Collections</option>
            {collections.map((col: Collection) => (
              <option key={col._id || col.id} value={col._id || col.id}>
                {col.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-paper-100 text-charcoal-700 text-xs rounded-lg border border-paper-300 focus:ring-0 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="text">Study Notes</option>
            <option value="code">Code Snippets</option>
            <option value="link">Web Links</option>
            <option value="research">Research</option>
          </select>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-charcoal-500">
            Rendering knowledge graph...
          </div>
        ) : nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#D8D4C8" />
            <Controls showInteractive={false} position="bottom-left" />
            <MiniMap
              nodeColor={(node: any) => node.data?.collectionColor || '#596A50'}
              nodeStrokeWidth={2}
              position="bottom-right"
              maskColor="rgba(247, 246, 242, 0.7)"
            />
          </ReactFlow>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <Network className="w-12 h-12 text-charcoal-300 mb-3" />
            <h3 className="text-base font-semibold text-charcoal-800">
              No graph nodes to display
            </h3>
            <p className="text-xs text-charcoal-500 max-w-sm mt-1 mb-4">
              Create notes and link them to each other in the Note Editor to visualize your knowledge graph.
            </p>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute top-4 left-6 z-10 bg-white/90 backdrop-blur-xs border border-paper-300 rounded-lg p-2.5 shadow-xs text-[11px] text-charcoal-600 hidden sm:block">
          <p className="font-semibold text-charcoal-800 mb-1">Graph Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-olive-600 rounded" />
              <span>Direct Link (Related Note)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t border-dashed border-terracotta-500" />
              <span>Shared Semantic Tags</span>
            </div>
          </div>
        </div>

        {/* Note Details Slide-Over Drawer */}
        {selectedNote && (
          <div className="absolute top-0 right-0 w-80 sm:w-96 h-full bg-white border-l border-paper-300 shadow-2xl z-20 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-paper-200 flex items-start justify-between bg-paper-50">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-400">
                  {selectedNote.type} note
                </span>
                <h3 className="text-base font-semibold text-charcoal-900 leading-snug mt-0.5">
                  {selectedNote.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1 rounded text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-charcoal-700">
              {/* Tags */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedNote.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] text-charcoal-600 bg-paper-100 px-2 py-0.5 rounded border border-paper-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Source URL */}
              {selectedNote.sourceUrl && (
                <a
                  href={selectedNote.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-olive-600 hover:underline max-w-full truncate font-mono text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{selectedNote.sourceUrl}</span>
                </a>
              )}

              {/* Content */}
              <div className="p-3 bg-paper-50 rounded-lg border border-paper-300 whitespace-pre-wrap font-sans text-xs max-h-64 overflow-y-auto">
                {selectedNote.content || 'No content written.'}
              </div>

              {/* Related notes count */}
              <div className="pt-2 border-t border-paper-200 text-charcoal-500 text-[11px]">
                <p>
                  <strong>Connected Nodes:</strong>{' '}
                  {selectedNote.relatedNotes?.length || 0} explicit links
                </p>
                <p className="mt-1">
                  <strong>Last Updated:</strong>{' '}
                  {new Date(selectedNote.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-paper-200 bg-paper-50 flex items-center justify-end">
              <button
                onClick={() => {
                  onOpenEditNote(selectedNote);
                  setSelectedNote(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-olive-500 hover:bg-olive-600 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open in Note Editor</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
