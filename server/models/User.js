const mongoose = require('mongoose');
const { EmbeddedModel } = require('./storage');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    theme: { type: String, default: 'warm' },
    defaultView: { type: String, enum: ['grid', 'list'], default: 'grid' }
  }
}, {
  timestamps: true
});

let MongooseUserModel;
try {
  MongooseUserModel = mongoose.model('User', userSchema);
} catch (e) {
  MongooseUserModel = mongoose.models.User;
}

const UserModel = new EmbeddedModel('users', MongooseUserModel);

module.exports = UserModel;
