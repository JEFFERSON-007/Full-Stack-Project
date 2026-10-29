const express = require('express');
const router = express.Router();
const CollectionModel = require('../models/Collection');
const NoteModel = require('../models/Note');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

const serializeCollection = (col, noteCount = 0) => {
  if (!col) return null;
  const raw = col.toJSON ? col.toJSON() : (col.toObject ? col.toObject() : (col._doc || col));
  const id = String(raw.id || raw._id || col._id || col.id);
  return {
    ...raw,
    id,
    _id: id,
    name: raw.name || col.name,
    description: raw.description !== undefined ? raw.description : col.description,
    color: raw.color || col.color || '#596A50',
    icon: raw.icon || col.icon || 'folder',
    noteCount: typeof noteCount === 'number' ? noteCount : (raw.noteCount || 0)
  };
};

// GET /api/collections - List user's collections with note counts
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const collectionsRes = await CollectionModel.find({ user: userId });
    const collections = Array.isArray(collectionsRes) ? collectionsRes : await collectionsRes.exec();

    // Compute note count for each collection
    const notesRes = await NoteModel.find({ user: userId });
    const notes = Array.isArray(notesRes) ? notesRes : await notesRes.exec();

    const collectionsWithCounts = collections.map(col => {
      const colId = String(col._id || col.id);
      const count = notes.filter(n => String(n.collectionId) === colId).length;
      return serializeCollection(col, count);
    });

    res.json({
      success: true,
      collections: collectionsWithCounts
    });
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch collections.', error: err.message });
  }
});

// POST /api/collections - Create collection
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, description, color, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required.'
      });
    }

    const newCollection = await CollectionModel.create({
      user: userId,
      name: name.trim(),
      description: (description || '').trim(),
      color: color || '#596A50',
      icon: icon || 'folder'
    });

    res.status(201).json({
      success: true,
      collection: serializeCollection(newCollection, 0)
    });
  } catch (err) {
    console.error('Error creating collection:', err);
    res.status(500).json({ success: false, message: 'Failed to create collection.', error: err.message });
  }
});

// GET /api/collections/:id - Get collection details & notes
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const collection = await CollectionModel.findById(req.params.id);

    if (!collection || String(collection.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found.'
      });
    }

    const notesRes = await NoteModel.find({ user: userId, collectionId: collection._id || collection.id });
    const notes = Array.isArray(notesRes) ? notesRes : await notesRes.exec();

    res.json({
      success: true,
      collection: serializeCollection(collection, notes.length),
      notes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch collection details.', error: err.message });
  }
});

// PUT /api/collections/:id - Update collection
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const collection = await CollectionModel.findById(req.params.id);

    if (!collection || String(collection.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found.'
      });
    }

    const { name, description, color, icon } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (color) updates.color = color;
    if (icon) updates.icon = icon;

    const updated = await CollectionModel.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.json({
      success: true,
      collection: serializeCollection(updated)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update collection.', error: err.message });
  }
});

// DELETE /api/collections/:id - Delete collection safely
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const collection = await CollectionModel.findById(req.params.id);

    if (!collection || String(collection.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found.'
      });
    }

    // Unassign collection from associated notes
    const notesRes = await NoteModel.find({ user: userId, collectionId: req.params.id });
    const notes = Array.isArray(notesRes) ? notesRes : await notesRes.exec();
    for (const note of notes) {
      await NoteModel.findByIdAndUpdate(note._id || note.id, { collectionId: null });
    }

    await CollectionModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Collection deleted successfully and associated notes unassigned.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete collection.', error: err.message });
  }
});

module.exports = router;
