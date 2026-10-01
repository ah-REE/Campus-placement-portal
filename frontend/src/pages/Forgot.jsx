import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles-auth.css';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async e => {
    e.preventDefault();
    const { data } = await api.post('/auth/forgot', { email });
    setMsg(data.message);
  };

  return (
    <div className="auth">
      <header className="a-top">
        <Link to="/" className="a-brand"><b>A</b><span>Aurora Institute<small>Training &amp; Placement Cell</small></span></Link>
        <Link to="/" className="a-home">← Back to home</Link>
      </header>
      <div className="a-wrap a-grid solo">
        <div className="a-card">
          <span className="a-stamp">PASSWORD RECOVERY</span>
          <h2>Forgot your password?</h2>
          <p className="a-sub">Enter your registered email — we'll send a reset link valid for 1 hour.</p>
          <form onSubmit={submit}>
            <label>Registered email <b>*</b></label>
            <input type="email" placeholder="you@aurora.edu" value={email} onChange={e => setEmail(e.target.value)} required />
            <button className="a-btn">Send reset link →</button>
          </form>
          {msg && <p className="a-ok">✓ {msg}</p>}
          <div className="a-links"><Link to="/login">← Back to login</Link></div>
        </div>
      </div>
    </div>
  );
}