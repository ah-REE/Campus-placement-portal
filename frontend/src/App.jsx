import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import Reset from './pages/Reset';
import StudentDashboard from './pages/StudentDashboard';
import Companies from './pages/Companies';
import MyApplications from './pages/MyApplications';
import ApplicationDetail from './pages/ApplicationDetail';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import TakeTest from './pages/TakeTest';
import AdminDashboard from './pages/AdminDashboard';
import ManageCompanies from './pages/ManageCompanies';
import AllApplications from './pages/AllApplications';
import StudentDetail from './pages/StudentDetail';
import ManageTests from './pages/ManageTests';
import ManageEvents from './pages/ManageEvents';

function Layout() {
  return (<><Navbar /><main className="container"><Outlet /></main></>);
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/reset/:token" element={<Reset />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute role="student"><Companies /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute role="student"><MyApplications /></ProtectedRoute>} />
        <Route path="/applications/:id" element={<ProtectedRoute role="student"><ApplicationDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute role="student"><Calendar /></ProtectedRoute>} />
        <Route path="/test/:id" element={<ProtectedRoute role="student"><TakeTest /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/companies" element={<ProtectedRoute role="admin"><ManageCompanies /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute role="admin"><AllApplications /></ProtectedRoute>} />
        <Route path="/admin/students/:id" element={<ProtectedRoute role="admin"><StudentDetail /></ProtectedRoute>} />
        <Route path="/admin/tests" element={<ProtectedRoute role="admin"><ManageTests /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute role="admin"><ManageEvents /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}