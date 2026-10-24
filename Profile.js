import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage(''); setError('');
    try { await updateProfile({ name, bio }); setMessage('Your profile has been updated.'); }
    catch (err) { setError(err.response?.data?.message || 'Could not update profile.'); }
    finally { setBusy(false); }
  }

  return <main className="auth-layout"><section className="auth-card profile-card">
    <p className="eyebrow">YOUR SPACE</p><h1>Profile & settings</h1><p className="muted">Make your author profile feel like you.</p>
    <div className="profile-email"><span className="avatar">{(user?.name || 'U').slice(0, 1).toUpperCase()}</span><div><strong>{user?.email}</strong><p className="muted">Email address</p></div></div>
    {message && <div className="notice success">{message}</div>}{error && <div className="notice error">{error}</div>}
    <form className="form-stack" onSubmit={submit}>
      <label>Display name<input value={name} onChange={e => setName(e.target.value)} minLength="2" maxLength="80" required/></label>
      <label>Short bio<textarea value={bio} onChange={e => setBio(e.target.value)} maxLength="300" rows="4" placeholder="A few words about you…"/></label>
      <button className="button button-primary button-full" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  </section></main>;
}
