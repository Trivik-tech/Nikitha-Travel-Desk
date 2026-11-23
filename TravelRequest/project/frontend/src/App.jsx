import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught runtime error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center font-black text-2xl">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              A temporary display error was intercepted. Click below to reload.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl text-left text-[11px] font-mono text-rose-600 overflow-auto max-h-32 border border-slate-200">
              {this.state.error?.message || 'Unknown error'}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => window.location.reload()} 
                className="px-5 py-2.5 rounded-xl bg-[#6541e9] text-white text-xs font-bold shadow-md hover:bg-[#5332ce] transition-all"
              >
                Reload Page
              </button>
              <button 
                onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }} 
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (user?.accessToken) {
    if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'ROLE_MANAGER') return <Navigate to="/manager" replace />;
    return <Navigate to="/employee" replace />;
  }
  return children;
};

const DashboardRedirect = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ROLE_EMPLOYEE') return <Navigate to="/employee" replace />;
  if (user.role === 'ROLE_MANAGER') return <Navigate to="/manager" replace />;
  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(p => location.pathname.startsWith(p));
  const isManagerDashboard = user?.role?.toUpperCase() === 'ROLE_MANAGER' || location.pathname.toLowerCase().includes('manager');
  const isDashboard = ['/admin', '/manager', '/employee', '/reports'].some(p => location.pathname.startsWith(p));
  const isTwilightTheme = isDashboard;
  const isFullBleed = isAuthPage || isDashboard;

  // Prevent browser back button from leaving dashboards or logging out
  useEffect(() => {
    if (!user?.accessToken) return;

    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // Keep user on the current dashboard view if browser back button is clicked
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user?.accessToken, location.pathname]);

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex flex-col ${isTwilightTheme ? 'bg-[#2a1e80]' : 'bg-[#eaecf2]'}`}>
      {!isAuthPage && <Navbar />}
      <main className="flex-grow flex flex-col">
        <div className={isFullBleed ? 'flex-grow flex flex-col' : 'container mx-auto px-4 py-8'}>
          <Routes>
            <Route path="/" element={<DashboardRedirect />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
            <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

            <Route path="/employee/*" element={
              <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_ADMIN']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />

            <Route path="/manager/*" element={
              <ProtectedRoute allowedRoles={['ROLE_MANAGER', 'ROLE_ADMIN']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE']}>
                <Reports />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </main>
      
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(99,102,241,0.25)',
              padding: '20px 32px',
              fontSize: '14px',
              fontWeight: '800',
              border: '1px solid #f1f5f9'
            }
          }} 
        />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
