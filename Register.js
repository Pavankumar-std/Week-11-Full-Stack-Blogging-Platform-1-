import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault(); clearError(); setBusy(true);
    const result = await register({ name, email, password });
    setBusy(false);
    if (result.success) navigate('/');
  }

  return <main className="auth-layout"><section className="auth-card">
    <p className="eyebrow">YOUR NEXT CHAPTER</p><h1>Make room for ideas.</h1><p className="muted">Join the community and publish your first story.</p>
    {error && <div className="notice error">{error}</div>}
    <form onSubmit={submit} className="form-stack">
      <label>Your name<input value={name} onChange={e => setName(e.target.value)} minLength="2" maxLength="80" required autoComplete="name"/></label>
      <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength="8" required autoComplete="new-password"/><small>Use at least 8 characters.</small></label>
      <button className="button button-primary button-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
    </form>
    <p className="auth-switch">Already a member? <Link to="/login">Log in</Link></p>
  </section></main>;
}
