import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Note } from '../types';
import { notesService } from '../services/notes.service';
import { NoteCard } from '../components/notes/NoteCard';

export const RecentPage: React.FC = () => {
  const { onOpenEditNote, onOpenRevisions, collections, refreshData } =
    useOutletContext<any>();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecent = async () => {
    setIsLoading(true);
    try {
      const res = await notesService.getNotes({ sort: 'updatedAt', order: 'desc' });
      setNotes((res.notes || []).slice(0, 15));
    } catch (err) {
      console.error('Failed to fetch recent notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-paper-300 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-olive-600" />
            <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-charcoal-900 leading-tight">
              Recently Edited Notes
            </h1>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Chronological trace of your latest thoughts, edits, and active working memory.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-charcoal-500">
          Loading recently updated notes...
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <NoteCard
              key={note._id || note.id}
              note={note}
              collections={collections}
              onEdit={onOpenEditNote}
              onDelete={async (id) => {
                await notesService.deleteNote(id);
                fetchRecent();
                refreshData();
              }}
              onDuplicate={async (id) => {
                await notesService.duplicateNote(id);
                fetchRecent();
                refreshData();
              }}
              onToggleFavorite={async (id) => {
                await notesService.toggleFavorite(id);
                fetchRecent();
                refreshData();
              }}
              onViewRevisions={onOpenRevisions}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white border border-paper-300 rounded-2xl shadow-card p-8">
          <Clock className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-charcoal-800">
            No recently edited notes
          </h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
            Any notes you capture or update will automatically appear in this chronological stream.
          </p>
        </div>
      )}
    </div>
  );
};
