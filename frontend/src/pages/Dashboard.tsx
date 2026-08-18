import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Bookmark, Bell, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { predictionApi } from '../api/prediction';
import { savedCarsApi, alertsApi } from '../api/market';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalValuations: 0,
    savedCars: 0,
    activeAlerts: 0,
    avgValue: 0
  });
  const [recentValuations, setRecentValuations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, these would be actual API calls that resolve correctly.
        // Handling possible empty/mock data for the UI
        const [historyRes, savedRes, alertsRes] = await Promise.all([
          predictionApi.getHistory().catch(() => ({ items: [], data: [], total: 0, page: 1, page_size: 10, pages: 1 })),
          savedCarsApi.getSavedCars().catch(() => []),
          alertsApi.getAlerts().catch(() => [])
        ]);
        
        const history = (historyRes as any).items || (historyRes as any).data || (Array.isArray(historyRes) ? historyRes : []);
        const saved = Array.isArray(savedRes) ? savedRes : ((savedRes as any)?.data || []);
        const alerts = Array.isArray(alertsRes) ? alertsRes : ((alertsRes as any)?.data || []);
        
        setRecentValuations(history.slice(0, 5));
        
        const avg = history.length > 0 
          ? history.reduce((acc: number, curr: any) => acc + (curr.predicted_price || 0), 0) / history.length 
          : 0;

        setStats({
          totalValuations: history.length,
          savedCars: saved.length,
          activeAlerts: alerts.length,
          avgValue: avg
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatPrice = (price: number) => {
    if (!price) return '₹0.00L';
    return `₹${(price / 100000).toFixed(2)}L`;
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const userName = user?.full_name ? user.full_name.split(' ')[0] : 'User';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'rgb(10, 10, 15)' }}>
      <Navbar />
      
      <main style={{ flex: 1, paddingTop: '100px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '40px' }}
          >
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 700, color: 'rgb(240, 240, 250)', margin: '0 0 8px 0' }}>
              Welcome back, <span className="gradient-text">{userName}</span>!
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgb(140, 140, 170)', margin: 0 }}>
              {currentDate}
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              {[
                { label: 'Total Valuations', value: stats.totalValuations, icon: <TrendingUp size={24} color="rgb(99, 102, 241)" />, color: 'rgb(99, 102, 241)' },
                { label: 'Saved Cars', value: stats.savedCars, icon: <Bookmark size={24} color="rgb(52, 211, 153)" />, color: 'rgb(52, 211, 153)' },
                { label: 'Active Alerts', value: stats.activeAlerts, icon: <Bell size={24} color="rgb(251, 146, 60)" />, color: 'rgb(251, 146, 60)' },
                { label: 'Avg Est. Value', value: formatPrice(stats.avgValue), icon: <Car size={24} color="rgb(240, 240, 250)" />, color: 'rgb(240, 240, 250)' }
              ].map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants} className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '24px', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: `rgba(${stat.color === 'rgb(99, 102, 241)' ? '99,102,241' : stat.color === 'rgb(52, 211, 153)' ? '52,211,153' : stat.color === 'rgb(251, 146, 60)' ? '251,146,60' : '240,240,250'}, 0.1)` }}>
                    {stat.icon}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgb(140, 140, 170)', margin: '0 0 4px 0' }}>{stat.label}</p>
                    {loading ? (
                      <div className="skeleton" style={{ height: '28px', width: '80px', borderRadius: '4px' }}></div>
                    ) : (
                      <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 700, color: 'rgb(240, 240, 250)', margin: 0 }}>{stat.value}</h3>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions & Recent Valuations Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '40px', alignItems: 'start' }}>
              
              {/* Quick Actions */}
              <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 600, color: 'rgb(240, 240, 250)', margin: '0 0 8px 0' }}>Quick Actions</h2>
                <Link to="/valuation" style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ backgroundColor: 'rgb(99, 102, 241)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Car size={28} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 600 }}>Value a New Car</span>
                    </div>
                    <ArrowRight size={20} />
                  </div>
                </Link>
                
                <Link to="/market" style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', border: '1px solid rgb(40, 40, 60)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <TrendingUp size={28} color="rgb(52, 211, 153)" />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 500, color: 'rgb(240, 240, 250)' }}>View Market</span>
                    </div>
                    <ArrowRight size={20} color="rgb(140, 140, 170)" />
                  </div>
                </Link>

                <Link to="/compare" style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', border: '1px solid rgb(40, 40, 60)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Sparkles size={28} color="rgb(251, 146, 60)" />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 500, color: 'rgb(240, 240, 250)' }}>Compare Cars</span>
                    </div>
                    <ArrowRight size={20} color="rgb(140, 140, 170)" />
                  </div>
                </Link>
              </motion.div>

              {/* Recent Valuations */}
              <motion.div variants={itemVariants} className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', border: '1px solid rgb(40, 40, 60)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 600, color: 'rgb(240, 240, 250)', margin: 0 }}>Recent Valuations</h2>
                  {recentValuations.length > 0 && (
                    <Link to="/history" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgb(99, 102, 241)', textDecoration: 'none', fontWeight: 500 }}>View All</Link>
                  )}
                </div>

                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '12px', width: '100%' }}></div>
                    ))}
                  </div>
                ) : recentValuations.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {recentValuations.map((item, idx) => (
                      <div key={idx} style={{ padding: '16px', backgroundColor: 'rgb(22, 22, 34)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgb(40, 40, 60)' }}>
                        <div>
                          <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: 'rgb(240, 240, 250)', margin: '0 0 4px 0' }}>
                            {item.year} {item.brand} {item.model}
                          </h4>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgb(140, 140, 170)', margin: 0 }}>
                            {new Date(item.created_at || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 700, color: 'rgb(99, 102, 241)', margin: '0 0 4px 0' }}>
                            {formatPrice(item.predicted_price)}
                          </p>
                          {item.deal_score ? (
                            <span className="badge-success" style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: 'rgb(52, 211, 153)' }}>
                              Great Deal
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Car size={48} color="rgb(80, 80, 110)" style={{ margin: '0 auto 16px', display: 'block' }} />
                    <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgb(140, 140, 170)', marginBottom: '24px' }}>You haven't valued any cars yet.</p>
                    <Link to="/valuation" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 24px', backgroundColor: 'rgb(99, 102, 241)', color: '#fff', borderRadius: '8px', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                      Value your first car
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            {/* AI Market Insights */}
            <motion.div variants={itemVariants}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 600, color: 'rgb(240, 240, 250)', margin: 0 }}>AI Market Insights</h2>
                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'rgb(99, 102, 241)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Demo</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {[
                  { title: 'SUV Demand Rising', desc: 'Used SUV prices have increased by 4% in the last 30 days due to seasonal demand.', icon: <TrendingUp size={20} color="rgb(52, 211, 153)" /> },
                  { title: 'Best Time to Sell', desc: 'Current market conditions suggest selling sedans yields 12% higher returns than Q1.', icon: <Sparkles size={20} color="rgb(251, 146, 60)" /> },
                  { title: 'EV Depreciation Alert', desc: 'Older EV models are showing accelerated depreciation. Consider listing soon.', icon: <Bell size={20} color="rgb(248, 113, 113)" /> }
                ].map((insight, idx) => (
                  <div key={idx} className="card" style={{ backgroundColor: 'rgb(22, 22, 34)', border: '1px solid rgb(40, 40, 60)', borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px' }}>
                    <div style={{ marginTop: '4px' }}>
                      {insight.icon}
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600, color: 'rgb(240, 240, 250)', margin: '0 0 8px 0' }}>{insight.title}</h4>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgb(140, 140, 170)', margin: 0, lineHeight: 1.5 }}>{insight.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
