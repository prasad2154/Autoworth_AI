import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(10, 10, 15)', color: 'rgb(240, 240, 250)', fontFamily: 'Inter, sans-serif', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1] 
        }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(10,10,15,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} 
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.15, 0.05] 
        }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ position: 'absolute', bottom: '20%', right: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, rgba(10,10,15,0) 70%)', filter: 'blur(50px)', zIndex: 0 }} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', zIndex: 1, maxWidth: '500px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(99, 102, 241)' }}>
            <AlertCircle size={40} />
          </div>
        </div>
        
        <h1 className="gradient-text" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '120px', fontWeight: 800, lineHeight: 1, margin: '0 0 16px 0', background: 'linear-gradient(135deg, rgb(240,240,250) 0%, rgb(99,102,241) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          404
        </h1>
        
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>Page not found</h2>
        
        <p style={{ color: 'rgb(140, 140, 170)', fontSize: '16px', lineHeight: 1.6, marginBottom: '40px' }}>
          Oops! The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        
        <Link 
          to="/" 
          className="btn-primary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', backgroundColor: 'rgb(99, 102, 241)', color: 'white', textDecoration: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}
        >
          <Home size={20} /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
