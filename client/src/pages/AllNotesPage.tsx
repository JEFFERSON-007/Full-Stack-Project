import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  Plus,
  Star,
  Download,
  BookOpen,
  Code,
  Link as LinkIcon,
  Sparkles,
  Tag,
  Folder,
  RotateCcw
} from 'lucide-react';
import { Note, Collection, NoteType } from '../types';
import { notesService, NotesQueryFilter } from '../services/notes.service';
import { NoteCard } from '../components/notes/NoteCard';

export const AllNotesPage: React.FC = () => {
  const { onOpenNewNote, onOpenEditNote, onOpenRevisions, collections, refreshData } =
    useOutletContext<any>();

  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Array<{ name: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NoteType | 'all'>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const filters: NotesQueryFilter = {
        sort: sortBy,
        order: sortOrder,
      };

      if (searchTerm.trim()) filters.search = searchTerm.trim();
      if (selectedType !== 'all') filters.type = selectedType;
      if (selectedCollection !== 'all') filters.collectionId = selectedCollection;
      if (selectedTag !== 'all') filters.tag = selectedTag;
      if (favoritesOnly) filters.isFavorite = true;

      const [notesRes, tagsRes] = await Promise.all([
        notesService.getNotes(filters),
        notesService.getTags(),
      ]);

      setNotes(notesRes.notes || []);
      setTags(tagsRes);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedCollection, selectedTag, favoritesOnly, sortBy, sortOrder]);

  const handleToggleFavorite = async (noteId: string) => {
    try {
      await notesService.toggleFavorite(noteId);
      // Optimistic update
      setNotes((prev) =>
        prev.map((n) =>
          String(n._id || n.id) === String(noteId)
            ? { ...n, isFavorite: !n.isFavorite }
            : n
        )
      );
    } catch (err) {
      console.error('Toggle favorite failed:', err);
    }
  };

  const handleDuplicate = async (noteId: string) => {
    try {
      await notesService.duplicateNote(noteId);
      fetchNotes();
      refreshData();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (confirm('Delete this note and its revision history permanently?')) {
      try {
        await notesService.deleteNote(noteId);
        fetchNotes();
        refreshData();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleExportAllJson = () => {
    const jsonStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `folio_notes_export_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCollection('all');
    setSelectedTag('all');
    setFavoritesOnly(false);
    setSortBy('updatedAt');
    setSortOrder('desc');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedType !== 'all' ||
    selectedCollection !== 'all' ||
    selectedTag !== 'all' ||
    favoritesOnly;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-charcoal-900 leading-tight">
            Knowledge Repository
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            {notes.length} {notes.length === 1 ? 'artifact' : 'artifacts'} indexed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-paper-200 border border-paper-300 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportAllJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper-100 hover:bg-paper-200 text-charcoal-700 text-xs font-medium border border-paper-300 transition-colors"
            title="Export filtered notes as JSON"
          >
            <Download className="w-3.5 h-3.5 text-charcoal-500" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-paper-300 rounded-xl p-4 shadow-card space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes by keyword, tags, content, or source URLs..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-paper-50 border border-paper-300 rounded-lg text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-1 focus:ring-olive-500"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Note Type Filter Pills */}
          <div className="flex items-center gap-1 bg-paper-100 p-0.5 rounded-lg border border-paper-300">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'text', label: 'Text' },
                { id: 'code', label: 'Code' },
                { id: 'link', label: 'Link' },
                { id: 'research', label: 'Research' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedType === t.id
                    ? 'bg-white text-charcoal-900 shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Collection Filter */}
          <div className="flex items-center gap-1 bg-paper-100 px-2.5 py-1 rounded-lg border border-paper-300">
            <Folder className="w-3.5 h-3.5 text-charcoal-500" />
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="bg-transparent text-charcoal-800 text-xs border-0 focus:ring-0 cursor-pointer pr-4"
            >
              <option value="all">All Collections</option>
              <option value="unassigned">Unassigned</option>
              {collections.map((col: Collection) => (
                <option key={col._id || col.id} value={col._id || col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1 bg-paper-100 px-2.5 py-1 rounded-lg border border-paper-300">
              <Tag className="w-3.5 h-3.5 text-charcoal-500" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-transparent text-charcoal-800 text-xs border-0 focus:ring-0 cursor-pointer pr-4"
              >
                <option value="all">All Tags</option>
                {tags.map((t) => (
                  <option key={t.name} value={t.name}>
                    #{t.name} ({t.count})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Favorites Filter */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
              favoritesOnly
                ? 'bg-amberGold-100/70 border-amberGold-500 text-amberGold-600 font-semibold'
                : 'bg-paper-100 border-paper-300 text-charcoal-600 hover:bg-paper-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amberGold-500' : ''}`} />
            <span>Favorites</span>
          </button>

          {/* Sorting */}
          <div className="ml-auto flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-paper-100 text-charcoal-700 text-xs px-2.5 py-1 rounded-lg border border-paper-300 focus:ring-0 cursor-pointer"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Date Created</option>
              <option value="title">Title A-Z</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-paper-100 text-charcoal-600 hover:text-charcoal-900 border border-paper-300 rounded-lg text-xs"
              title="Toggle sort direction"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2 py-1 text-terracotta-600 hover:bg-terracotta-50 rounded-lg transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes Display */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-charcoal-500">
          <div className="animate-spin w-6 h-6 border-2 border-olive-500 border-t-transparent rounded-full mx-auto mb-3" />
          Loading knowledge repository...
        </div>
      ) : notes.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-3'
          }
        >
          {notes.map((note) => (
            <NoteCard
              key={note._id || note.id}
              note={note}
              collections={collections}
              viewMode={viewMode}
              onEdit={onOpenEditNote}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onToggleFavorite={handleToggleFavorite}
              onViewRevisions={onOpenRevisions}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white border border-paper-300 rounded-2xl shadow-card p-8">
          <BookOpen className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-charcoal-800">
            No knowledge notes found
          </h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-5">
            {hasActiveFilters
              ? 'Try widening your search terms or resetting the active filters.'
              : 'Capture your first note, code snippet, or web bookmark to build your library.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg bg-paper-200 text-charcoal-800 text-xs font-medium hover:bg-paper-300"
            >
              Clear Active Filters
            </button>
          ) : (
            <button
              onClick={onOpenNewNote}
              className="px-4 py-2 rounded-lg bg-olive-500 text-white text-xs font-semibold hover:bg-olive-600 shadow-xs"
            >
              Create New Note
            </button>
          )}
        </div>
      )}
    </div>
  );
};
