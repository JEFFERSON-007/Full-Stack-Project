const express = require('express');
const router = express.Router();
const MindMapModel = require('../models/MindMap');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/mindmaps - List all mind maps for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const mapsRes = await MindMapModel.find({ user: userId });
    let maps = Array.isArray(mapsRes) ? mapsRes : await mapsRes.exec();

    // Sort newest updated first
    maps.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    const summaries = maps.map(m => ({
      id: m._id || m.id,
      name: m.name,
      description: m.description,
      nodeCount: (m.nodes || []).length,
      edgeCount: (m.edges || []).length,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));

    res.json({
      success: true,
      mindMaps: summaries
    });
  } catch (err) {
    console.error('Error fetching mind maps:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch mind maps.', error: err.message });
  }
});

// POST /api/mindmaps - Create a new mind map
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, description = '', nodes, edges } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mind map name is required.'
      });
    }

    // Default starter nodes if none provided
    const initialNodes = Array.isArray(nodes) && nodes.length > 0 ? nodes : [
      {
        id: 'root-1',
        type: 'mindMapNode',
        position: { x: 250, y: 200 },
        data: {
          label: name.trim(),
          isRoot: true,
          color: '#596A50'
        }
      }
    ];

    const initialEdges = Array.isArray(edges) ? edges : [];

    const newMap = await MindMapModel.create({
      user: userId,
      name: name.trim(),
      description: description.trim(),
      nodes: initialNodes,
      edges: initialEdges
    });

    res.status(201).json({
      success: true,
      mindMap: newMap
    });
  } catch (err) {
    console.error('Error creating mind map:', err);
    res.status(500).json({ success: false, message: 'Failed to create mind map.', error: err.message });
  }
});

// GET /api/mindmaps/:id - Get full mind map
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const map = await MindMapModel.findById(req.params.id);

    if (!map || String(map.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Mind map not found.'
      });
    }

    res.json({
      success: true,
      mindMap: map
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch mind map.', error: err.message });
  }
});

// PUT /api/mindmaps/:id - Update nodes, edges, or metadata
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const map = await MindMapModel.findById(req.params.id);

    if (!map || String(map.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Mind map not found.'
      });
    }

    const { name, description, nodes, edges } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (nodes !== undefined) updates.nodes = nodes;
    if (edges !== undefined) updates.edges = edges;

    const updated = await MindMapModel.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.json({
      success: true,
      mindMap: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save mind map.', error: err.message });
  }
});

// DELETE /api/mindmaps/:id - Delete mind map
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const map = await MindMapModel.findById(req.params.id);

    if (!map || String(map.user) !== String(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Mind map not found.'
      });
    }

    await MindMapModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Mind map deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete mind map.', error: err.message });
  }
});

module.exports = router;
