import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  useEffect(() => { api.get('/student/events').then(r => setEvents(r.data)); }, []);
  return (
    <>
      <h1>Placement Calendar</h1>
      <table>
        <thead><tr><th>Date</th><th>Event</th><th>Type</th></tr></thead>
        <tbody>
          {events.map(e => (
            <tr key={e._id}><td>{new Date(e.date).toLocaleDateString()}</td><td><b>{e.title}</b></td><td><span className="badge Applied">{e.type}</span></td></tr>
          ))}
          {!events.length && <tr><td colSpan={3} className="muted">No events scheduled.</td></tr>}
        </tbody>
      </table>
    </>
  );
}