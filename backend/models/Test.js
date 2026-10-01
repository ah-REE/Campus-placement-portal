import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  durationMins: { type: Number, required: true, min: 1 },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  questions: [{
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.model('Test', testSchema);