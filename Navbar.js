import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() {
    await logout();
    navigate('/');
  }
  return (
    <header className="navbar">
      <Link className="brand" to="/">InkWell<span>.</span></Link>
      <nav>
        <NavLink to="/">Explore</NavLink>
        {isAuthenticated && <NavLink to="/write">Write</NavLink>}
        {isAuthenticated && <NavLink to="/profile">Profile</NavLink>}
      </nav>
      <div className="nav-actions">
        {isAuthenticated
          ? <><span className="welcome">Hi, {user?.name}</span><button className="button button-light" onClick={handleLogout}>Log out</button></>
          : <><Link className="nav-login" to="/login">Log in</Link><Link className="button button-primary" to="/register">Get started</Link></>}
      </div>
    </header>
  );
}
