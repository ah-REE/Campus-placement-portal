import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [tests, setTests] = useState([]);
  useEffect(() => {
    api.get('/student/applications').then(r => setApps(r.data));
    api.get('/student/tests').then(r => setTests(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <h1>My Applications ({apps.length}/4)</h1>
      <table>
        <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Test score</th><th>Actions</th></tr></thead>
        <tbody>
          {apps.map(a => {
            const t = tests.find(x => x.company === a.companyId?.name);
            return (
              <tr key={a._id}>
                <td><b>{a.companyId?.name}</b></td>
                <td>{a.companyId?.role}</td>
                <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                <td>{a.testScore ?? '—'}</td>
                <td>
                  <Link className="btn small" to={`/applications/${a._id}`}>View</Link>{' '}
                  {t && t.open && !t.attempted && <Link className="btn small dark" to={`/test/${t._id}`}>Take test</Link>}
                  {t && t.attempted && <span className="muted"> attempted</span>}
                </td>
              </tr>
            );
          })}
          {!apps.length && <tr><td colSpan={5} className="muted">No applications yet — browse companies to apply.</td></tr>}
        </tbody>
      </table>
    </>
  );
}