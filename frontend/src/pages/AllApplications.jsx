import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STATUSES = ['Applied', 'Shortlisted', 'Selected', 'Rejected'];

export default function AllApplications() {
  const [apps, setApps] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [fStudent, setFStudent] = useState('');
  const [fCompany, setFCompany] = useState('');
  const [open, setOpen] = useState(null);
  const [draft, setDraft] = useState({ status: '', feedback: '' });

  const load = async () => {
    const params = {};
    if (fCompany) params.companyId = fCompany;
    const { data } = await api.get('/admin/applications', { params });
    setApps(data.filter(a => !fStudent || `${a.studentId?.name} ${a.studentId?.registerId} ${a.studentId?.email}`.toLowerCase().includes(fStudent.toLowerCase())));
  };
  useEffect(() => { load(); api.get('/admin/companies').then(r => setCompanies(r.data)); }, [fCompany]);

  const save = async id => {
    await api.put(`/admin/applications/${id}`, draft);
    setOpen(null); load();
  };

  return (
    <>
      <h1>All Applications</h1>
      <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
        <div style={{ flex: 1, minWidth: 200 }}><label>Filter by student</label><input value={fStudent} onChange={e => { setFStudent(e.target.value); setTimeout(load, 0); }} placeholder="name / register ID / email" /></div>
        <div style={{ flex: 1, minWidth: 200 }}><label>Filter by company</label>
          <select value={fCompany} onChange={e => setFCompany(e.target.value)}>
            <option value="">All companies</option>
            {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <table>
        <thead><tr><th>Student</th><th>Company</th><th>Status</th><th>Score</th><th>Actions</th></tr></thead>
        <tbody>
          {apps.map(a => (
            <>
              <tr key={a._id}>
                <td><Link to={`/admin/students/${a.studentId?._id}`}><b>{a.studentId?.name}</b></Link><br /><span className="muted">{a.studentId?.registerId}</span></td>
                <td>{a.companyId?.name}</td>
                <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                <td>{a.testScore ?? '—'}</td>
                <td><button className="btn small" onClick={() => { setOpen(open === a._id ? null : a._id); setDraft({ status: a.status, feedback: a.feedback }); }}>Feedback / status</button></td>
              </tr>
              {open === a._id && (
                <tr key={a._id + '-edit'}>
                  <td colSpan={5}>
                    <label>Status</label>
                    <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <label>Feedback to student</label>
                    <textarea rows={3} value={draft.feedback} onChange={e => setDraft({ ...draft, feedback: e.target.value })} />
                    <button className="btn dark small" onClick={() => save(a._id)}>Save & notify student</button>
                  </td>
                </tr>
              )}
            </>
          ))}
          {!apps.length && <tr><td colSpan={5} className="muted">No applications match the filters.</td></tr>}
        </tbody>
      </table>
    </>
  );
}