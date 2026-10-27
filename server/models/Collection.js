const mongoose = require('mongoose');
const { EmbeddedModel } = require('./storage');

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: 80
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  color: {
    type: String,
    default: '#596A50' // Olive accent
  },
  icon: {
    type: String,
    default: 'folder'
  }
}, {
  timestamps: true
});

let MongooseCollectionModel;
try {
  MongooseCollectionModel = mongoose.model('Collection', collectionSchema);
} catch (e) {
  MongooseCollectionModel = mongoose.models.Collection;
}

const CollectionModel = new EmbeddedModel('collections', MongooseCollectionModel);

module.exports = CollectionModel;
