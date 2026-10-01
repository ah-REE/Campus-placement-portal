import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  package: { type: Number, required: true },           // LPA
  location: { type: String, required: true },
  eligibilityCgpa: { type: Number, required: true, min: 0, max: 10 },
  description: { type: String, default: '' },
  deadline: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);