import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';

import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';

import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Orders from './pages/Orders';
import Screener from './pages/Screener';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-background text-primary">
    <Topbar />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

import Login from './pages/Login';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) return <div className="min-h-screen bg-background text-primary flex items-center justify-center">Loading...</div>;

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#111318', color: '#E8EAF0', border: '1px solid #1E2028' } }} />
      <Router>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/trade" element={<PrivateRoute><Trade /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
            <Route path="/screener" element={<PrivateRoute><Screener /></PrivateRoute>} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </>
  );
}

export default App;
