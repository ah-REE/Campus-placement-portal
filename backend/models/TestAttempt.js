import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  answers: [Number],
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

attemptSchema.index({ testId: 1, studentId: 1 }, { unique: true }); // one attempt per student

export default mongoose.model('TestAttempt', attemptSchema);