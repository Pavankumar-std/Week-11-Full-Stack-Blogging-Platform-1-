const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  passwordHash: { type: String, required: true, select: false },
  bio: { type: String, trim: true, maxlength: 300, default: '' },
  refreshTokenHash: { type: String, select: false, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
