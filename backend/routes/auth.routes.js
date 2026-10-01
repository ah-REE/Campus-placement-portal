import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import PasswordReset from '../models/PasswordReset.js';
import { protect } from '../middleware/auth.js';
import { notify } from '../utils/mailer.js';

const router = Router();
const sign = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const hashToken = t => crypto.createHash('sha256').update(t).digest('hex');
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// POST /api/auth/register — student self-registration
router.post('/register', async (req, res) => {
  try {
    const b = req.body;
    if (Number(b.standingArrears) !== 0)
      return res.status(403).json({ message: 'Only students with zero standing arrears can register' });
    if (!PASSWORD_RULE.test(b.password || ''))
      return res.status(400).json({ message: 'Password needs 8+ chars with upper, lower, number and special character' });

    const student = await Student.create({
      ...b,
      standingArrears: 0,
      skills: Array.isArray(b.skills) ? b.skills : String(b.skills || '').split(',').map(s => s.trim()).filter(Boolean),
      passwordHash: await bcrypt.hash(b.password, 10)
    });
    notify(student.email, 'Welcome to the Placement Portal', `<p>Hi ${student.name}, your registration (${student.registerId}) is complete. You can now log in and apply to up to 4 companies.</p>`);
    res.status(201).json({ message: 'Registered successfully. Please log in.' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: `Duplicate value for: ${Object.keys(err.keyValue).join(', ')}` });
    const msg = err.errors ? Object.values(err.errors).map(e => e.message).join('. ') : 'Registration failed';
    res.status(400).json({ message: msg });
  }
});

// POST /api/auth/login — role-based login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: (email || '').toLowerCase() });
  if (admin) {
    if (!await admin.comparePassword(password || '')) return res.status(401).json({ message: 'Invalid credentials' });
    return res.json({ token: sign(admin._id, 'admin'), user: { id: admin._id, role: 'admin', name: admin.name, email: admin.email } });
  }
  const student = await Student.findOne({ email: (email || '').toLowerCase() });
  if (!student || !await student.comparePassword(password || '')) return res.status(401).json({ message: 'Invalid credentials' });
  if (!student.isActive) return res.status(403).json({ message: 'Your account has been deactivated. Contact the placement office.' });
  res.json({ token: sign(student._id, 'student'), user: { id: student._id, role: 'student', name: student.name, email: student.email } });
});

// POST /api/auth/forgot
router.post('/forgot', async (req, res) => {
  const student = await Student.findOne({ email: (req.body.email || '').toLowerCase() });
  if (student) {
    const token = crypto.randomBytes(32).toString('hex');
    await PasswordReset.create({ studentId: student._id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 3600e3) });
    notify(student.email, 'Password reset', `<p>Use this link within 1 hour: <a href="${process.env.CLIENT_URL}/reset/${token}">${process.env.CLIENT_URL}/reset/${token}</a></p>`);
  }
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// POST /api/auth/reset/:token
router.post('/reset/:token', async (req, res) => {
  const rec = await PasswordReset.findOne({ tokenHash: hashToken(req.params.token), usedAt: null });
  if (!rec || rec.expiresAt < new Date()) return res.status(400).json({ message: 'Reset link invalid or expired' });
  if (!PASSWORD_RULE.test(req.body.password || '')) return res.status(400).json({ message: 'Password does not meet policy' });
  const student = await Student.findById(rec.studentId);
  student.passwordHash = await bcrypt.hash(req.body.password, 10);
  await student.save();
  rec.usedAt = new Date(); await rec.save();
  notify(student.email, 'Password changed', '<p>Your password was reset successfully.</p>');
  res.json({ message: 'Password updated. Please log in.' });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  if (req.user.role === 'admin') {
    const a = await Admin.findById(req.user.id);
    return res.json({ user: { id: a._id, role: 'admin', name: a.name, email: a.email } });
  }
  const s = await Student.findById(req.user.id);
  if (!s) return res.status(404).json({ message: 'Student not found' });
  res.json({ user: s.toSafe() });
});

export default router;