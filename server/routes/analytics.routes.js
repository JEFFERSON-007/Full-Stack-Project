const express = require('express');
const router = express.Router();
const NoteModel = require('../models/Note');
const CollectionModel = require('../models/Collection');
const NoteRevisionModel = require('../models/NoteRevision');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/analytics - Get full analytics and dashboard metrics
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { days = 30 } = req.query;
    const dayRange = parseInt(days, 10) || 30;

    // Fetch notes and collections for user
    const notesRes = await NoteModel.find({ user: userId });
    const notes = Array.isArray(notesRes) ? notesRes : await notesRes.exec();

    const collectionsRes = await CollectionModel.find({ user: userId });
    const collections = Array.isArray(collectionsRes) ? collectionsRes : await collectionsRes.exec();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const rangeStartDate = new Date(now.getTime() - dayRange * 24 * 60 * 60 * 1000);

    // 1. Overview counts
    const totalNotes = notes.length;
    const totalCollections = collections.length;
    const favoriteNotes = notes.filter(n => n.isFavorite).length;
    const notesAddedRecently = notes.filter(n => new Date(n.createdAt) >= sevenDaysAgo).length;

    // 2. Activity timeline over time (grouped by day)
    const dateMap = {};
    for (let i = dayRange - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[key] = 0;
    }

    for (const note of notes) {
      const noteDate = new Date(note.createdAt);
      if (noteDate >= rangeStartDate) {
        const key = noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dateMap[key] !== undefined) {
          dateMap[key] += 1;
        }
      }
    }

    const activityTimeline = Object.entries(dateMap).map(([date, count]) => ({
      date,
      notes: count
    }));

    // 3. Category / Collection distribution
    const colMap = {};
    for (const col of collections) {
      colMap[String(col._id || col.id)] = {
        name: col.name,
        color: col.color || '#596A50',
        count: 0
      };
    }

    let unassignedCount = 0;
    for (const note of notes) {
      if (note.collectionId && colMap[String(note.collectionId)]) {
        colMap[String(note.collectionId)].count += 1;
      } else {
        unassignedCount += 1;
      }
    }

    const collectionDistribution = Object.values(colMap).filter(c => c.count > 0);
    if (unassignedCount > 0) {
      collectionDistribution.push({
        name: 'Unassigned',
        color: '#6E6D66',
        count: unassignedCount
      });
    }

    // 4. Distribution by note type
    const typeCounts = {
      text: 0,
      code: 0,
      link: 0,
      research: 0
    };

    for (const note of notes) {
      const t = note.type || 'text';
      if (typeCounts[t] !== undefined) {
        typeCounts[t] += 1;
      } else {
        typeCounts.text += 1;
      }
    }

    const typeDistribution = [
      { type: 'Text Notes', key: 'text', count: typeCounts.text, fill: '#596A50' },
      { type: 'Code Snippets', key: 'code', count: typeCounts.code, fill: '#BF765C' },
      { type: 'Web Links', key: 'link', count: typeCounts.link, fill: '#D99B26' },
      { type: 'Research Notes', key: 'research', count: typeCounts.research, fill: '#4E7271' }
    ];

    // 5. Most used tags
    const tagMap = {};
    for (const note of notes) {
      if (Array.isArray(note.tags)) {
        for (const t of note.tags) {
          const clean = t.trim().toLowerCase();
          if (clean) tagMap[clean] = (tagMap[clean] || 0) + 1;
        }
      }
    }

    const topTags = Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 6. Knowledge Health Summary
    let totalWords = 0;
    let connectedNotes = 0;
    for (const note of notes) {
      const wordCount = (note.content || '').trim().split(/\s+/).filter(Boolean).length;
      totalWords += wordCount;
      if (Array.isArray(note.relatedNotes) && note.relatedNotes.length > 0) {
        connectedNotes += 1;
      }
    }

    const revisionsRes = await NoteRevisionModel.find({ user: userId });
    const revisions = Array.isArray(revisionsRes) ? revisionsRes : await revisionsRes.exec();

    // 7. Recently edited notes (top 5)
    const recentlyEdited = [...notes]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(n => ({
        id: n._id || n.id,
        title: n.title,
        type: n.type,
        tags: n.tags,
        collectionId: n.collectionId,
        updatedAt: n.updatedAt,
        isFavorite: n.isFavorite
      }));

    // 8. Pinned notes
    const pinnedNotes = notes
      .filter(n => n.isPinned || n.isFavorite)
      .slice(0, 4)
      .map(n => ({
        id: n._id || n.id,
        title: n.title,
        type: n.type,
        tags: n.tags,
        updatedAt: n.updatedAt
      }));

    res.json({
      success: true,
      stats: {
        totalNotes,
        totalCollections,
        favoriteNotes,
        notesAddedRecently,
        totalWords,
        totalRevisions: revisions.length,
        connectedNotes
      },
      activityTimeline,
      collectionDistribution,
      typeDistribution,
      topTags,
      recentlyEdited,
      pinnedNotes
    });
  } catch (err) {
    console.error('Error computing analytics:', err);
    res.status(500).json({ success: false, message: 'Failed to compute analytics.', error: err.message });
  }
});

module.exports = router;
