import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'rgb(10 10 15)' }}>
      {/* Left Panel - Illustration */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', backgroundColor: 'rgb(16 16 24)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(10, 10, 15, 0.8) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '4rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'auto' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%)' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Manrope', color: 'rgb(240 240 250)' }}>AutoWorth AI</span>
          </div>
          
          <div style={{ marginTop: 'auto', marginBottom: '4rem' }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(22, 22, 34, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgb(40 40 60)', maxWidth: '400px', marginBottom: '2rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>Estimated Value</span>
                <span className="badge-success" style={{ color: 'rgb(52 211 153)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(52, 211, 153, 0.1)' }}>+4.2%</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Manrope', color: 'rgb(240 240 250)' }}>₹12.45L</div>
              <div style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Honda City 2021 • 24,000 km</div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Manrope', color: 'rgb(240 240 250)', lineHeight: 1.2, marginBottom: '1rem' }}
            >
              Welcome back to<br />AutoWorth AI.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ color: 'rgb(140 140 170)', fontSize: '1.125rem', maxWidth: '400px' }}
            >
              Experience the future of automotive pricing with our advanced AI models.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card"
          style={{ width: '100%', maxWidth: '440px', padding: '3rem', borderRadius: '24px', backgroundColor: 'rgb(16 16 24)', border: '1px solid rgb(40 40 60)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
        >
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Manrope', color: 'rgb(240 240 250)', marginBottom: '0.5rem' }}>Welcome back</h2>
            <p style={{ color: 'rgb(140 140 170)' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="input-label" style={{ display: 'block', color: 'rgb(140 140 170)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgb(80 80 110)', width: '18px', height: '18px' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: 'rgb(240 240 250)', outline: 'none' }}
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="input-label" style={{ display: 'block', color: 'rgb(140 140 170)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgb(80 80 110)', width: '18px', height: '18px' }} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem 2.75rem', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: 'rgb(240 240 250)', outline: 'none' }}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(80 80 110)', display: 'flex' }}
                >
                  {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'rgb(140 140 170)' }}>
                <input type="checkbox" style={{ accentColor: 'rgb(99 102 241)' }} />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ color: 'rgb(99 102 241)', textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', backgroundColor: 'rgb(99 102 241)', color: 'white', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight style={{ width: '18px', height: '18px' }} />}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'rgb(99 102 241)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
