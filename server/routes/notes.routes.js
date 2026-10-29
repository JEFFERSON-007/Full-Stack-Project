const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const NoteModel = require('../models/Note');
const NoteRevisionModel = require('../models/NoteRevision');
const CollectionModel = require('../models/Collection');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/notes - Query notes with full search, filtering, and sorting
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { search, collectionId, type, tag, isFavorite, isPinned, sort = 'updatedAt', order = 'desc' } = req.query;

    const filter = { user: userId };

    if (collectionId) {
      if (collectionId === 'unassigned') {
        filter.collectionId = null;
      } else {
        filter.collectionId = collectionId;
      }
    }

    if (type) {
      filter.type = type;
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    if (isPinned === 'true') {
      filter.isPinned = true;
    }

    const notesRes = await NoteModel.find(filter);
    let notes = Array.isArray(notesRes) ? notesRes : await notesRes.exec();

    // If search keyword provided, perform multi-field search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      notes = notes.filter(n => {
        const inTitle = (n.title || '').toLowerCase().includes(q);
        const inContent = (n.content || '').toLowerCase().includes(q);
        const inTags = (n.tags || []).some(t => t.toLowerCase().includes(q));
        const inUrl = (n.sourceUrl || '').toLowerCase().includes(q);
        return inTitle || inContent || inTags || inUrl;
      });
    }

    // Sort notes
    const sortField = ['updatedAt', 'createdAt', 'title'].includes(sort) ? sort : 'updatedAt';
    const isAsc = order === 'asc';

    notes.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'title') {
        valA = (valA || '').toLowerCase();
        valB = (valB || '').toLowerCase();
      } else {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      }

      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });

    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notes.', error: err.message });
  }
});

// GET /api/notes/tags - Get all distinct tags with counts for the user
router.get('/tags', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notesRes = await NoteModel.find({ user: userId });
    const notes = Array.isArray(notesRes) ? notesRes : await notesRes.exec();

    const tagCounts = {};
    for (const note of notes) {
      if (Array.isArray(note.tags)) {
        for (const t of note.tags) {
          const clean = t.trim().toLowerCase();
          if (clean) {
            tagCounts[clean] = (tagCounts[clean] || 0) + 1;
          }
        }
      }
    }

    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      tags
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tags.', error: err.message });
  }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      title,
      content = '',
      type = 'text',
      tags = [],
      collectionId = null,
      isFavorite = false,
      isPinned = false,
      codeLanguage = 'javascript',
      sourceUrl = '',
      relatedNotes = []
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required.'
      });
    }

    const cleanedTags = Array.isArray(tags)
      ? tags.map(t => String(t).trim().toLowerCase()).filter(Boolean)
      : [];

    let sanitizedCollectionId = null;
    if (collectionId && typeof collectionId === 'string' && collectionId.trim() !== '' && collectionId !== 'unassigned' && collectionId !== 'undefined' && collectionId !== 'null') {
      if (mongoose.Types.ObjectId.isValid(collectionId)) {
        sanitizedCollectionId = collectionId;
      }
    }

    const sanitizedRelatedNotes = Array.isArray(relatedNotes)
      ? relatedNotes.filter(rn => rn && rn !== 'undefined' && rn !== 'null' && mongoose.Types.ObjectId.isValid(String(rn)))
      : [];

    const newNote = await NoteModel.create({
      user: userId,
      title: title.trim(),
      content,
      type,
      tags: cleanedTags,
      collectionId: sanitizedCollectionId,
      isFavorite: !!isFavorite,
      isPinned: !!isPinned,
      codeLanguage,
      sourceUrl: (sourceUrl || '').trim(),
      relatedNotes: sanitizedRelatedNotes
    });

    // Create initial revision entry
    await NoteRevisionModel.create({
      noteId: newNote._id || newNote.id,
      user: userId,
      title: newNote.title,
      content: newNote.content,
      type: newNote.type,
      tags: newNote.tags,
      changeSummary: 'Created initial note'
    });

    res.status(201).json({
      success: true,
      note: newNote
    });
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ success: false, message: 'Failed to create note.', error: err.message });
  }
});

// GET /api/notes/:id - Get note details with revision count & related note details
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const note = await NoteModel.findById(req.params.id);

    if (!note || String(note.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.'
      });
    }

    // Populate related notes basic details
    let relatedNotesDetails = [];
    if (Array.isArray(note.relatedNotes) && note.relatedNotes.length > 0) {
      for (const relId of note.relatedNotes) {
        const rel = await NoteModel.findById(relId);
        if (rel && String(rel.user) === String(userId)) {
          relatedNotesDetails.push({
            id: rel._id || rel.id,
            title: rel.title,
            type: rel.type
          });
        }
      }
    }

    // Revision count
    const revCount = await NoteRevisionModel.countDocuments({
      noteId: note._id || note.id,
      user: userId
    });

    res.json({
      success: true,
      note: {
        ...note,
        relatedNotesDetails,
        revisionCount: revCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch note.', error: err.message });
  }
});

// PUT /api/notes/:id - Update note and record revision history
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const note = await NoteModel.findById(req.params.id);

    if (!note || String(note.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.'
      });
    }

    const {
      title,
      content,
      type,
      tags,
      collectionId,
      isFavorite,
      isPinned,
      codeLanguage,
      sourceUrl,
      relatedNotes,
      changeSummary
    } = req.body;

    // Check if title or content changed before saving revision
    const hasContentChanged = (title && title !== note.title) ||
      (content !== undefined && content !== note.content) ||
      (type && type !== note.type);

    if (hasContentChanged) {
      await NoteRevisionModel.create({
        noteId: note._id || note.id,
        user: userId,
        title: note.title,
        content: note.content,
        type: note.type,
        tags: note.tags,
        changeSummary: changeSummary || 'Content updated'
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content;
    if (type !== undefined) updates.type = type;
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags.map(t => String(t).trim().toLowerCase()).filter(Boolean) : [];
    }
    if (collectionId !== undefined) {
      if (collectionId && typeof collectionId === 'string' && collectionId.trim() !== '' && collectionId !== 'unassigned' && collectionId !== 'undefined' && collectionId !== 'null' && mongoose.Types.ObjectId.isValid(collectionId)) {
        updates.collectionId = collectionId;
      } else {
        updates.collectionId = null;
      }
    }
    if (isFavorite !== undefined) updates.isFavorite = !!isFavorite;
    if (isPinned !== undefined) updates.isPinned = !!isPinned;
    if (codeLanguage !== undefined) updates.codeLanguage = codeLanguage;
    if (sourceUrl !== undefined) updates.sourceUrl = (sourceUrl || '').trim();
    if (relatedNotes !== undefined) {
      updates.relatedNotes = Array.isArray(relatedNotes)
        ? relatedNotes.filter(rn => rn && rn !== 'undefined' && rn !== 'null' && mongoose.Types.ObjectId.isValid(String(rn)))
        : [];
    }

    const updated = await NoteModel.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.json({
      success: true,
      note: updated
    });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ success: false, message: 'Failed to update note.', error: err.message });
  }
});

// DELETE /api/notes/:id - Delete note and clean up revisions
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const note = await NoteModel.findById(req.params.id);

    if (!note || String(note.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.'
      });
    }

    await NoteRevisionModel.deleteMany({ noteId: req.params.id, user: userId });
    await NoteModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Note and its revisions deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete note.', error: err.message });
  }
});

// POST /api/notes/:id/duplicate - Duplicate an existing note
router.post('/:id/duplicate', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const original = await NoteModel.findById(req.params.id);

    if (!original || String(original.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Original note not found.'
      });
    }

    const duplicated = await NoteModel.create({
      user: userId,
      title: `${original.title} (Copy)`,
      content: original.content,
      type: original.type,
      tags: [...(original.tags || [])],
      collectionId: original.collectionId,
      isFavorite: false,
      isPinned: false,
      codeLanguage: original.codeLanguage,
      sourceUrl: original.sourceUrl,
      relatedNotes: [...(original.relatedNotes || [])]
    });

    await NoteRevisionModel.create({
      noteId: duplicated._id || duplicated.id,
      user: userId,
      title: duplicated.title,
      content: duplicated.content,
      type: duplicated.type,
      tags: duplicated.tags,
      changeSummary: 'Duplicated from existing note'
    });

    res.status(201).json({
      success: true,
      note: duplicated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to duplicate note.', error: err.message });
  }
});

// PATCH /api/notes/:id/favorite - Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const note = await NoteModel.findById(req.params.id);

    if (!note || String(note.user) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const updated = await NoteModel.findByIdAndUpdate(
      req.params.id,
      { isFavorite: !note.isFavorite },
      { new: true }
    );

    res.json({ success: true, isFavorite: updated.isFavorite });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle favorite.', error: err.message });
  }
});

// GET /api/notes/:id/revisions - List revision history
router.get('/:id/revisions', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const note = await NoteModel.findById(req.params.id);

    if (!note || String(note.user) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const revsRes = await NoteRevisionModel.find({ noteId: req.params.id, user: userId });
    let revisions = Array.isArray(revsRes) ? revsRes : await revsRes.exec();

    // Sort newest first
    revisions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      revisions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch revisions.', error: err.message });
  }
});

// POST /api/notes/:id/revisions/:revisionId/restore - Restore an earlier revision
router.post('/:id/revisions/:revisionId/restore', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const note = await NoteModel.findById(req.params.id);
    const revision = await NoteRevisionModel.findById(req.params.revisionId);

    if (!note || String(note.user) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    if (!revision || String(revision.user) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Revision not found.' });
    }

    // Save snapshot of current state before restoring
    await NoteRevisionModel.create({
      noteId: note._id || note.id,
      user: userId,
      title: note.title,
      content: note.content,
      type: note.type,
      tags: note.tags,
      changeSummary: `Pre-restore snapshot before applying revision ${revision._id || revision.id}`
    });

    const restored = await NoteModel.findByIdAndUpdate(
      req.params.id,
      {
        title: revision.title,
        content: revision.content,
        type: revision.type || note.type,
        tags: revision.tags || note.tags
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Revision restored successfully.',
      note: restored
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to restore revision.', error: err.message });
  }
});

module.exports = router;
