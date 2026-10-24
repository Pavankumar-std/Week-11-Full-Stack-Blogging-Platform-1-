const Comment = require('../models/Comment');
const Post = require('../models/Post');

async function listComments(req, res) {
  const post = await Post.findById(req.params.postId).select('_id');
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  const comments = await Comment.find({ post: post._id })
    .populate('author', 'name')
    .sort({ createdAt: 1 });
  // Clients can render top-level comments and replies using parentComment.
  res.json({ comments });
}

async function createComment(req, res) {
  const { body, parentComment } = req.body || {};
  if (typeof body !== 'string' || !body.trim()) {
    return res.status(400).json({ message: 'Comment body is required.' });
  }
  const post = await Post.findById(req.params.postId).select('_id');
  if (!post) return res.status(404).json({ message: 'Post not found.' });

  let parentId = null;
  if (parentComment) {
    const parent = await Comment.findOne({ _id: parentComment, post: post._id });
    if (!parent) return res.status(400).json({ message: 'Parent comment does not belong to this post.' });
    parentId = parent._id;
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    body: body.trim(),
    parentComment: parentId
  });
  await comment.populate('author', 'name');
  res.status(201).json({ comment });
}

async function deleteComment(req, res) {
  const comment = await Comment.findOneAndDelete({ _id: req.params.id, author: req.user._id });
  if (!comment) return res.status(404).json({ message: 'Comment not found or you do not own it.' });
  await Comment.deleteMany({ parentComment: comment._id });
  res.json({ message: 'Comment deleted.' });
}

module.exports = { listComments, createComment, deleteComment };
