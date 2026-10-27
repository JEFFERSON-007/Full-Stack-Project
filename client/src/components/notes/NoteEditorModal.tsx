import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  Star,
  BookOpen,
  Code,
  Link as LinkIcon,
  Sparkles,
  Tag as TagIcon,
  Folder,
  Network,
  History,
  Download,
  Check,
  ExternalLink
} from 'lucide-react';
import { Note, Collection, NoteType } from '../../types';
import { notesService } from '../../services/notes.service';
import ReactMarkdown from 'react-markdown';

interface NoteEditorModalProps {
  isOpen: boolean;
  note: Note | null;
  collections: Collection[];
  allNotes?: Note[];
  onClose: () => void;
  onSave: (savedNote: Note) => void;
  onDelete?: (noteId: string) => void;
  onOpenRevisions?: (note: Note) => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  note,
  collections,
  allNotes = [],
  onClose,
  onSave,
  onDelete,
  onOpenRevisions,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('text');
  const [collectionId, setCollectionId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [sourceUrl, setSourceUrl] = useState('');
  const [relatedNotes, setRelatedNotes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setType(note.type || 'text');
      setCollectionId(note.collectionId ? String(note.collectionId) : '');
      setTags(note.tags || []);
      setIsFavorite(!!note.isFavorite);
      setCodeLanguage(note.codeLanguage || 'javascript');
      setSourceUrl(note.sourceUrl || '');
      setRelatedNotes(
        Array.isArray(note.relatedNotes)
          ? note.relatedNotes.map((r: any) => (typeof r === 'object' ? r._id || r.id : String(r)))
          : []
      );
      setHasChanges(false);
    } else {
      // New note defaults
      setTitle('');
      setContent('');
      setType('text');
      setCollectionId('');
      setTags([]);
      setIsFavorite(false);
      setCodeLanguage('javascript');
      setSourceUrl('');
      setRelatedNotes([]);
      setHasChanges(false);
    }
    setActiveTab('write');
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setHasChanges(true);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setHasChanges(true);
  };

  const handleToggleRelatedNote = (relNoteId: string) => {
    if (relatedNotes.includes(relNoteId)) {
      setRelatedNotes(relatedNotes.filter((id) => id !== relNoteId));
    } else {
      setRelatedNotes([...relatedNotes, relNoteId]);
    }
    setHasChanges(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<Note> = {
        title: title.trim(),
        content,
        type,
        collectionId: collectionId || null,
        tags,
        isFavorite,
        codeLanguage,
        sourceUrl: sourceUrl.trim(),
        relatedNotes,
      };

      let saved: Note;
      if (note && (note._id || note.id)) {
        const id = note._id || note.id || '';
        saved = await notesService.updateNote(id, {
          ...payload,
          changeSummary: 'Updated via Note Editor',
        });
      } else {
        saved = await notesService.createNote(payload);
      }

      setHasChanges(false);
      onSave(saved);
      onClose();
    } catch (err: any) {
      console.error('Error saving note:', err);
      alert(err.message || 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const mdContent = `# ${title}\n\n**Type**: ${type}\n**Tags**: ${tags.join(', ')}\n\n---\n\n${content}`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter out current note from related candidates
  const currentNoteId = note ? note._id || note.id : null;
  const linkableNotes = allNotes.filter(
    (n) => String(n._id || n.id) !== String(currentNoteId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Editor Modal Window */}
      <div className="relative z-10 w-full max-w-4xl bg-white border border-paper-300 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-paper-300 flex items-center justify-between bg-paper-50">
          <div className="flex items-center gap-3">
            {/* Note Type Selector */}
            <div className="flex items-center gap-1 bg-paper-200 p-1 rounded-lg border border-paper-300">
              {(
                [
                  { id: 'text', label: 'Study Note', icon: BookOpen },
                  { id: 'code', label: 'Code', icon: Code },
                  { id: 'link', label: 'Resource', icon: LinkIcon },
                  { id: 'research', label: 'Research', icon: Sparkles },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id);
                    setHasChanges(true);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    type === t.id
                      ? 'bg-white text-charcoal-900 shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Favorite toggle */}
            <button
              type="button"
              onClick={() => {
                setIsFavorite(!isFavorite);
                setHasChanges(true);
              }}
              className={`p-1.5 rounded-lg border border-paper-300 hover:bg-paper-200 transition-colors ${
                isFavorite ? 'text-amberGold-500 fill-amberGold-500 bg-amberGold-100/50' : 'text-charcoal-400'
              }`}
              title="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amberGold-500' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {note && onOpenRevisions && (
              <button
                type="button"
                onClick={() => onOpenRevisions(note)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-charcoal-600 hover:bg-paper-200 border border-paper-300 transition-colors"
                title="View note version history"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Revisions</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExport}
              className="p-1.5 rounded-lg text-charcoal-500 hover:bg-paper-200 border border-paper-300 transition-colors"
              title="Export as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>

            {note && onDelete && (
              <button
                type="button"
                onClick={() => {
                  const id = note._id || note.id || '';
                  if (confirm('Are you sure you want to delete this note?')) {
                    onDelete(id);
                    onClose();
                  }
                }}
                className="p-1.5 rounded-lg text-terracotta-600 hover:bg-terracotta-50 border border-paper-300 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Title of this knowledge artifact..."
              className="w-full text-2xl font-editorial font-bold text-charcoal-900 placeholder:text-charcoal-300 border-0 focus:outline-none focus:ring-0 p-0"
              autoFocus
              required
            />
          </div>

          {/* Collection & Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 pb-3 border-b border-paper-200 text-xs">
            {/* Collection Select */}
            <div className="flex items-center gap-1.5 bg-paper-100 px-3 py-1.5 rounded-lg border border-paper-300">
              <Folder className="w-3.5 h-3.5 text-charcoal-500" />
              <select
                value={collectionId}
                onChange={(e) => {
                  setCollectionId(e.target.value);
                  setHasChanges(true);
                }}
                className="bg-transparent text-charcoal-800 text-xs border-0 focus:ring-0 cursor-pointer"
              >
                <option value="">No Collection (Unassigned)</option>
                {collections.map((col) => (
                  <option key={col._id || col.id} value={col._id || col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Code Language (if code note) */}
            {type === 'code' && (
              <div className="flex items-center gap-1.5 bg-paper-100 px-3 py-1.5 rounded-lg border border-paper-300">
                <Code className="w-3.5 h-3.5 text-charcoal-500" />
                <select
                  value={codeLanguage}
                  onChange={(e) => {
                    setCodeLanguage(e.target.value);
                    setHasChanges(true);
                  }}
                  className="bg-transparent text-charcoal-800 text-xs border-0 focus:ring-0 cursor-pointer font-mono"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="sql">SQL</option>
                  <option value="bash">Bash / Shell</option>
                  <option value="html">HTML / CSS</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            )}

            {/* Source URL (if link note) */}
            {type === 'link' && (
              <div className="flex-1 min-w-[200px] flex items-center gap-1.5 bg-paper-100 px-3 py-1.5 rounded-lg border border-paper-300">
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-500" />
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => {
                    setSourceUrl(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="https://example.com/resource"
                  className="bg-transparent text-charcoal-800 text-xs border-0 focus:ring-0 w-full placeholder:text-charcoal-400"
                />
              </div>
            )}
          </div>

          {/* Tags Management */}
          <div className="flex flex-wrap items-center gap-2">
            <TagIcon className="w-3.5 h-3.5 text-charcoal-400" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs text-charcoal-700 bg-paper-200 px-2 py-0.5 rounded-md border border-paper-300"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-charcoal-400 hover:text-charcoal-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag (press Enter)..."
              className="text-xs text-charcoal-800 bg-transparent border-0 focus:outline-none placeholder:text-charcoal-400 py-1"
            />
          </div>

          {/* Content Editor with Write / Preview Tabs */}
          <div className="border border-paper-300 rounded-xl overflow-hidden bg-paper-50/40">
            <div className="px-4 py-2 border-b border-paper-300 bg-paper-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    activeTab === 'write'
                      ? 'bg-white text-charcoal-900 shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-white text-charcoal-900 shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  Preview
                </button>
              </div>

              <span className="text-[11px] text-charcoal-400 font-mono">
                {content.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {activeTab === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setHasChanges(true);
                }}
                placeholder={
                  type === 'code'
                    ? '// Paste or write your snippet here...'
                    : 'Write notes, insights, synthesis, or Markdown formatting...'
                }
                rows={12}
                className={`w-full p-4 bg-transparent text-sm text-charcoal-800 placeholder:text-charcoal-400 border-0 focus:outline-none resize-y leading-relaxed ${
                  type === 'code' ? 'font-mono text-xs bg-paper-100/60' : ''
                }`}
              />
            ) : (
              <div className="p-5 max-w-none text-charcoal-800 min-h-[250px] max-h-[450px] overflow-y-auto space-y-3 bg-white">
                {content ? (
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-editorial font-bold text-charcoal-900 border-b border-paper-200 pb-2 mb-3">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-sans font-bold text-charcoal-900 mt-4 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-sans font-semibold text-charcoal-800 mt-3 mb-1">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed mb-3">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-xs sm:text-sm text-charcoal-700 space-y-1 mb-3 pl-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-xs sm:text-sm text-charcoal-700 space-y-1 mb-3 pl-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-olive-500 pl-3 py-1 my-3 text-xs italic text-charcoal-600 bg-olive-50/40 rounded-r">
                          {children}
                        </blockquote>
                      ),
                      code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <pre className="bg-charcoal-900 text-paper-100 p-3.5 rounded-lg text-xs font-mono overflow-x-auto my-3">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="bg-paper-200 text-charcoal-800 px-1.5 py-0.5 rounded text-[11px] font-mono" {...props}>
                            {children}
                          </code>
                        );
                      },
                      strong: ({ children }) => (
                        <strong className="font-semibold text-charcoal-900">{children}</strong>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-charcoal-400 italic text-sm">No content to preview.</p>
                )}
              </div>
            )}
          </div>

          {/* Related Notes Linking (Knowledge Graph connections!) */}
          <div className="pt-2 border-t border-paper-200">
            <div className="flex items-center gap-2 mb-2">
              <Network className="w-4 h-4 text-olive-600" />
              <label className="text-xs font-semibold text-charcoal-800">
                Connected Notes (Graph Relationships)
              </label>
              <span className="text-[11px] text-charcoal-400">
                Pick related notes to link them in the Knowledge Graph
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-paper-100 rounded-lg border border-paper-300">
              {linkableNotes.length > 0 ? (
                linkableNotes.map((cand) => {
                  const isLinked = relatedNotes.includes(String(cand._id || cand.id));
                  return (
                    <button
                      key={cand._id || cand.id}
                      type="button"
                      onClick={() => handleToggleRelatedNote(String(cand._id || cand.id))}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                        isLinked
                          ? 'bg-olive-500 text-white border-olive-600 shadow-xs'
                          : 'bg-white text-charcoal-700 border-paper-300 hover:border-paper-400'
                      }`}
                    >
                      {isLinked && <Check className="w-3 h-3" />}
                      <span className="truncate max-w-[200px]">{cand.title}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-charcoal-400 italic py-1">
                  Create more notes to establish knowledge connections.
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Footer Bar */}
        <div className="px-6 py-3.5 border-t border-paper-300 bg-paper-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-charcoal-500">
            {hasChanges ? (
              <span className="flex items-center gap-1.5 text-amberGold-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-amberGold-500" />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-olive-600">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-charcoal-600 hover:bg-paper-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-olive-500 hover:bg-olive-600 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Note'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
