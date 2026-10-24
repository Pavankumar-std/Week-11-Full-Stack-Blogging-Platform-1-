import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function PostEditor() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!editing) return;
    api.get(`/posts/${id}`).then(({ data }) => {
      setTitle(data.post.title); setBody(data.post.body); setTags((data.post.tags || []).join(', '));
    }).catch((err) => setError(err.response?.data?.message || 'Could not load this post.'));
  }, [editing, id]);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const payload = { title, body, tags: tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      const response = editing ? await api.patch(`/posts/${id}`, payload) : await api.post('/posts', payload);
      navigate(`/posts/${response.data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save post. Check your connection and inputs.');
    } finally { setBusy(false); }
  }

  return <main className="editor-layout"><div className="editor-heading"><p className="eyebrow">THE WRITER'S ROOM</p><h1>{editing ? 'Edit your story' : 'Write a new story'}</h1><p className="muted">A clear title, a thought-out story, and you're ready to publish.</p></div>
    {error && <div className="notice error">{error}</div>}
    <form className="editor-form" onSubmit={submit}>
      <label>Story title<input value={title} onChange={e => setTitle(e.target.value)} minLength="3" maxLength="180" required placeholder="Give your story a title"/></label>
      <label>Tags <span className="muted">(comma separated)</span><input value={tags} onChange={e => setTags(e.target.value)} placeholder="technology, learning, life"/></label>
      <label>Your story<textarea value={body} onChange={e => setBody(e.target.value)} minLength="10" maxLength="30000" rows="14" required placeholder="Start with the idea you can't stop thinking about…"/></label>
      <div className="editor-actions"><button type="button" className="button button-light" onClick={() => navigate(-1)}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish story'}</button></div>
    </form>
  </main>;
}
