import { useEffect, useState } from 'react';
import api from '../api/axios';

const blankQ = () => ({ text: '', options: ['', '', '', ''], correctIndex: 0 });

export default function ManageTests() {
  const [tests, setTests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ companyId: '', title: '', durationMins: 15, startAt: '', endAt: '', questions: [blankQ()] });
  const [msg, setMsg] = useState('');

  const load = () => api.get('/admin/tests').then(r => setTests(r.data));
  useEffect(() => { load(); api.get('/admin/companies').then(r => setCompanies(r.data)); }, []);

  const setQ = (qi, patch) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, ...patch } : q) }));
  const setOpt = (qi, oi, val) => setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q) }));

  const save = async e => {
    e.preventDefault(); setMsg('');
    try {
      await api.post('/admin/tests', form);
      setForm({ companyId: '', title: '', durationMins: 15, startAt: '', endAt: '', questions: [blankQ()] });
      load(); setMsg('Test created');
    } catch (err) { setMsg(err.response?.data?.message || 'Create failed'); }
  };

  return (
    <>
      <h1>Manage Tests</h1>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Create MCQ test</h2>
        <form onSubmit={save}>
          <div className="row">
            <div><label>Company</label>
              <select value={form.companyId} onChange={e => setForm({ ...form, companyId: e.target.value })} required>
                <option value="">Select…</option>{companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div><label>Duration (mins)</label><input type="number" min="1" value={form.durationMins} onChange={e => setForm({ ...form, durationMins: +e.target.value })} required /></div>
            <div><label>Opens at</label><input type="datetime-local" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} required /></div>
            <div><label>Closes at</label><input type="datetime-local" value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} required /></div>
          </div>
          {form.questions.map((q, qi) => (
            <div className="card" key={qi} style={{ background: 'var(--paper)' }}>
              <label>Question {qi + 1}</label>
              <input value={q.text} onChange={e => setQ(qi, { text: e.target.value })} placeholder="Question text" required />
              {q.options.map((op, oi) => (
                <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi} onChange={() => setQ(qi, { correctIndex: oi })} title="Mark correct" />
                  <input value={op} onChange={e => setOpt(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} required />
                </div>
              ))}
            </div>
          ))}
          <button type="button" className="btn small" onClick={() => setForm({ ...form, questions: [...form.questions, blankQ()] })}>+ Add question</button>
          {msg && <p className={msg === 'Test created' ? 'ok' : 'error'}>{msg}</p>}
          <button className="btn dark" style={{ display: 'block', width: '100%' }}>Create test</button>
        </form>
      </div>
      <table>
        <thead><tr><th>Title</th><th>Company</th><th>Duration</th><th>Window</th><th>Questions</th><th></th></tr></thead>
        <tbody>
          {tests.map(t => (
            <tr key={t._id}>
              <td><b>{t.title}</b></td><td>{t.companyId?.name}</td><td>{t.durationMins} min</td>
              <td>{new Date(t.startAt).toLocaleString()} → {new Date(t.endAt).toLocaleString()}</td>
              <td>{t.questions.length}</td>
              <td><button className="btn small ghost" style={{ color: 'var(--red)' }} onClick={() => { api.delete(`/admin/tests/${t._id}`).then(load); }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}