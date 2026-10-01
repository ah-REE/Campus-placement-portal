import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY = { name: '', role: '', package: '', location: '', eligibilityCgpa: '', description: '', deadline: '', isActive: true };

export default function ManageCompanies() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const load = () => api.get('/admin/companies').then(r => setList(r.data));
  useEffect(() => { load(); }, []);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const save = async e => {
    e.preventDefault(); setMsg('');
    try {
      if (editId) await api.put(`/admin/companies/${editId}`, form);
      else await api.post('/admin/companies', form);
      setForm(EMPTY); setEditId(null); load();
      setMsg('Saved');
    } catch (err) { setMsg(err.response?.data?.message || 'Save failed'); }
  };

  const deactivate = async id => { await api.delete(`/admin/companies/${id}`); load(); };

  return (
    <>
      <h1>Manage Companies</h1>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{editId ? 'Edit company' : 'Add company'}</h2>
        <form onSubmit={save}>
          <div className="row">
            <div><label>Name</label><input value={form.name} onChange={set('name')} required /></div>
            <div><label>Role</label><input value={form.role} onChange={set('role')} required /></div>
            <div><label>Package (LPA)</label><input type="number" step="0.01" value={form.package} onChange={set('package')} required /></div>
            <div><label>Location</label><input value={form.location} onChange={set('location')} required /></div>
            <div><label>Eligibility CGPA</label><input type="number" step="0.1" value={form.eligibilityCgpa} onChange={set('eligibilityCgpa')} required /></div>
            <div><label>Deadline</label><input type="date" value={form.deadline} onChange={set('deadline')} required /></div>
          </div>
          <label>Description</label><textarea rows={2} value={form.description} onChange={set('description')} />
          {msg && <p className={msg === 'Saved' ? 'ok' : 'error'}>{msg}</p>}
          <button className="btn dark">{editId ? 'Update' : 'Add company'}</button>
          {editId && <button type="button" className="btn ghost" style={{ color: 'var(--ink)' }} onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
        </form>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Role</th><th>Package</th><th>CGPA</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {list.map(c => (
            <tr key={c._id}>
              <td><b>{c.name}</b></td><td>{c.role}</td><td>₹{c.package}</td><td>{c.eligibilityCgpa}</td>
              <td>{new Date(c.deadline).toLocaleDateString()}</td>
              <td>{c.isActive ? <span className="badge Selected">Active</span> : <span className="badge Rejected">Inactive</span>}</td>
              <td>
                <button className="btn small" onClick={() => { setEditId(c._id); setForm({ ...c, deadline: String(c.deadline).slice(0, 10) }); }}>Edit</button>{' '}
                {c.isActive && <button className="btn small ghost" style={{ color: 'var(--red)' }} onClick={() => deactivate(c._id)}>Deactivate</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}