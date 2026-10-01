import { Router } from 'express';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import Event from '../models/Event.js';
import Test from '../models/Test.js';
import TestAttempt from '../models/TestAttempt.js';
import { protect, requireRole } from '../middleware/auth.js';
import { notify } from '../utils/mailer.js';
import { aiResumeFeedback } from '../utils/gemini.js';

const router = Router();
router.use(protect, requireRole('student'));

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  const student = await Student.findById(req.user.id);
  const apps = await Application.find({ studentId: req.user.id }).populate('companyId', 'name role').sort({ appliedAt: -1 });
  const withFb = apps.find(a => a.feedback && a.feedback.trim());
  const fields = ['name', 'email', 'phone', 'gender', 'dob', 'year', 'department', 'tenthMarks', 'twelfthMarks', 'cgpa', 'address', 'resumeText'];
  const filled = fields.filter(f => student[f] !== undefined && student[f] !== null && student[f] !== '').length + (student.skills?.length ? 1 : 0);
  res.json({
    applicationsUsed: apps.length,
    maxApplications: 4,
    completeness: Math.round((filled / (fields.length + 1)) * 100),
    isVerified: student.isVerified,
    latestFeedback: withFb ? { company: withFb.companyId?.name, status: withFb.status, feedback: withFb.feedback } : null
  });
});

// Companies + bookmark toggle
router.get('/companies', async (req, res) => {
  const student = await Student.findById(req.user.id);
  const companies = await Company.find({ isActive: true }).sort({ deadline: 1 });
  res.json(companies.map(c => ({ ...c.toObject(), bookmarked: student.bookmarks.some(b => String(b) === String(c._id)) })));
});

router.post('/companies/:id/bookmark', async (req, res) => {
  const student = await Student.findById(req.user.id);
  const id = req.params.id;
  const has = student.bookmarks.some(b => String(b) === id);
  student.bookmarks = has ? student.bookmarks.filter(b => String(b) !== id) : [...student.bookmarks, id];
  await student.save();
  res.json({ message: has ? 'Removed from watchlist' : 'Added to watchlist', bookmarked: !has });
});

// Applications (max 4 of 10, no duplicates)
router.get('/applications', async (req, res) => {
  const apps = await Application.find({ studentId: req.user.id }).populate('companyId').sort({ appliedAt: -1 });
  res.json(apps);
});

router.post('/applications', async (req, res) => {
  const company = await Company.findById(req.body.companyId);
  if (!company || !company.isActive) return res.status(404).json({ message: 'Company not found or inactive' });
  if (company.deadline && new Date(company.deadline) < new Date()) return res.status(400).json({ message: 'Application deadline has passed' });
  const student = await Student.findById(req.user.id);
  if (student.standingArrears !== 0) return res.status(403).json({ message: 'Zero arrears required to apply' });
  if (student.cgpa < company.eligibilityCgpa) return res.status(400).json({ message: `Requires CGPA ≥ ${company.eligibilityCgpa}` });
  const existing = await Application.find({ studentId: req.user.id });
  if (existing.some(a => String(a.companyId) === String(company._id))) return res.status(400).json({ message: 'Already applied to this company' });
  if (existing.length >= 4) return res.status(400).json({ message: 'Maximum of 4 applications reached' });
  const app = await Application.create({ studentId: req.user.id, companyId: company._id, history: [{ status: 'Applied' }] });
  notify(student.email, 'Application received', `<p>Your application to <b>${company.name}</b> (${company.role}) was submitted.</p>`);
  res.status(201).json({ message: 'Applied successfully', application: app });
});

router.get('/applications/:id', async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, studentId: req.user.id }).populate('companyId');
  if (!app) return res.status(404).json({ message: 'Application not found' });
  res.json(app);
});

// Profile edit + AI feedback
router.put('/profile', async (req, res) => {
  const allowed = ['phone', 'address', 'skills', 'resumeText', 'tenthMarks', 'twelfthMarks', 'cgpa', 'internshipsCompleted'];
  const student = await Student.findById(req.user.id);
  allowed.forEach(f => { if (req.body[f] !== undefined) student[f] = req.body[f]; });
  await student.save();
  res.json({ message: 'Profile updated', user: student.toSafe() });
});

router.post('/ai-feedback', async (req, res) => {
  const student = await Student.findById(req.user.id);
  const feedback = await aiResumeFeedback(student.resumeText);
  student.lastAiFeedback = { feedback, at: new Date() };
  await student.save();
  res.json({ feedback, at: student.lastAiFeedback.at });
});

// Calendar
router.get('/events', async (req, res) => {
  res.json(await Event.find().sort({ date: 1 }));
});

// Tests
router.get('/tests', async (req, res) => {
  const apps = await Application.find({ studentId: req.user.id }).select('companyId');
  const tests = await Test.find({ companyId: { $in: apps.map(a => a.companyId) } }).populate('companyId', 'name');
  const attempts = await TestAttempt.find({ studentId: req.user.id, testId: { $in: tests.map(t => t._id) } });
  const now = new Date();
  res.json(tests.map(t => ({
    _id: t._id, title: t.title, company: t.companyId?.name, durationMins: t.durationMins,
    startAt: t.startAt, endAt: t.endAt, open: t.startAt <= now && now <= t.endAt,
    attempted: attempts.some(a => String(a.testId) === String(t._id)),
    score: attempts.find(a => String(a.testId) === String(t._id))?.score ?? null
  })));
});

router.get('/tests/:id', async (req, res) => {
  const test = await Test.findById(req.params.id).populate('companyId', 'name');
  if (!test) return res.status(404).json({ message: 'Test not found' });
  const applied = await Application.findOne({ studentId: req.user.id, companyId: test.companyId._id });
  if (!applied) return res.status(403).json({ message: 'Apply to the company before taking its test' });
  const attempt = await TestAttempt.findOne({ testId: test._id, studentId: req.user.id });
  if (attempt) return res.status(409).json({ message: 'Already attempted', score: attempt.score });
  const now = new Date();
  if (now < test.startAt || now > test.endAt) return res.status(400).json({ message: 'Test window is not open' });
  res.json({ _id: test._id, title: test.title, company: test.companyId.name, durationMins: test.durationMins, questions: test.questions.map(q => ({ text: q.text, options: q.options })) });
});

router.post('/tests/:id/submit', async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) return res.status(404).json({ message: 'Test not found' });
  const now = new Date();
  if (now < test.startAt || now > test.endAt) return res.status(400).json({ message: 'Test window closed' });
  if (await TestAttempt.findOne({ testId: test._id, studentId: req.user.id })) return res.status(409).json({ message: 'Only one attempt allowed' });
  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const correct = test.questions.reduce((n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const score = Math.round((correct / test.questions.length) * 100);
  await TestAttempt.create({ testId: test._id, studentId: req.user.id, answers, score });
  await Application.findOneAndUpdate({ studentId: req.user.id, companyId: test.companyId }, { testScore: score });
  res.json({ message: 'Test submitted', score, correct, total: test.questions.length });
});

export default router;