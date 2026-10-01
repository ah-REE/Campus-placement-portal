import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { setUser } = useAuth();
  const [s, setS] = useState(null);
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');
  const [ai, setAi] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setS(data.user); setAi(data.user.lastAiFeedback || null);
      setForm({
        phone: data.user.phone, address: data.user.address, cgpa: data.user.cgpa,
        tenthMarks: data.user.tenthMarks, twelfthMarks: data.user.twelfthMarks,
        internshipsCompleted: data.user.internshipsCompleted,
        skills: (data.user.skills || []).join(', '), resumeText: data.user.resumeText
      });
    });
  }, []);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const save = async e => {
    e.preventDefault(); setMsg('');
    try {
      const { data } = await api.put('/student/profile', { ...form, skills: form.skills.split(',').map(x => x.trim()).filter(Boolean) });
      setMsg('Profile updated'); setUser(data.user); setS(data.user);
    } catch (err) { setMsg(err.response?.data?.message || 'Update failed'); }
  };

  const askAi = async () => {
    setBusy(true);
    const { data } = await api.post('/student/ai-feedback');
    setAi(data); setBusy(false);
  };

  if (!s || !form) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>My Profile {s.isVerified && <span className="badge Selected">✓ Verified</span>}</h1>
      <p className="muted">{s.registerId} · {s.department} · Year {s.year} · {s.email}</p>
      <div className="card">
        <form onSubmit={save}>
          <div className="row">
            <div><label>Phone</label><input value={form.phone} onChange={set('phone')} /></div>
            <div><label>CGPA</label><input type="number" step="0.01" value={form.cgpa} onChange={set('cgpa')} /></div>
            <div><label>10th %</label><input type="number" step="0.01" value={form.tenthMarks} onChange={set('tenthMarks')} /></div>
            <div><label>12th %</label><input type="number" step="0.01" value={form.twelfthMarks} onChange={set('twelfthMarks')} /></div>
            <div><label>Internships</label><input type="number" value={form.internshipsCompleted} onChange={set('internshipsCompleted')} /></div>
          </div>
          <label>Address</label><textarea rows={2} value={form.address} onChange={set('address')} />
          <label>Skills (comma separated)</label><input value={form.skills} onChange={set('skills')} />
          <label>Resume text</label><textarea rows={6} value={form.resumeText} onChange={set('resumeText')} />
          {msg && <p className={msg.includes('updated') ? 'ok' : 'error'}>{msg}</p>}
          <button className="btn dark">Save changes</button>
        </form>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>AI resume feedback</h2>
        <button className="btn" onClick={askAi} disabled={busy}>{busy ? 'Analysing…' : 'Request AI feedback'}</button>
        {ai && <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12, fontFamily: 'inherit' }}>{ai.feedback}</pre>}
      </div>
    </>
  );
}