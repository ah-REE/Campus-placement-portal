import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [apps, setApps] = useState([]);
  const [compare, setCompare] = useState([]);
  const [msg, setMsg] = useState('');

  const load = () => Promise.all([api.get('/student/companies'), api.get('/student/applications')])
    .then(([c, a]) => { setCompanies(c.data); setApps(a.data); });
  useEffect(() => { load(); }, []);

  const appliedIds = apps.map(a => a.companyId?._id || a.companyId);
  const canApply = apps.length < 4;

  const apply = async id => {
    setMsg('');
    try { await api.post('/student/applications', { companyId: id }); await load(); setMsg('Applied successfully'); }
    catch (e) { setMsg(e.response?.data?.message || 'Could not apply'); }
  };
  const bookmark = async id => { await api.post(`/student/companies/${id}/bookmark`); load(); };
  const toggleCompare = id => setCompare(c => c.includes(id) ? c.filter(x => x !== id) : (c.length >= 3 ? c : [...c, id]));

  const compared = companies.filter(c => compare.includes(c._id));

  return (
    <>
      <h1>Companies ({companies.length} active)</h1>
      <p className="muted">Apply to a maximum of 4 · {apps.length}/4 used · Compare up to 3 · ★ = watchlist</p>
      {msg && <p className="ok">{msg}</p>}
      <div className="grid cols-3">
        {companies.map(c => (
          <div className="card" key={c._id}>
            <b>{c.name}</b> <span className="muted">· {c.role}</span>
            <p className="muted">₹{c.package} LPA · {c.location}<br />Min CGPA {c.eligibilityCgpa} · Deadline {new Date(c.deadline).toLocaleDateString()}</p>
            <p style={{ fontSize: '.88rem', marginTop: 6 }}>{c.description}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <button className="btn small dark" disabled={!canApply || appliedIds.includes(c._id)} onClick={() => apply(c._id)}>
                {appliedIds.includes(c._id) ? 'Applied ✓' : 'Apply'}
              </button>
              <button className="btn small" onClick={() => bookmark(c._id)}>{c.bookmarked ? '★ Watchlisted' : '☆ Watchlist'}</button>
              <button className="btn small ghost" style={{ border: '1.5px solid var(--line)' }} onClick={() => toggleCompare(c._id)}>
                {compare.includes(c._id) ? '− Compare' : '+ Compare'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {compared.length >= 2 && (
        <>
          <h2>Comparison</h2>
          <table className="compare-table">
            <thead><tr><th>Field</th>{compared.map(c => <th key={c._id}>{c.name}</th>)}</tr></thead>
            <tbody>
              <tr><td>Role</td>{compared.map(c => <td key={c._id}>{c.role}</td>)}</tr>
              <tr><td>Package</td>{compared.map(c => <td key={c._id}>₹{c.package} LPA</td>)}</tr>
              <tr><td>Location</td>{compared.map(c => <td key={c._id}>{c.location}</td>)}</tr>
              <tr><td>Min CGPA</td>{compared.map(c => <td key={c._id}>{c.eligibilityCgpa}</td>)}</tr>
              <tr><td>Deadline</td>{compared.map(c => <td key={c._id}>{new Date(c.deadline).toLocaleDateString()}</td>)}</tr>
            </tbody>
          </table>
        </>
      )}
    </>
  );
}