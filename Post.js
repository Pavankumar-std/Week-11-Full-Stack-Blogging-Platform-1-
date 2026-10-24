const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 180 },
  body: { type: String, required: true, trim: true, minlength: 10, maxlength: 30000 },
  tags: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

postSchema.index({ title: 'text', body: 'text', tags: 'text' });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
