import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Mail, ArrowLeft, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // @ts-ignore
      await authApi.forgotPassword(email);
      setIsSuccess(true);
      toast.success('Password reset instructions sent');
    } catch (error) {
      toast.error('Failed to send reset instructions');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(10, 10, 15)', color: 'rgb(240, 240, 250)', fontFamily: 'Inter, sans-serif', padding: '24px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.4 }}
        className="card"
        style={{ width: '100%', maxWidth: '440px', backgroundColor: 'rgb(16, 16, 24)', borderRadius: '24px', padding: '40px', border: '1px solid rgb(40, 40, 60)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(99, 102, 241)' }}>
              <Car size={24} />
            </div>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              AutoWorth <span className="gradient-text" style={{ color: 'rgb(99, 102, 241)' }}>AI</span>
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Reset Your Password</h1>
          <p style={{ color: 'rgb(140, 140, 170)', fontSize: '14px' }}>Enter your email and we'll send you instructions to reset your password.</p>
        </div>

        {isSuccess ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '24px', backgroundColor: 'rgba(52, 211, 153, 0.1)', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.2)', marginBottom: '32px' }}>
            <p style={{ color: 'rgb(52, 211, 153)', fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>Check your email for the reset link.</p>
            <p style={{ color: 'rgb(140, 140, 170)', fontSize: '13px' }}>If you don't see it, check your spam folder.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            <div>
              <label className="input-label" style={{ display: 'block', fontSize: '14px', color: 'rgb(140, 140, 170)', marginBottom: '8px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="rgb(140, 140, 170)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                  className="input-field" 
                  style={{ width: '100%', backgroundColor: 'rgb(22, 22, 34)', border: '1px solid rgb(40, 40, 60)', borderRadius: '12px', padding: '14px 14px 14px 44px', color: 'white', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} 
                  required 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary" 
              style={{ width: '100%', padding: '14px', backgroundColor: 'rgb(99, 102, 241)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'background-color 0.2s', marginTop: '8px' }}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'rgb(140, 140, 170)', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'rgb(240, 240, 250)'} onMouseOut={(e) => e.currentTarget.style.color = 'rgb(140, 140, 170)'}>
            <ArrowLeft size={16} /> Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
