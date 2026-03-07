const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: String, required: false },
  imageUrl: { type: String, required: true },
  points: { type: [String], default: [] },
  participants: { type: Number, default: 0 },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isFeatured: { type: Boolean, default: false },
  featuredOrder: { type: Number, default: 0 },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    userType: String,
    profilePhoto: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

const News = mongoose.model('News', newsSchema, 'news');

module.exports = News;
