import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function StudentDashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/student/dashboard').then(r => setD(r.data)); }, []);
  if (!d) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Student Dashboard</h1>
      <div className="grid cols-3">
        <div className="card stat"><b>{d.applicationsUsed}/{d.maxApplications}</b>Applications used</div>
        <div className="card stat"><b>{d.completeness}%</b>Profile completeness
          <div className="meter"><i style={{ width: `${d.completeness}%` }} /></div>
        </div>
        <div className="card stat"><b>{d.isVerified ? '✓' : '…'}</b>{d.isVerified ? 'Profile verified by T&P' : 'Verification pending'}</div>
      </div>
      <h2>Latest feedback</h2>
      <div className="card">
        {d.latestFeedback
          ? <><span className={`badge ${d.latestFeedback.status}`}>{d.latestFeedback.status}</span> <b>{d.latestFeedback.company}</b><p style={{ marginTop: 8 }}>{d.latestFeedback.feedback}</p></>
          : <p className="muted">No feedback yet. The placement officer's comments will appear here.</p>}
      </div>
    </>
  );
}