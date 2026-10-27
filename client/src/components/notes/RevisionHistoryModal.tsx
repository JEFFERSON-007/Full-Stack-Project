import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Clock, Tag, FileText } from 'lucide-react';
import { Note, NoteRevision } from '../../types';
import { notesService } from '../../services/notes.service';

interface RevisionHistoryModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onRestored: (updatedNote: Note) => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  note,
  onClose,
  onRestored,
}) => {
  const [revisions, setRevisions] = useState<NoteRevision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<NoteRevision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && note) {
      const id = note._id || note.id || '';
      setIsLoading(true);
      notesService
        .getRevisions(id)
        .then((revs) => {
          setRevisions(revs);
          if (revs.length > 0) {
            setSelectedRevision(revs[0]);
          }
        })
        .catch((err) => console.error('Failed to load revisions:', err))
        .finally(() => setIsLoading(false));
    } else {
      setRevisions([]);
      setSelectedRevision(null);
    }
  }, [isOpen, note]);

  if (!isOpen || !note) return null;

  const handleRestore = async (revision: NoteRevision) => {
    if (!confirm('Restore note to this snapshot? Current content will be saved as a new revision.')) {
      return;
    }

    const noteId = note._id || note.id || '';
    const revId = revision._id || revision.id || '';

    setIsRestoring(true);
    try {
      const updated = await notesService.restoreRevision(noteId, revId);
      onRestored(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to restore revision');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-4xl bg-white border border-paper-300 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-paper-300 flex items-center justify-between bg-paper-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-olive-600" />
            <div>
              <h3 className="text-base font-semibold text-charcoal-900 leading-tight">
                Version History: {note.title}
              </h3>
              <p className="text-[11px] text-charcoal-500">
                Compare earlier snapshots or restore any saved version
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-paper-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content split view */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Revisions list */}
          <div className="w-full md:w-72 border-r border-paper-300 overflow-y-auto bg-paper-100/50 divide-y divide-paper-200">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-charcoal-500">
                Loading history...
              </div>
            ) : revisions.length > 0 ? (
              revisions.map((rev, index) => {
                const isSelected = selectedRevision?._id === rev._id || selectedRevision?.id === rev.id;
                return (
                  <div
                    key={rev._id || rev.id || index}
                    onClick={() => setSelectedRevision(rev)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-white border-l-4 border-l-olive-500 shadow-xs' : 'hover:bg-paper-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-charcoal-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-mono text-[10px]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-charcoal-800 line-clamp-1">
                      {rev.title}
                    </p>
                    <p className="text-[11px] text-charcoal-500 line-clamp-1 mt-0.5">
                      {rev.changeSummary || 'Saved snapshot'}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-charcoal-500">
                No earlier revisions recorded yet.
              </div>
            )}
          </div>

          {/* Revision preview panel */}
          <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col justify-between">
            {selectedRevision ? (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-paper-200 mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold">
                      Snapshot Preview
                    </span>
                    <h4 className="text-lg font-semibold text-charcoal-900 mt-0.5">
                      {selectedRevision.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleRestore(selectedRevision)}
                    disabled={isRestoring}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-olive-500 hover:bg-olive-600 disabled:opacity-50 text-white text-xs font-medium shadow-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isRestoring ? 'Restoring...' : 'Restore This Version'}</span>
                  </button>
                </div>

                {selectedRevision.tags && selectedRevision.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedRevision.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] text-charcoal-500 bg-paper-100 px-2 py-0.5 rounded border border-paper-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-paper-50 rounded-xl border border-paper-300 font-sans text-xs text-charcoal-800 whitespace-pre-wrap leading-relaxed min-h-[220px]">
                  {selectedRevision.content || '(Empty content snapshot)'}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-charcoal-400">
                Select a revision from the left sidebar to preview its contents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
