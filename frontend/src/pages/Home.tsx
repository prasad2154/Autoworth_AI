import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Icons for features and steps
const CarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const LineChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Simplified Nav for unauthenticated users
const LandingNav = () => (
  <nav style={{ 
    padding: '1.5rem 2rem', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    background: 'rgba(10, 10, 15, 0.8)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    borderBottom: '1px solid rgb(40 40 60)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ 
        width: '2.5rem', 
        height: '2.5rem', 
        borderRadius: '0.5rem', 
        background: 'rgb(99 102 241)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>A</span>
      </div>
      <span style={{ color: 'rgb(240 240 250)', fontWeight: 'bold', fontSize: '1.25rem' }}>AutoWorth AI</span>
    </div>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Link to="/login" style={{ color: 'rgb(240 240 250)', textDecoration: 'none', fontWeight: 500 }}>Log In</Link>
      <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Sign Up</Link>
    </div>
  </nav>
);

export default function Home() {
  const { isAuthenticated } = useAuth();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div style={{ background: 'rgb(10 10 15)', minHeight: '100vh', color: 'rgb(240 240 250)', fontFamily: 'Inter, sans-serif' }}>
      {isAuthenticated ? <Navbar /> : <LandingNav />}

      <main style={{ overflowX: 'hidden' }}>
        {/* Hero Section */}
        <section style={{ 
          padding: '6rem 2rem 8rem', 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center' 
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(10,10,15,0) 70%)',
            zIndex: 0,
            pointerEvents: 'none'
          }} />

          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerChildren}
            style={{ maxWidth: '800px', zIndex: 1, position: 'relative' }}
          >
            <motion.h1 variants={fadeIn} style={{ 
              fontSize: '4.5rem', 
              fontWeight: 800, 
              lineHeight: 1.1, 
              fontFamily: 'Manrope, sans-serif',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}>
              <span className="gradient-text">Know</span> What Your Car Is Worth.
            </motion.h1>
            
            <motion.p variants={fadeIn} style={{ 
              fontSize: '1.25rem', 
              color: 'rgb(140 140 170)', 
              marginBottom: '3rem',
              maxWidth: '600px',
              marginInline: 'auto',
              lineHeight: 1.6
            }}>
              AI-powered vehicle valuation, market intelligence and smarter resale decisions.
            </motion.p>

            <motion.div variants={fadeIn} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to={isAuthenticated ? "/valuation" : "/register"} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                Value My Car →
              </Link>
              <Link to={isAuthenticated ? "/market" : "/login"} className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                Explore Market →
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Stats Cards */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', height: '300px', marginTop: '4rem', zIndex: 1 }}>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [0, -10, 0], opacity: 1 }}
              transition={{ delay: 0.5, duration: 4, repeat: Infinity, repeatType: "reverse" }}
              className="card"
              style={{ position: 'absolute', top: '20px', left: '10%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <span style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>Estimated Value</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>₹6.25L</span>
              <span className="badge-success" style={{ alignSelf: 'flex-start' }}>+2.4% this month</span>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [0, 15, 0], opacity: 1 }}
              transition={{ delay: 0.7, duration: 5, repeat: Infinity, repeatType: "reverse" }}
              className="card"
              style={{ position: 'absolute', top: '100px', right: '10%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <span style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>Confidence Score</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: 'rgb(52 211 153)' }}>87%</span>
              <div className="progress-bar" style={{ width: '100px', marginTop: '0.5rem' }}>
                <div style={{ width: '87%', background: 'rgb(52 211 153)', height: '100%' }} />
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [0, -8, 0], opacity: 1 }}
              transition={{ delay: 0.9, duration: 4.5, repeat: Infinity, repeatType: "reverse" }}
              className="card"
              style={{ position: 'absolute', bottom: '0', left: '30%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <span style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>Condition Rating</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>82/100</span>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [0, 12, 0], opacity: 1 }}
              transition={{ delay: 1.1, duration: 5.5, repeat: Infinity, repeatType: "reverse" }}
              className="card"
              style={{ position: 'absolute', bottom: '40px', right: '35%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <span style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>Vs Market Avg</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: 'rgb(248 113 113)' }}>-3.2%</span>
            </motion.div>
          </div>
        </section>

        {/* Stats Row */}
        <section style={{ 
          background: 'rgb(16 16 24)', 
          padding: '4rem 2rem', 
          borderTop: '1px solid rgb(40 40 60)', 
          borderBottom: '1px solid rgb(40 40 60)' 
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { label: 'Valuations', value: '100K+' },
              { label: 'Brands Supported', value: '50+' },
              { label: 'Valuation Accuracy', value: '87%' },
              { label: 'Cities Covered', value: '15+' }
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'rgb(240 240 250)' }}>{stat.value}</span>
                <span style={{ color: 'rgb(140 140 170)', fontWeight: 500 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif', marginBottom: '1rem' }}>Smarter decisions, powered by data</h2>
            <p style={{ color: 'rgb(140 140 170)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>Our proprietary machine learning models analyze millions of data points to give you the edge.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'rgb(99 102 241)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CarIcon />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>AI Precision Valuation</h3>
              <p style={{ color: 'rgb(140 140 170)', lineHeight: 1.6 }}>Get instant, highly accurate vehicle valuations based on real-time market trends, condition analysis, and depreciation curves.</p>
            </div>

            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.1)', color: 'rgb(52 211 153)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LineChartIcon />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>Market Intelligence</h3>
              <p style={{ color: 'rgb(140 140 170)', lineHeight: 1.6 }}>Track historical price trends, forecast future value, and compare similar listings across your region to spot opportunities.</p>
            </div>

            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(248, 113, 113, 0.1)', color: 'rgb(248 113 113)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageIcon />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>Negotiation Assistant</h3>
              <p style={{ color: 'rgb(140 140 170)', lineHeight: 1.6 }}>Arm yourself with data-backed talking points and market comparisons to confidently negotiate the best possible price.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ background: 'rgb(16 16 24)', padding: '8rem 2rem', borderTop: '1px solid rgb(40 40 60)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif', textAlign: 'center', marginBottom: '4rem' }}>How it works</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {[
                { step: '01', title: 'Enter Vehicle Details', desc: 'Provide make, model, year, and key specifications.' },
                { step: '02', title: 'Specify Condition', desc: 'Detail the current state, mileage, and any damages.' },
                { step: '03', title: 'AI Analysis', desc: 'Our model computes the value against current market data.' },
                { step: '04', title: 'Get Insights', desc: 'Receive your detailed valuation report and market trends.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: 'rgb(40 40 60)', fontFamily: 'Manrope, sans-serif' }}>{item.step}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>{item.title}</h3>
                  <p style={{ color: 'rgb(140 140 170)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '8rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif', marginBottom: '1.5rem' }}>Ready to unlock your car's true value?</h2>
          <p style={{ color: 'rgb(140 140 170)', fontSize: '1.125rem', marginBottom: '3rem' }}>Join thousands of users making smarter automotive decisions with AutoWorth AI.</p>
          <Link to={isAuthenticated ? "/valuation" : "/register"} className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
            Get Started Free
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
