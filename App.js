import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetails from './pages/PostDetails';
import PostEditor from './pages/PostEditor';
import Profile from './pages/Profile';

export default function App() {
  return <div className="app-shell">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/posts/:id" element={<PostDetails />} />
      <Route path="/write" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
      <Route path="/edit/:id" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <footer className="footer"><Link className="brand" to="/">InkWell<span>.</span></Link><p>Make space for good ideas.</p><small>Week 11 Full Stack Blogging Platform</small></footer>
  </div>;
}

import { Link } from 'react-router-dom';
