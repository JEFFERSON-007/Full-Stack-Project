import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Code, Link as LinkIcon, Sparkles, Star, Tag, Folder, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Note, Collection, NoteType } from '../../types';
import { notesService } from '../../services/notes.service';
import { collectionsService } from '../../services/collections.service';
import { formatContentExcerpt } from '../../utils/format';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: Note) => void;
  onOpenNewNote: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectNote,
  onOpenNewNote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NoteType | 'all'>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [results, setResults] = useState<Note[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load collections for filtering
  useEffect(() => {
    if (isOpen) {
      collectionsService.getCollections().then(setCollections).catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
      setSelectedType('all');
      setSelectedCollection('all');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const filters: any = {};
        if (searchTerm.trim()) filters.search = searchTerm.trim();
        if (selectedType !== 'all') filters.type = selectedType;
        if (selectedCollection !== 'all') filters.collectionId = selectedCollection;

        const res = await notesService.getNotes(filters);
        setResults(res.notes || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedCollection, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectNote(results[selectedIndex]);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div
        onKeyDown={handleKeyDown}
        className="relative z-10 w-full max-w-2xl bg-white border border-paper-300 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Input Box */}
        <div className="p-4 border-b border-paper-300 flex items-center gap-3 bg-paper-50">
          <Search className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search note titles, content, tags, or links..."
            className="w-full bg-transparent text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-charcoal-400 hover:text-charcoal-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-charcoal-500 bg-paper-200 border border-paper-300 rounded">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-paper-200 bg-white flex flex-wrap items-center gap-2 text-xs">
          <span className="text-charcoal-400 text-[11px] mr-1">Filter by:</span>

          {/* Type filters */}
          {(['all', 'text', 'code', 'link', 'research'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedType === t
                  ? 'bg-olive-500 text-white'
                  : 'bg-paper-200 text-charcoal-600 hover:bg-paper-300'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}

          {/* Collection filter dropdown */}
          {collections.length > 0 && (
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="ml-auto px-2 py-1 bg-paper-200 text-charcoal-700 text-[11px] rounded-md border-0 focus:ring-1 focus:ring-olive-500"
            >
              <option value="all">All Collections</option>
              {collections.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-paper-200">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-charcoal-500">
              <div className="animate-spin w-5 h-5 border-2 border-olive-500 border-t-transparent rounded-full mx-auto mb-2" />
              Searching personal knowledge base...
            </div>
          ) : results.length > 0 ? (
            results.map((note, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={note._id || note.id}
                  onClick={() => {
                    onSelectNote(note);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3.5 px-4 cursor-pointer flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-paper-200/80' : 'hover:bg-paper-100'
                  }`}
                >
                  <div className="p-1.5 rounded bg-paper-100 border border-paper-300 mt-0.5">
                    {getTypeIcon(note.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-charcoal-900 truncate">
                        {note.title}
                      </h4>
                      {note.isFavorite && (
                        <Star className="w-3 h-3 text-amberGold-500 fill-amberGold-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-600 line-clamp-1 mt-0.5">
                      {formatContentExcerpt(note.content, 110)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {note.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 text-[10px] text-charcoal-500 bg-paper-100 px-1.5 py-0.5 rounded border border-paper-300"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] text-charcoal-400 ml-auto font-mono">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <CornerDownLeft className="w-4 h-4 text-olive-600 mt-1 flex-shrink-0" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-charcoal-700">No notes matched your query</p>
              <p className="text-xs text-charcoal-500 mt-1">
                Try searching different keywords or clear your active filters.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenNewNote();
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-olive-500 text-white text-xs font-medium hover:bg-olive-600 transition-colors"
              >
                <span>Create note with "{searchTerm || 'new note'}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 px-4 bg-paper-100 border-t border-paper-300 text-[11px] text-charcoal-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span><kbd className="font-mono bg-paper-200 px-1 rounded border border-paper-300">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-paper-200 px-1 rounded border border-paper-300">↵</kbd> Open</span>
            <span><kbd className="font-mono bg-paper-200 px-1 rounded border border-paper-300">ESC</kbd> Close</span>
          </div>
          <span className="font-mono text-[10px]">
            {results.length} results found
          </span>
        </div>
      </div>
    </div>
  );
};
