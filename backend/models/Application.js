import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'], default: 'Applied' },
  feedback: { type: String, default: '' },
  history: [{ status: String, at: { type: Date, default: Date.now } }],
  appliedAt: { type: Date, default: Date.now },
  testScore: { type: Number, default: null }
});

applicationSchema.index({ studentId: 1, companyId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);