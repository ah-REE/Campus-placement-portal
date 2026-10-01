import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then(r => setS(r.data)); }, []);
  if (!s) return <p className="muted">Loading…</p>;
  return (
    <>
      <h1>Admin Dashboard</h1>
      <div className="grid cols-3">
        <div className="card stat"><b>{s.students}</b>Registered students</div>
        <div className="card stat"><b>{s.companies}</b>Active companies (max 10)</div>
        <div className="card stat"><b>{s.applications}</b>Total applications</div>
        <div className="card stat"><b>{s.pendingFeedback}</b>Pending feedback</div>
        <div className="card stat"><b>{s.selected}</b>Students selected</div>
      </div>
    </>
  );
}