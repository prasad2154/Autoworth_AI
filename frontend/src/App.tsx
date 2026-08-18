import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Valuation from './pages/Valuation';
import ValuationResult from './pages/ValuationResult';
import History from './pages/History';
import SavedCars from './pages/SavedCars';
import PriceAlerts from './pages/PriceAlerts';
import Market from './pages/Market';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgb(10 10 15)' }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto" style={{ background: 'rgb(99 102 241)' }}>
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div className="skeleton w-32 h-2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected — any authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/valuation" element={<Valuation />} />
        <Route path="/valuation/result" element={<ValuationResult />} />
        <Route path="/history" element={<History />} />
        <Route path="/saved-cars" element={<SavedCars />} />
        <Route path="/alerts" element={<PriceAlerts />} />
        <Route path="/market" element={<Market />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin only */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
