import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;
    
    switch (score) {
      case 0:
      case 1: return { label: 'Weak', color: 'rgb(248 113 113)', width: '25%' };
      case 2: return { label: 'Fair', color: 'rgb(251 146 60)', width: '50%' };
      case 3: return { label: 'Strong', color: 'rgb(52 211 153)', width: '75%' };
      case 4: return { label: 'Very Strong', color: 'rgb(52 211 153)', width: '100%' };
      default: return { label: '', color: 'transparent', width: '0%' };
    }
  };

  const strength = password ? getPasswordStrength(password) : { label: '', color: 'transparent', width: '0%' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.register({ full_name: name, email, password, confirm_password: confirmPassword });
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'rgb(10 10 15)' }}>
      {/* Left Panel - Illustration */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', backgroundColor: 'rgb(16 16 24)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(10, 10, 15, 0.8) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '4rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'auto' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%)' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Manrope', color: 'rgb(240 240 250)' }}>AutoWorth AI</span>
          </div>
          
          <div style={{ marginTop: 'auto', marginBottom: '4rem' }}>
             <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(22, 22, 34, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgb(40 40 60)', maxWidth: '400px', marginBottom: '2rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(52, 211, 153, 0.1)' }}>
                  <ShieldCheck style={{ color: 'rgb(52 211 153)' }} />
                </div>
                <div>
                  <div style={{ color: 'rgb(240 240 250)', fontWeight: 600, fontFamily: 'Manrope' }}>Enterprise Grade</div>
                  <div style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>Secure & reliable AI models</div>
                </div>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Manrope', color: 'rgb(240 240 250)', lineHeight: 1.2, marginBottom: '1rem' }}
            >
              Start Valuing<br />Smarter.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ color: 'rgb(140 140 170)', fontSize: '1.125rem', maxWidth: '400px' }}
            >
              Join thousands of dealerships and professionals using AutoWorth AI today.
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
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Manrope', color: 'rgb(240 240 250)', marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ color: 'rgb(140 140 170)' }}>Get started with AutoWorth AI</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="input-label" style={{ display: 'block', color: 'rgb(140 140 170)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgb(80 80 110)', width: '18px', height: '18px' }} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: 'rgb(240 240 250)', outline: 'none' }}
                  placeholder="John Doe"
                />
              </div>
            </div>

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
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgb(80 80 110)', width: '18px', height: '18px' }} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem 2.75rem', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: 'rgb(240 240 250)', outline: 'none' }}
                  placeholder="Create a strong password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(80 80 110)', display: 'flex' }}
                >
                  {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
              {password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <div style={{ flex: 1, height: '4px', backgroundColor: 'rgb(40 40 60)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: strength.width, height: '100%', backgroundColor: strength.color, transition: 'all 0.3s ease' }} />
                  </div>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="input-label" style={{ display: 'block', color: 'rgb(140 140 170)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgb(80 80 110)', width: '18px', height: '18px' }} />
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: 'rgb(240 240 250)', outline: 'none' }}
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div style={{ fontSize: '0.875rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', color: 'rgb(140 140 170)', lineHeight: 1.4 }}>
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ accentColor: 'rgb(99 102 241)', marginTop: '0.25rem' }} 
                  required
                />
                <span>I agree to the <Link to="/terms" style={{ color: 'rgb(99 102 241)', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'rgb(99 102 241)', textDecoration: 'none' }}>Privacy Policy</Link></span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', backgroundColor: 'rgb(99 102 241)', color: 'white', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <ArrowRight style={{ width: '18px', height: '18px' }} />}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'rgb(99 102 241)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
