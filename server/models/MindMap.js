const mongoose = require('mongoose');
const { EmbeddedModel } = require('./storage');

const mindMapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Mind map name is required'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  nodes: {
    type: Array,
    default: []
  },
  edges: {
    type: Array,
    default: []
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = (ret._id || ret.id)?.toString();
      if (ret.user) ret.user = ret.user?.toString();
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = (ret._id || ret.id)?.toString();
      if (ret.user) ret.user = ret.user?.toString();
      return ret;
    }
  }
});

mindMapSchema.index({ user: 1, updatedAt: -1 });

let MongooseMindMapModel;
try {
  MongooseMindMapModel = mongoose.model('MindMap', mindMapSchema);
} catch (e) {
  MongooseMindMapModel = mongoose.models.MindMap;
}

const MindMapModel = new EmbeddedModel('mindmaps', MongooseMindMapModel);

module.exports = MindMapModel;
