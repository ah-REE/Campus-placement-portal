import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function StudentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const load = () => api.get(`/admin/students/${id}`).then(r => setData(r.data));
  useEffect(() => { load(); }, [id]);
  if (!data) return <p className="muted">Loading…</p>;
  const s = data.student;

  return (
    <>
      <h1>{s.name} {s.isVerified && <span className="badge Selected">✓ Verified</span>} {!s.isActive && <span className="badge Rejected">Deactivated</span>}</h1>
      <div className="grid cols-2">
        <div className="card">
          <p className="muted">{s.registerId} · {s.email} · {s.phone}</p>
          <p>{s.department} · Year {s.year} · {s.gender} · DOB {new Date(s.dob).toLocaleDateString()}</p>
          <p>10th {s.tenthMarks}% · 12th {s.twelfthMarks}% · CGPA {s.cgpa} · Arrears {s.standingArrears} · Internships {s.internshipsCompleted}</p>
          <p>{s.address}</p>
          <p className="muted">Skills: {(s.skills || []).join(', ') || '—'}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {!s.isVerified && <button className="btn small dark" onClick={() => { api.put(`/admin/students/${id}/verify`).then(load); }}>Verify profile</button>}
            <button className="btn small" onClick={() => { api.put(`/admin/students/${id}/ban`).then(load); }}>{s.isActive ? 'Deactivate (ban)' : 'Re-activate'}</button>
          </div>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Resume</h2>
          <p style={{ fontSize: '.88rem', whiteSpace: 'pre-wrap' }}>{s.resumeText}</p>
        </div>
      </div>
      <h2>Applications</h2>
      <table>
        <thead><tr><th>Company</th><th>Status</th><th>Score</th><th>Feedback</th></tr></thead>
        <tbody>
          {data.applications.map(a => (
            <tr key={a._id}><td>{a.companyId?.name}</td><td><span className={`badge ${a.status}`}>{a.status}</span></td><td>{a.testScore ?? '—'}</td><td>{a.feedback || '—'}</td></tr>
          ))}
          {!data.applications.length && <tr><td colSpan={4} className="muted">No applications.</td></tr>}
        </tbody>
      </table>
    </>
  );
}