import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  ['/dashboard', 'Dashboard'], ['/companies', 'Companies'], ['/applications', 'My Applications'],
  ['/profile', 'Profile'], ['/calendar', 'Calendar']
];
const adminLinks = [
  ['/admin', 'Dashboard'], ['/admin/companies', 'Companies'], ['/admin/applications', 'Applications'],
  ['/admin/tests', 'Tests'], ['/admin/events', 'Events']
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="navbar">
      <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="brand">Placement Portal</Link>
      <div className="nav-links">
        {links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
      </div>
      <div className="nav-user">
        <span className="muted">{user.name} · {user.role}</span>
        <button className="btn ghost" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </div>
    </nav>
  );
}