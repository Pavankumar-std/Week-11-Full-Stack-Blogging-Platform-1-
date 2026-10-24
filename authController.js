const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, bio: user.bio });

function makeAccessToken(user) {
  return jwt.sign({ userId: user._id.toString() }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || '15m'
  });
}
function makeRefreshToken(user) {
  return jwt.sign({ userId: user._id.toString(), type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7)}d`
  });
}
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
function setRefreshCookie(res, token) {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  });
}

async function register(req, res) {
  const { name, email, password } = req.body || {};
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, passwordHash });
    const refreshToken = makeRefreshToken(user);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
    setRefreshCookie(res, refreshToken);
    return res.status(201).json({ message: 'Account created.', accessToken: makeAccessToken(user), user: safeUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Email is already registered.' });
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    throw error;
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash +refreshTokenHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const refreshToken = makeRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  setRefreshCookie(res, refreshToken);
  return res.json({ message: 'Login successful.', accessToken: makeAccessToken(user), user: safeUser(user) });
}

async function refresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token missing.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (payload.type !== 'refresh') return res.status(401).json({ message: 'Invalid refresh token.' });
    const user = await User.findById(payload.userId).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
      return res.status(401).json({ message: 'Refresh token is invalid or has been rotated.' });
    }
    const newRefreshToken = makeRefreshToken(user);
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();
    setRefreshCookie(res, newRefreshToken);
    return res.json({ accessToken: makeAccessToken(user), user: safeUser(user) });
  } catch (error) {
    if (['JsonWebTokenError', 'TokenExpiredError'].includes(error.name)) {
      return res.status(401).json({ message: 'Refresh token is invalid or expired.' });
    }
    throw error;
  }
}

async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.userId).select('+refreshTokenHash');
      if (user && user.refreshTokenHash === hashToken(token)) {
        user.refreshTokenHash = null;
        await user.save();
      }
    } catch (_) { /* Always clear the browser cookie during logout. */ }
  }
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/api/auth'
  });
  return res.json({ message: 'Logged out.' });
}

async function me(req, res) {
  res.json({ user: safeUser(req.user) });
}

async function updateMe(req, res) {
  const { name, bio } = req.body || {};
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
    }
    req.user.name = name.trim();
  }
  if (bio !== undefined) {
    if (typeof bio !== 'string' || bio.length > 300) return res.status(400).json({ message: 'Bio cannot exceed 300 characters.' });
    req.user.bio = bio.trim();
  }
  await req.user.save();
  res.json({ message: 'Profile updated.', user: safeUser(req.user) });
}

module.exports = { register, login, refresh, logout, me, updateMe };
