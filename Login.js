import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(e) {
    e.preventDefault(); clearError(); setBusy(true);
    const result = await login(email, password);
    setBusy(false);
    if (result.success) navigate(location.state?.from?.pathname || '/', { replace: true });
  }

  return <main className="auth-layout"><section className="auth-card">
    <p className="eyebrow">WELCOME BACK</p><h1>Good to see you.</h1><p className="muted">Sign in to continue your story.</p>
    {error && <div className="notice error">{error}</div>}
    <form onSubmit={submit} className="form-stack">
      <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"/></label>
      <button className="button button-primary button-full" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
    </form>
    <p className="auth-switch">New to InkWell? <Link to="/register">Create an account</Link></p>
  </section></main>;
}
