import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, LayoutDashboard, History, Bookmark, Bell,
  TrendingUp, BarChart2, User, Settings, LogOut,
  Menu, X, ChevronDown, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/valuation', label: 'Value Car', icon: Car },
  { to: '/market', label: 'Market', icon: TrendingUp },
  { to: '/compare', label: 'Compare', icon: BarChart2 },
  { to: '/history', label: 'History', icon: History },
  { to: '/saved-cars', label: 'Saved', icon: Bookmark },
  { to: '/alerts', label: 'Alerts', icon: Bell },
];

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgb(10 10 15 / 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgb(40 40 60 / 0.5)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Car size={18} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: 'rgb(240 240 250)', letterSpacing: '-0.02em' }}>
                AutoWorth<span style={{ color: 'rgb(129 140 248)' }}> AI</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                style={{ color: 'rgb(251 191 36)' }}>
                <Shield size={14} style={{ display: 'inline', marginRight: 4 }} />
                Admin
              </NavLink>
            )}
          </nav>

          {/* Profile dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/valuation" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
              Value My Car
            </Link>

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)',
                borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                color: 'rgb(240 240 250)',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'white',
              }}>
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name?.split(' ')[0]}
              </span>
              <ChevronDown size={14} color="rgb(140 140 170)" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: '110%', right: 0,
                    background: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)',
                    borderRadius: 12, padding: 8, minWidth: 200,
                    boxShadow: '0 20px 60px rgb(0 0 0 / 0.5)',
                    zIndex: 100,
                  }}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgb(40 40 60)', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgb(240 240 250)' }}>{user?.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgb(100 100 130)' }}>{user?.email}</div>
                  </div>
                  {[
                    { to: '/profile', label: 'Profile', icon: User },
                    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  ].map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 8, textDecoration: 'none',
                        color: 'rgb(180 180 210)', fontSize: '0.875rem', fontWeight: 500,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgb(40 40 60 / 0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '8px 12px', borderRadius: 8, border: 'none',
                      background: 'transparent', color: 'rgb(248 113 113)',
                      fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                      marginTop: 4, borderTop: '1px solid rgb(40 40 60)',
                      paddingTop: 12,
                    }}
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-ghost mobile-only"
              style={{ padding: 8 }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid rgb(40 40 60 / 0.5)' }}
          >
            <div style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
      `}</style>
    </header>
  );
}

export default Navbar;

