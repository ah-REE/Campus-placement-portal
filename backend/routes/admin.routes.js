import { Router } from 'express';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import Student from '../models/Student.js';
import Test from '../models/Test.js';
import Event from '../models/Event.js';
import { protect, requireRole } from '../middleware/auth.js';
import { notify } from '../utils/mailer.js';

const router = Router();
router.use(protect, requireRole('admin'));

router.get('/stats', async (req, res) => {
  const [students, companies, applications, pendingFeedback, selected] = await Promise.all([
    Student.countDocuments(),
    Company.countDocuments({ isActive: true }),
    Application.countDocuments(),
    Application.countDocuments({ feedback: '' }),
    Application.countDocuments({ status: 'Selected' })
  ]);
  res.json({ students, companies, applications, pendingFeedback, selected });
});

// Companies (max 10 active)
router.get('/companies', async (req, res) => res.json(await Company.find().sort({ createdAt: -1 })));

router.post('/companies', async (req, res) => {
  if (await Company.countDocuments({ isActive: true }) >= 10)
    return res.status(400).json({ message: 'Maximum of 10 active companies reached' });
  res.status(201).json(await Company.create(req.body));
});

router.put('/companies/:id', async (req, res) => {
  const old = await Company.findById(req.params.id);
  if (!old.isActive && req.body.isActive && await Company.countDocuments({ isActive: true }) >= 10)
    return res.status(400).json({ message: 'Maximum of 10 active companies reached' });
  res.json(await Company.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete('/companies/:id', async (req, res) => {
  res.json(await Company.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }));
});

// Applications with filters + feedback/status
router.get('/applications', async (req, res) => {
  const q = {};
  if (req.query.companyId) q.companyId = req.query.companyId;
  if (req.query.studentId) q.studentId = req.query.studentId;
  res.json(await Application.find(q).populate('studentId', 'name registerId email department cgpa').populate('companyId', 'name role').sort({ appliedAt: -1 }));
});

router.put('/applications/:id', async (req, res) => {
  const app = await Application.findById(req.params.id).populate('studentId', 'email name');
  if (!app) return res.status(404).json({ message: 'Application not found' });
  const { status, feedback } = req.body;
  if (status && ['Applied', 'Shortlisted', 'Selected', 'Rejected'].includes(status)) {
    app.status = status;
    app.history.push({ status });
  }
  if (typeof feedback === 'string') app.feedback = feedback;
  await app.save();
  notify(app.studentId.email, 'Application update', `<p>Your application status is now <b>${app.status}</b>.</p>${app.feedback ? `<p>Feedback: ${app.feedback}</p>` : ''}`);
  res.json({ message: 'Application updated', application: app });
});

// Students
router.get('/students/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const applications = await Application.find({ studentId: student._id }).populate('companyId', 'name role');
  res.json({ student: student.toSafe(), applications });
});

router.put('/students/:id/verify', async (req, res) => {
  const s = await Student.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  res.json({ message: 'Student verified', isVerified: s.isVerified });
});

router.put('/students/:id/ban', async (req, res) => {
  const s = await Student.findById(req.params.id);
  s.isActive = !s.isActive;
  await s.save();
  res.json({ message: s.isActive ? 'Student re-activated' : 'Student deactivated', isActive: s.isActive });
});

// Tests
router.get('/tests', async (req, res) => res.json(await Test.find().populate('companyId', 'name').sort({ createdAt: -1 })));

router.post('/tests', async (req, res) => {
  const { companyId, title, durationMins, startAt, endAt, questions } = req.body;
  if (!questions?.length) return res.status(400).json({ message: 'Add at least one question' });
  res.status(201).json(await Test.create({ companyId, title, durationMins, startAt, endAt, questions }));
});

router.delete('/tests/:id', async (req, res) => {
  await Test.findByIdAndDelete(req.params.id);
  res.json({ message: 'Test deleted' });
});

// Events
router.get('/events', async (req, res) => res.json(await Event.find().sort({ date: 1 })));
router.post('/events', async (req, res) => res.status(201).json(await Event.create({ ...req.body, createdBy: req.user.id })));
router.delete('/events/:id', async (req, res) => { await Event.findByIdAndDelete(req.params.id); res.json({ message: 'Event deleted' }); });

export default router;