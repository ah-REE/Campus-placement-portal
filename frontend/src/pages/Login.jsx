import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles-auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e2) { setErr(e2.response?.data?.message || 'Login failed'); setBusy(false); }
  };

  return (
    <div className="auth">
      <header className="a-top">
        <Link to="/" className="a-brand"><b>A</b><span>Aurora Institute<small>Training &amp; Placement Cell</small></span></Link>
        <Link to="/" className="a-home">← Back to home</Link>
      </header>

      <div className="a-wrap a-grid">
        <aside className="a-aside">
          <div className="a-eyebrow">Secure access · JWT sessions</div>
          <h1>Welcome back to <em>the drive.</em></h1>
          <p>One login for your entire placement season — applications, tests, feedback and offer letters.</p>
          <ul className="a-perks">
            <li>Track every application on a live status timeline</li>
            <li>Read placement-officer feedback on your profile</li>
            <li>Download your offer letter as a PDF when selected</li>
            <li>Placement officers land straight on the admin console</li>
          </ul>
          <p className="a-quote">"Zero arrears · four companies · one season."</p>
        </aside>

        <div className="a-card">
          <span className="a-stamp">T&amp;P · SECURE LOGIN</span>
          <h2>Student / Officer login</h2>
          <p className="a-sub">Use your registered email. Admin accounts are pre-created by the placement office — there is no admin registration.</p>
          <form onSubmit={submit} noValidate>
            <label>Email <b>*</b></label>
            <input type="email" placeholder="you@aurora.edu" autoComplete="email" value={form.email} onChange={set('email')} required />
            <label style={{ marginTop: '1rem' }}>Password <b>*</b></label>
            <input type="password" placeholder="••••••••" autoComplete="current-password" value={form.password} onChange={set('password')} required />
            {err && <p className="a-error">⚠ {err}</p>}
            <button className="a-btn" disabled={busy}>{busy ? 'Signing in…' : 'Login →'}</button>
          </form>
          <div className="a-links">
            <Link to="/forgot">Forgot password?</Link>
            <Link to="/register">New student? Register →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}