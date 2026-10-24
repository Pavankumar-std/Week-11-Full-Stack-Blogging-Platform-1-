import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PostDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const [postRes, commentRes] = await Promise.all([api.get(`/posts/${id}`), api.get(`/posts/${id}/comments`)]);
    setPost(postRes.data.post); setComments(commentRes.data.comments);
  }, [id]);

  useEffect(() => { load().catch(err => setError(err.response?.data?.message || 'Could not load story.')); }, [load]);

  async function addComment(e, parentComment = null, text = body) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await api.post(`/posts/${id}/comments`, { body: text, parentComment });
      setBody(''); setReplyBody(''); setReplyTo(null); await load();
    } catch (err) { setError(err.response?.data?.message || 'Could not add comment.'); }
    finally { setBusy(false); }
  }
  async function like() {
    try { await api.post(`/posts/${id}/like`); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Please log in to like a story.'); }
  }
  async function deletePost() {
    if (!window.confirm('Delete this story? This cannot be undone.')) return;
    try { await api.delete(`/posts/${id}`); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Could not delete story.'); }
  }

  if (!post && !error) return <div className="center-state">Loading story…</div>;
  if (!post) return <main className="content-section"><div className="notice error">{error}</div><Link to="/">Back to stories</Link></main>;
  const ownsPost = user?.id === post.author?._id || user?.id === post.author?.id;
  const topComments = comments.filter(c => !c.parentComment);

  return <main className="article-layout">
    <Link to="/" className="back-link">← All stories</Link>
    {error && <div className="notice error">{error}</div>}
    <article className="article">
      <div className="article-tags">{(post.tags || []).map(tag => <span className="post-tag" key={tag}>{tag}</span>)}</div>
      <h1>{post.title}</h1>
      <div className="article-meta">By {post.author?.name || 'Writer'} · {new Date(post.createdAt).toLocaleDateString()}</div>
      <div className="article-body">{post.body}</div>
      <div className="article-actions"><button className="button button-light" onClick={like}>♡ {post.likes?.length || 0} likes</button>
        {isAuthenticated && <button className="button button-light" onClick={() => document.getElementById('comment-box')?.focus()}>Add a comment</button>}
        {ownsPost && <><Link className="button button-light" to={`/edit/${post._id}`}>Edit</Link><button className="button button-danger" onClick={deletePost}>Delete</button></>}
      </div>
    </article>
    <section className="comments-section">
      <h2>Conversation <span className="muted">({comments.length})</span></h2>
      {isAuthenticated ? <form className="comment-form" onSubmit={(e) => addComment(e)}>
        <textarea id="comment-box" rows="3" value={body} onChange={e => setBody(e.target.value)} placeholder="Add something thoughtful…" required maxLength="2000"/>
        <button className="button button-primary" disabled={busy}>{busy ? 'Posting…' : 'Post comment'}</button>
      </form> : <p className="muted">Please <Link to="/login">log in</Link> to join the conversation.</p>}
      {topComments.map(comment => <div className="comment" key={comment._id}>
        <div className="comment-heading"><strong>{comment.author?.name || 'Reader'}</strong><span className="muted">{new Date(comment.createdAt).toLocaleDateString()}</span></div>
        <p>{comment.body}</p>
        {isAuthenticated && <button className="text-button" onClick={() => { setReplyTo(replyTo === comment._id ? null : comment._id); setReplyBody(''); }}>↳ Reply</button>}
        {replyTo === comment._id && <form className="reply-form" onSubmit={e => addComment(e, comment._id, replyBody)}><textarea rows="2" value={replyBody} onChange={e => setReplyBody(e.target.value)} required placeholder="Write a reply…"/><button className="button button-primary button-small" disabled={busy}>Reply</button></form>}
        <div className="replies">{comments.filter(reply => reply.parentComment === comment._id).map(reply => <div className="reply" key={reply._id}><strong>{reply.author?.name || 'Reader'}</strong><p>{reply.body}</p></div>)}</div>
      </div>)}
      {topComments.length === 0 && <p className="muted">No comments yet. Start the conversation.</p>}
    </section>
  </main>;
}
