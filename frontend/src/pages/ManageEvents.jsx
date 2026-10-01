import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', date: '', type: 'Deadline' });
  const load = () => api.get('/admin/events').then(r => setEvents(r.data));
  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault();
    await api.post('/admin/events', form);
    setForm({ title: '', date: '', type: 'Deadline' });
    load();
  };

  return (
    <>
      <h1>Manage Calendar Events</h1>
      <div className="card">
        <form onSubmit={save} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: 2, minWidth: 220 }}><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
          <div style={{ flex: 1, minWidth: 150 }}><label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
          <div style={{ flex: 1, minWidth: 130 }}><label>Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {['Deadline', 'Drive', 'Test', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn dark">Add event</button>
        </form>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Title</th><th>Type</th><th></th></tr></thead>
        <tbody>
          {events.map(e => (
            <tr key={e._id}>
              <td>{new Date(e.date).toLocaleDateString()}</td><td><b>{e.title}</b></td><td>{e.type}</td>
              <td><button className="btn small ghost" style={{ color: 'var(--red)' }} onClick={() => { api.delete(`/admin/events/${e._id}`).then(load); }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}