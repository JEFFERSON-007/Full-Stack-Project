import React, { useState } from 'react';
import {
  BookOpen,
  Code,
  Link as LinkIcon,
  Sparkles,
  Star,
  MoreVertical,
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  History,
  Download,
  Folder
} from 'lucide-react';
import { Note, Collection, NoteType } from '../../types';

interface NoteCardProps {
  note: Note;
  collections?: Collection[];
  viewMode?: 'grid' | 'list';
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onDuplicate: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  onViewRevisions?: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  collections = [],
  viewMode = 'grid',
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onViewRevisions,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const noteId = note._id || note.id || '';

  const collection = collections.find(
    (c) => String(c._id || c.id) === String(note.collectionId)
  );

  const getTypeBadge = (type: NoteType) => {
    switch (type) {
      case 'code':
        return {
          icon: Code,
          label: 'Code Snippet',
          badgeClass: 'bg-terracotta-100 text-terracotta-700 border-terracotta-200',
        };
      case 'link':
        return {
          icon: LinkIcon,
          label: 'Resource Link',
          badgeClass: 'bg-amberGold-100 text-amberGold-500 border-amberGold-500/20',
        };
      case 'research':
        return {
          icon: Sparkles,
          label: 'Research Note',
          badgeClass: 'bg-sageTeal-100 text-sageTeal-500 border-sageTeal-500/20',
        };
      default:
        return {
          icon: BookOpen,
          label: 'Study Note',
          badgeClass: 'bg-olive-100 text-olive-700 border-olive-200',
        };
    }
  };

  const badge = getTypeBadge(note.type);
  const BadgeIcon = badge.icon;

  const handleExportMarkdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mdContent = `# ${note.title}\n\n**Type**: ${note.type}\n**Tags**: ${note.tags?.join(', ')}\n**Updated**: ${new Date(note.updatedAt).toISOString()}\n\n---\n\n${note.content}`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onEdit(note)}
        className="group bg-white hover:bg-paper-50 border border-paper-300 rounded-lg p-3.5 flex items-center gap-4 transition-all cursor-pointer shadow-card hover:shadow-card-hover"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(noteId);
          }}
          className="text-charcoal-300 hover:text-amberGold-500 transition-colors"
          title="Toggle Favorite"
        >
          <Star
            className={`w-4 h-4 ${
              note.isFavorite ? 'text-amberGold-500 fill-amberGold-500' : ''
            }`}
          />
        </button>

        <div className={`p-1.5 rounded-md border text-xs ${badge.badgeClass}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-charcoal-900 truncate">
              {note.title}
            </h3>
            {collection && (
              <span className="text-[10px] text-charcoal-500 bg-paper-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: collection.color || '#596A50' }}
                />
                {collection.name}
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-500 truncate mt-0.5">
            {note.content?.slice(0, 100) || 'No additional content'}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-xs">
          {note.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-charcoal-500 bg-paper-200 px-2 py-0.5 rounded border border-paper-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="text-[11px] text-charcoal-400 font-mono flex-shrink-0">
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-200"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-44 bg-white border border-paper-300 rounded-lg shadow-dropdown py-1 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-charcoal-700 hover:bg-paper-100 flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Edit Note</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(noteId);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-charcoal-700 hover:bg-paper-100 flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={handleExportMarkdown}
                className="w-full text-left px-3 py-1.5 text-xs text-charcoal-700 hover:bg-paper-100 flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Export Markdown</span>
              </button>
              {onViewRevisions && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewRevisions(note);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-charcoal-700 hover:bg-paper-100 flex items-center gap-2"
                >
                  <History className="w-3.5 h-3.5 text-charcoal-500" />
                  <span>Version History</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(noteId);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-terracotta-600 hover:bg-terracotta-50 flex items-center gap-2 border-t border-paper-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div
      onClick={() => onEdit(note)}
      className="group bg-white hover:bg-paper-50/60 border border-paper-300 hover:border-paper-400 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-card hover:shadow-card-hover relative"
    >
      <div>
        {/* Card Header: Type Badge & Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${badge.badgeClass}`}>
            <BadgeIcon className="w-3 h-3" />
            <span>{badge.label}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(noteId);
              }}
              className="p-1 rounded-md text-charcoal-300 hover:text-amberGold-500 transition-colors"
              title="Favorite Note"
            >
              <Star
                className={`w-4 h-4 ${
                  note.isFavorite ? 'text-amberGold-500 fill-amberGold-500' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-200"
                title="More Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 w-44 bg-white border border-paper-300 rounded-lg shadow-dropdown py-1 z-30"
                >
                  <button
                    onClick={() => {
                      onEdit(note);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-charcoal-700 hover:bg-paper-100 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-charcoal-500" />
                    <span>Edit Note</span>
                  </button>
                  <button
                    onClick={() => {
                      onDuplicate(noteId);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-charcoal-700 hover:bg-paper-100 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-charcoal-500" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full text-left px-3 py-1.5 text-xs text-charcoal-700 hover:bg-paper-100 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-charcoal-500" />
                    <span>Export (.md)</span>
                  </button>
                  {onViewRevisions && (
                    <button
                      onClick={() => {
                        onViewRevisions(note);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-charcoal-700 hover:bg-paper-100 flex items-center gap-2"
                    >
                      <History className="w-3.5 h-3.5 text-charcoal-500" />
                      <span>Version History</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete(noteId);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-terracotta-600 hover:bg-terracotta-50 flex items-center gap-2 border-t border-paper-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-charcoal-900 group-hover:text-olive-700 line-clamp-2 transition-colors mb-2 leading-snug">
          {note.title}
        </h3>

        {/* Content Preview */}
        {note.type === 'code' ? (
          <div className="bg-charcoal-900 text-paper-100 font-mono text-[11px] p-2.5 rounded-lg mb-3 line-clamp-3 overflow-hidden opacity-90 border border-charcoal-700">
            {note.content || '// Code snippet'}
          </div>
        ) : note.type === 'link' && note.sourceUrl ? (
          <div className="mb-3">
            <a
              href={note.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-[11px] text-olive-600 hover:underline max-w-full truncate font-mono bg-paper-100 px-2 py-1 rounded border border-paper-300"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{note.sourceUrl}</span>
            </a>
            <p className="text-xs text-charcoal-600 line-clamp-2 mt-2 leading-relaxed">
              {note.content}
            </p>
          </div>
        ) : (
          <p className="text-xs text-charcoal-600 line-clamp-3 mb-3 leading-relaxed">
            {note.content || 'No additional content provided.'}
          </p>
        )}
      </div>

      {/* Card Footer: Collection, Tags & Timestamp */}
      <div className="pt-3 border-t border-paper-200 space-y-2">
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-charcoal-500 bg-paper-100 px-1.5 py-0.5 rounded border border-paper-300"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] text-charcoal-400 self-center">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Collection & Date */}
        <div className="flex items-center justify-between text-[11px] text-charcoal-500">
          {collection ? (
            <span className="flex items-center gap-1 truncate max-w-[140px]">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: collection.color || '#596A50' }}
              />
              <span className="truncate">{collection.name}</span>
            </span>
          ) : (
            <span className="text-charcoal-400 italic">Unassigned</span>
          )}

          <span className="font-mono text-[10px] text-charcoal-400">
            {new Date(note.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
