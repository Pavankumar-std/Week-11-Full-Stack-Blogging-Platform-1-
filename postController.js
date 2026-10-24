const Post = require('../models/Post');
const Comment = require('../models/Comment');

async function listPosts(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(30, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const filter = {};
  if (req.query.author) filter.author = req.query.author;
  if (req.query.search && req.query.search.trim()) {
    filter.$text = { $search: req.query.search.trim().slice(0, 100) };
  }
  const [posts, total] = await Promise.all([
    Post.find(filter).populate('author', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(filter)
  ]);
  res.json({ posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

async function createPost(req, res) {
  const { title, body, tags } = req.body || {};
  if (typeof title !== 'string' || typeof body !== 'string') {
    return res.status(400).json({ message: 'Title and body are required.' });
  }
  const post = await Post.create({
    title, body,
    tags: Array.isArray(tags) ? tags.slice(0, 10).map(String) : [],
    author: req.user._id
  });
  await post.populate('author', 'name');
  res.status(201).json({ post });
}

async function getPost(req, res) {
  const post = await Post.findById(req.params.id).populate('author', 'name bio');
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  res.json({ post });
}

async function updatePost(req, res) {
  const { title, body, tags } = req.body || {};
  const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
  if (!post) return res.status(404).json({ message: 'Post not found or you do not own it.' });
  if (title !== undefined) post.title = title;
  if (body !== undefined) post.body = body;
  if (tags !== undefined) post.tags = Array.isArray(tags) ? tags.slice(0, 10).map(String) : [];
  await post.save();
  await post.populate('author', 'name');
  res.json({ post });
}

async function deletePost(req, res) {
  const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
  if (!post) return res.status(404).json({ message: 'Post not found or you do not own it.' });
  await Comment.deleteMany({ post: post._id });
  res.json({ message: 'Post deleted.' });
}

async function toggleLike(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  const userId = req.user._id.toString();
  const alreadyLiked = post.likes.some((id) => id.toString() === userId);
  if (alreadyLiked) post.likes = post.likes.filter((id) => id.toString() !== userId);
  else post.likes.push(req.user._id);
  await post.save();
  res.json({ liked: !alreadyLiked, likesCount: post.likes.length });
}

module.exports = { listPosts, createPost, getPost, updatePost, deletePost, toggleLike };
