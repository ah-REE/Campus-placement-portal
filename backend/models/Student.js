import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  registerId: { type: String, required: true, unique: true, index: true, match: [/^[A-Za-z0-9]{7}$/, 'Register ID must be exactly 7 alphanumeric characters'] },
  name:       { type: String, required: true, match: [/^[A-Za-z ]{3,50}$/, 'Letters and spaces only, 3–50 characters'] },
  email:      { type: String, required: true, unique: true, index: true, lowercase: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Invalid email'] },
  phone:      { type: String, required: true, match: [/^\d{10}$/, 'Phone must be exactly 10 digits'] },
  gender:     { type: String, required: true, enum: ['Male', 'Female'] },
  dob:        { type: Date, required: true, validate: { validator(v) { const cut = new Date(); cut.setFullYear(cut.getFullYear() - 16); return v <= cut; }, message: 'Must be at least 16 years old' } },
  year:       { type: Number, required: true, enum: [1, 2, 3, 4] },
  department: { type: String, required: true, enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI&DS'] },
  tenthMarks:   { type: Number, required: true, min: 0, max: 100 },
  twelfthMarks: { type: Number, required: true, min: 0, max: 100 },
  cgpa:       { type: Number, required: true, min: 0, max: 10 },
  standingArrears: { type: Number, required: true, default: 0, validate: { validator: v => v === 0, message: 'Only students with zero standing arrears may register' } },
  internshipsCompleted: { type: Number, required: true, min: 0, max: 10 },
  address:    { type: String, required: true, minlength: 10, maxlength: 200 },
  resumeText: { type: String, required: true, minlength: 100, maxlength: 5000 },
  skills:     { type: [String], default: [] },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  bookmarks:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  lastAiFeedback: { feedback: String, at: Date }
}, { timestamps: true });

studentSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
studentSchema.methods.toSafe = function () {
  const o = this.toObject();
  delete o.passwordHash;
  return o;
};

export default mongoose.model('Student', studentSchema);