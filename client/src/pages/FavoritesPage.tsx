import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import { Note } from '../types';
import { notesService } from '../services/notes.service';
import { NoteCard } from '../components/notes/NoteCard';

export const FavoritesPage: React.FC = () => {
  const { onOpenNewNote, onOpenEditNote, onOpenRevisions, collections, refreshData } =
    useOutletContext<any>();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await notesService.getNotes({ isFavorite: true, sort: 'updatedAt', order: 'desc' });
      setNotes(res.notes || []);
    } catch (err) {
      console.error('Failed to fetch favorite notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (noteId: string) => {
    try {
      await notesService.toggleFavorite(noteId);
      setNotes((prev) => prev.filter((n) => String(n._id || n.id) !== String(noteId)));
      refreshData();
    } catch (err) {
      console.error('Toggle favorite failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-paper-300 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-amberGold-500 fill-amberGold-500" />
            <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-charcoal-900 leading-tight">
              Starred Knowledge
            </h1>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Essential reference cards, top architectural blueprints, and high-priority study notes.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-charcoal-500">
          Loading starred notes...
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
                fetchFavorites();
                refreshData();
              }}
              onDuplicate={async (id) => {
                await notesService.duplicateNote(id);
                fetchFavorites();
                refreshData();
              }}
              onToggleFavorite={handleToggleFavorite}
              onViewRevisions={onOpenRevisions}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white border border-paper-300 rounded-2xl shadow-card p-8">
          <Star className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-charcoal-800">
            No starred notes yet
          </h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-4">
            Click the star icon on any note in your library to pin it here for quick access.
          </p>
        </div>
      )}
    </div>
  );
};
