import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/posts', { params: { search: query || undefined, page: 1, limit: 12 } })
      .then((res) => { if (active) setPosts(res.data.posts); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Could not load posts. Is the backend running?'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query]);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">IDEAS WORTH SHARING</p>
          <h1>Stories begin with<br/><em>a single thought.</em></h1>
          <p className="hero-description">A little corner of the internet for curious minds, honest stories, and ideas that stay with you.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#latest">Explore stories</a>
            {isAuthenticated && <Link className="button button-outline" to="/write">Write a story ↗</Link>}
          </div>
        </div>
        <div className="hero-art" aria-label="Decorative illustration">
          <div className="art-circle"></div><div className="art-card"><span>YOUR NEXT<br/>GREAT IDEA</span><div className="art-lines"></div><small>✳ &nbsp; Keep creating</small></div>
          <span className="art-star">✳</span><span className="art-dot">●</span>
        </div>
      </section>

      <section id="latest" className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">THE COMMUNITY</p><h2>Fresh from the notebook</h2></div>
          <form className="search-form" onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()); }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stories…" aria-label="Search stories"/>
            <button className="button button-dark">Search</button>
          </form>
        </div>
        {loading ? <div className="center-state">Loading stories…</div> :
          error ? <div className="notice error">{error}</div> :
          posts.length === 0 ? <div className="empty-state"><h3>No stories yet</h3><p>Be the first to share something worth reading.</p>{isAuthenticated && <Link to="/write" className="button button-primary">Write the first story</Link>}</div> :
          <div className="post-grid">{posts.map((post) => (
            <article className="post-card" key={post._id}>
              <div className="post-card-top"><span className="post-tag">{post.tags?.[0] || 'STORY'}</span><span className="muted">{new Date(post.createdAt).toLocaleDateString()}</span></div>
              <h3><Link to={`/posts/${post._id}`}>{post.title}</Link></h3>
              <p>{post.body.slice(0, 160)}{post.body.length > 160 ? '…' : ''}</p>
              <div className="post-card-footer"><span>By {post.author?.name || 'Writer'}</span><span>♡ {post.likes?.length || 0}</span></div>
            </article>
          ))}</div>}
      </section>
    </main>
  );
}
