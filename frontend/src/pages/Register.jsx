import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../api/axios';
import '../styles-auth.css';

const DEPTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI&DS'];

const schema = yup.object({
  name: yup.string().required('Required').matches(/^[A-Za-z ]{3,50}$/, 'Letters and spaces only, 3–50 characters'),
  registerId: yup.string().required('Required').matches(/^[A-Za-z0-9]{7}$/, 'Exactly 7 alphanumeric characters'),
  email: yup.string().required('Required').email('Valid email required'),
  phone: yup.string().required('Required').matches(/^\d{10}$/, 'Exactly 10 digits'),
  gender: yup.string().oneOf(['Male', 'Female'], 'Select gender').required('Required'),
  dob: yup.date().required('Required').test('age', 'Must be at least 16 years old', v => {
    const cut = new Date(); cut.setFullYear(cut.getFullYear() - 16); return new Date(v) <= cut;
  }),
  year: yup.number().oneOf([1, 2, 3, 4], 'Select year').required('Required'),
  department: yup.string().oneOf(DEPTS, 'Select department').required('Required'),
  tenthMarks: yup.number().min(0).max(100).required('Required'),
  twelfthMarks: yup.number().min(0).max(100).required('Required'),
  cgpa: yup.number().min(0).max(10).required('Required'),
  standingArrears: yup.number().required('Required').test('zero', 'Only students with zero standing arrears can register', v => Number(v) === 0),
  internshipsCompleted: yup.number().min(0).max(10).integer().required('Required'),
  address: yup.string().min(10, 'Minimum 10 characters').max(200, 'Maximum 200 characters').required('Required'),
  resumeText: yup.string().min(100, 'Minimum 100 characters').max(5000, 'Maximum 5000 characters').required('Required'),
  skills: yup.string(),
  password: yup.string().required('Required').min(8, 'Min 8 characters')
    .matches(/[A-Z]/, 'Needs an uppercase letter').matches(/[a-z]/, 'Needs a lowercase letter')
    .matches(/\d/, 'Needs a number').matches(/[^A-Za-z0-9]/, 'Needs a special character'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Required')
});

export default function Register() {
  const navigate = useNavigate();
  const [serverErr, setServerErr] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema) });

  const pw = watch('password') || '';
  const pwChecks = [
    ['8+ chars', pw.length >= 8], ['A–Z', /[A-Z]/.test(pw)], ['a–z', /[a-z]/.test(pw)],
    ['0–9', /\d/.test(pw)], ['symbol', /[^A-Za-z0-9]/.test(pw)]
  ];

  const field = (key, label, node, full = false) => (
    <div className={`a-field ${errors[key] ? 'bad' : ''} ${full ? 'full' : ''}`}>
      <label>{label} <b>*</b></label>
      {node}
      {errors[key] && <span className="a-msg">{errors[key].message}</span>}
    </div>
  );

  const onSubmit = async values => {
    setServerErr('');
    try {
      const payload = { ...values, skills: (values.skills || '').split(',').map(s => s.trim()).filter(Boolean) };
      delete payload.confirmPassword;
      await api.post('/auth/register', payload);
      navigate('/login');
    } catch (e) { setServerErr(e.response?.data?.message || 'Registration failed'); }
  };

  return (
    <div className="auth">
      <header className="a-top">
        <Link to="/" className="a-brand"><b>A</b><span>Aurora Institute<small>Training &amp; Placement Cell</small></span></Link>
        <Link to="/" className="a-home">← Back to home</Link>
      </header>

      <div className="a-wrap a-grid reg">
        <aside className="a-aside">
          <div className="a-eyebrow">Batch 2025/26 · Registrations open</div>
          <h1>Join the <em>placement drive.</em></h1>
          <p>Eighteen validated fields, one-time entry — then the whole season runs from your dashboard.</p>
          <ul className="a-perks">
            <li>Zero-arrears eligibility gate enforced automatically</li>
            <li>Apply to 4 of 10 companies · compare 3 side-by-side</li>
            <li>Timed MCQ tests with instant auto-graded results</li>
            <li>AI resume feedback + verified profile badge</li>
          </ul>
          <div className="a-stats">
            <div><b>128</b><span>Recruiters</span></div>
            <div><b>₹54 LPA</b><span>Top offer</span></div>
            <div><b>94.2%</b><span>Placement rate</span></div>
          </div>
        </aside>

        <div className="a-card">
          <span className="a-stamp">18 VALIDATED FIELDS</span>
          <h2>Student registration</h2>
          <p className="a-sub">Every field is validated here and re-validated on the server. Fields marked <b style={{ color: 'var(--red)' }}>*</b> are mandatory.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <fieldset>
              <legend>01 · Personal</legend>
              <div className="a-row">
                {field('name', 'Full name', <input placeholder="e.g. Priya Raghavan" {...register('name')} />)}
                {field('registerId', 'Register ID', <input placeholder="7 chars, e.g. 22CS104" {...register('registerId')} />)}
                {field('email', 'Email', <input type="email" placeholder="you@aurora.edu" {...register('email')} />)}
                {field('phone', 'Phone', <input inputMode="numeric" placeholder="10 digits" {...register('phone')} />)}
                <div className={`a-field ${errors.gender ? 'bad' : ''}`}>
                  <label>Gender <b>*</b></label>
                  <div className="a-pills">
                    <label className="a-pill"><input type="radio" value="Male" {...register('gender')} /><span>Male</span></label>
                    <label className="a-pill"><input type="radio" value="Female" {...register('gender')} /><span>Female</span></label>
                  </div>
                  {errors.gender && <span className="a-msg">{errors.gender.message}</span>}
                </div>
                {field('dob', 'Date of birth', <input type="date" {...register('dob')} />)}
              </div>
            </fieldset>

            <fieldset>
              <legend>02 · Academic</legend>
              <div className="a-row">
                {field('year', 'Year of study', <select {...register('year')}><option value="">Select…</option>{[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}</select>)}
                {field('department', 'Department', <select {...register('department')}><option value="">Select…</option>{DEPTS.map(d => <option key={d}>{d}</option>)}</select>)}
                {field('tenthMarks', '10th marks (%)', <input type="number" step="0.01" placeholder="0–100" {...register('tenthMarks')} />)}
                {field('twelfthMarks', '12th marks (%)', <input type="number" step="0.01" placeholder="0–100" {...register('twelfthMarks')} />)}
                {field('cgpa', 'CGPA', <input type="number" step="0.01" placeholder="0.0–10.0" {...register('cgpa')} />)}
                {field('standingArrears', 'Standing arrears', <input type="number" placeholder="Must be 0" {...register('standingArrears')} />)}
                {field('internshipsCompleted', 'Internships completed', <input type="number" placeholder="0–10" {...register('internshipsCompleted')} />)}
              </div>
            </fieldset>

            <fieldset>
              <legend>03 · Address, resume &amp; skills</legend>
              <div className="a-row">
                {field('address', 'Address (10–200 chars)', <textarea rows={2} {...register('address')} />, true)}
                {field('resumeText', 'Resume — pasted text (100–5000 chars)', <textarea rows={6} placeholder="Paste your resume text…" {...register('resumeText')} />, true)}
                <div className="a-field full">
                  <label>Skills (comma-separated, optional)</label>
                  <input placeholder="React, Node.js, MongoDB" {...register('skills')} />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>04 · Security</legend>
              <div className="a-row">
                <div className={`a-field ${errors.password ? 'bad' : ''}`}>
                  <label>Password <b>*</b></label>
                  <input type="password" {...register('password')} />
                  <div className="a-pw">{pwChecks.map(([t, ok]) => <i key={t} className={ok ? 'on' : ''}>{t}</i>)}</div>
                  {errors.password && <span className="a-msg">{errors.password.message}</span>}
                </div>
                {field('confirmPassword', 'Confirm password', <input type="password" {...register('confirmPassword')} />)}
              </div>
            </fieldset>

            {serverErr && <p className="a-error">⚠ {serverErr}</p>}
            <button className="a-btn" disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Register →'}</button>
          </form>
          <div className="a-links">
            <Link to="/login">Already registered? Login →</Link>
            <Link to="/forgot">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}