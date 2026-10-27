const mongoose = require('mongoose');
const { EmbeddedModel } = require('./storage');

const noteRevisionSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  tags: {
    type: [String],
    default: []
  },
  changeSummary: {
    type: String,
    default: 'Snapshot before update'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

noteRevisionSchema.index({ noteId: 1, createdAt: -1 });

let MongooseNoteRevisionModel;
try {
  MongooseNoteRevisionModel = mongoose.model('NoteRevision', noteRevisionSchema);
} catch (e) {
  MongooseNoteRevisionModel = mongoose.models.NoteRevision;
}

const NoteRevisionModel = new EmbeddedModel('noterevisions', MongooseNoteRevisionModel);

module.exports = NoteRevisionModel;
