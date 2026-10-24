import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
