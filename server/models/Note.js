const mongoose = require('mongoose');
const { EmbeddedModel } = require('./storage');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['text', 'code', 'link', 'research'],
    default: 'text'
  },
  tags: {
    type: [String],
    default: []
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  codeLanguage: {
    type: String,
    default: 'javascript'
  },
  sourceUrl: {
    type: String,
    trim: true,
    default: ''
  },
  relatedNotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }]
}, {
  timestamps: true
});

// Indexes for fast searching and filtering
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, type: 1 });
noteSchema.index({ user: 1, collectionId: 1 });
noteSchema.index({ user: 1, isFavorite: 1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

let MongooseNoteModel;
try {
  MongooseNoteModel = mongoose.model('Note', noteSchema);
} catch (e) {
  MongooseNoteModel = mongoose.models.Note;
}

const NoteModel = new EmbeddedModel('notes', MongooseNoteModel);

module.exports = NoteModel;
