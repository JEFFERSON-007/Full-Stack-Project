import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../search/CommandPalette';
import { NoteEditorModal } from '../notes/NoteEditorModal';
import { RevisionHistoryModal } from '../notes/RevisionHistoryModal';
import { CollectionModal } from '../collections/CollectionModal';
import { Note, Collection } from '../../types';
import { notesService } from '../../services/notes.service';
import { collectionsService } from '../../services/collections.service';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  // Modal states
  const [searchOpen, setSearchOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [revisionNote, setRevisionNote] = useState<Note | null>(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global cache for collections & all notes
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  const refreshData = async () => {
    try {
      const [colRes, notesRes] = await Promise.all([
        collectionsService.getCollections(),
        notesService.getNotes(),
      ]);
      setCollections(colRes);
      setAllNotes(notesRes.notes || []);
    } catch (err) {
      console.error('Error refreshing layout data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K => Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }

      // 'N' when not in an input/textarea => New Note
      const target = e.target as HTMLElement;
      if (
        e.key.toLowerCase() === 'n' &&
        !['input', 'textarea', 'select'].includes(target.tagName.toLowerCase()) &&
        !editorOpen &&
        !searchOpen
      ) {
        e.preventDefault();
        handleOpenNewNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorOpen, searchOpen]);

  const handleOpenNewNote = () => {
    setSelectedNote(null);
    setEditorOpen(true);
  };

  const handleOpenEditNote = (note: Note) => {
    setSelectedNote(note);
    setEditorOpen(true);
  };

  const handleNoteSaved = (savedNote: Note) => {
    refreshData();
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesService.deleteNote(noteId);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete note');
    }
  };

  const handleOpenRevisions = (note: Note) => {
    setRevisionNote(note);
    setRevisionOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper-100 font-sans text-charcoal-800">
      {/* Sidebar */}
      <Sidebar
        onOpenNewNote={handleOpenNewNote}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNewNote={handleOpenNewNote}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet
            context={{
              refreshData,
              collections,
              allNotes,
              onOpenNewNote: handleOpenNewNote,
              onOpenEditNote: handleOpenEditNote,
              onOpenRevisions: handleOpenRevisions,
              onOpenCollectionModal: (col?: Collection) => {
                setEditingCollection(col || null);
                setCollectionModalOpen(true);
              },
            }}
          />
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectNote={(note) => {
          handleOpenEditNote(note);
        }}
        onOpenNewNote={handleOpenNewNote}
      />

      <NoteEditorModal
        isOpen={editorOpen}
        note={selectedNote}
        collections={collections}
        allNotes={allNotes}
        onClose={() => {
          setEditorOpen(false);
          setSelectedNote(null);
        }}
        onSave={handleNoteSaved}
        onDelete={handleDeleteNote}
        onOpenRevisions={handleOpenRevisions}
      />

      <RevisionHistoryModal
        isOpen={revisionOpen}
        note={revisionNote}
        onClose={() => {
          setRevisionOpen(false);
          setRevisionNote(null);
        }}
        onRestored={(updated) => {
          refreshData();
          if (editorOpen) {
            setSelectedNote(updated);
          }
        }}
      />

      <CollectionModal
        isOpen={collectionModalOpen}
        collection={editingCollection}
        onClose={() => {
          setCollectionModalOpen(false);
          setEditingCollection(null);
        }}
        onSaved={() => {
          refreshData();
        }}
      />
    </div>
  );
};
