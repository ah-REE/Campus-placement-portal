import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles-auth.css';

export default function Reset() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [msg, setMsg] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return setMsg('Passwords do not match');
    try {
      await api.post(`/auth/reset/${token}`, { password: form.password });
      navigate('/login');
    } catch (err) { setMsg(err.response?.data?.message || 'Reset failed'); }
  };

  return (
    <div className="auth">
      <header className="a-top">
        <Link to="/" className="a-brand"><b>A</b><span>Aurora Institute<small>Training &amp; Placement Cell</small></span></Link>
        <Link to="/" className="a-home">← Back to home</Link>
      </header>
      <div className="a-wrap a-grid solo">
        <div className="a-card">
          <span className="a-stamp">SET NEW PASSWORD</span>
          <h2>Choose a new password</h2>
          <p className="a-sub">Min 8 characters with uppercase, lowercase, number and special character.</p>
          <form onSubmit={submit}>
            <label>New password <b>*</b></label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <label style={{ marginTop: '1rem' }}>Confirm password <b>*</b></label>
            <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            {msg && <p className="a-error">⚠ {msg}</p>}
            <button className="a-btn">Update password →</button>
          </form>
          <div className="a-links"><Link to="/login">← Back to login</Link></div>
        </div>
      </div>
    </div>
  );
}