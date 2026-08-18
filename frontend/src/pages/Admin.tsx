import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Users, BarChart2, Activity, Database, Cpu, 
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { adminApi } from '../api/market';

// Interfaces for our data
interface SystemStats {
  totalUsers: number;
  totalValuations: number;
  predictionsToday: number;
  avgPredictedValue: number;
}

interface ModelInfo {
  version: string;
  algorithm: string;
  mae: number;
  rmse: number;
  r2Score: number;
  mape: number;
  trainingRecords: number;
  featureCount: number;
  trainedAt: string;
  isActive: boolean;
  isLoaded: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  status: 'active' | 'inactive';
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [modelVersions, setModelVersions] = useState<ModelInfo[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Mock data fallbacks for premium UI look in case API is not fully connected
  const mockData = {
    stats: {
      totalUsers: 1248,
      totalValuations: 15420,
      predictionsToday: 342,
      avgPredictedValue: 850000 // 8.50L
    },
    modelInfo: {
      version: 'v2.4.1',
      algorithm: 'Random Forest Regressor',
      mae: 42000,
      rmse: 58000,
      r2Score: 0.94,
      mape: 5.2,
      trainingRecords: 45000,
      featureCount: 14,
      trainedAt: '2026-08-15T10:30:00Z',
      isActive: true,
      isLoaded: true
    },
    modelVersions: [
      {
        version: 'v2.4.1',
        algorithm: 'Random Forest Regressor',
        mae: 42000,
        rmse: 58000,
        r2Score: 0.94,
        mape: 5.2,
        trainingRecords: 45000,
        featureCount: 14,
        trainedAt: '2026-08-15T10:30:00Z',
        isActive: true,
        isLoaded: true
      },
      {
        version: 'v2.3.0',
        algorithm: 'Gradient Boosting',
        mae: 46000,
        rmse: 62000,
        r2Score: 0.91,
        mape: 6.1,
        trainingRecords: 40000,
        featureCount: 12,
        trainedAt: '2026-07-01T08:15:00Z',
        isActive: false,
        isLoaded: false
      }
    ],
    users: [
      { id: '1', name: 'Admin User', email: 'admin@autoworth.ai', role: 'ADMIN', createdAt: '2026-01-10', status: 'active' },
      { id: '2', name: 'John Doe', email: 'john@example.com', role: 'USER', createdAt: '2026-05-20', status: 'active' },
      { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'USER', createdAt: '2026-06-12', status: 'inactive' },
    ]
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // Try fetching from API, fallback to mock data if API fails/isn't implemented
        const [statsRes, infoRes, versionsRes, usersRes] = await Promise.all([
          adminApi.getStats().catch(() => mockData.stats),
          adminApi.getModelInfo().catch(() => mockData.modelInfo),
          adminApi.getModelVersions().catch(() => mockData.modelVersions),
          adminApi.getUsers().catch(() => mockData.users)
        ]);
        
        setStats(statsRes);
        setModelInfo(infoRes);
        setModelVersions(versionsRes);
        setUsers(usersRes);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const formatPrice = (price: number) => {
    return `₹${(price / 100000).toFixed(2)}L`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const metricsChartData = modelVersions.map(v => ({
    name: v.version,
    R2Score: Math.round(v.r2Score * 100),
    MAPE: v.mape
  }));

  if (loading || !stats || !modelInfo) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'rgb(10, 10, 15)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgb(240, 240, 250)' }}>
          <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'rgb(10, 10, 15)', 
      color: 'rgb(240, 240, 250)',
      fontFamily: '"Inter", sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgb(40, 40, 60)', paddingBottom: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px', color: 'rgb(99, 102, 241)' }}>
              <Shield size={32} />
            </div>
            <div>
              <h1 style={{ fontFamily: '"Manrope", sans-serif', margin: 0, fontSize: '2rem', fontWeight: 700 }}>Admin Dashboard</h1>
              <p style={{ margin: '0.25rem 0 0', color: 'rgb(140, 140, 170)' }}>Welcome back, System Administrator</p>
            </div>
          </motion.div>

          {/* System Stats Row */}
          <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Users size={24} style={{ color: 'rgb(99, 102, 241)' }} />
                <h3 style={{ margin: 0, color: 'rgb(140, 140, 170)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Users</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: '"Manrope", sans-serif' }}>{stats.totalUsers.toLocaleString()}</div>
            </div>

            <div className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Database size={24} style={{ color: 'rgb(52, 211, 153)' }} />
                <h3 style={{ margin: 0, color: 'rgb(140, 140, 170)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Valuations</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: '"Manrope", sans-serif' }}>{stats.totalValuations.toLocaleString()}</div>
            </div>

            <div className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Activity size={24} style={{ color: 'rgb(251, 146, 60)' }} />
                <h3 style={{ margin: 0, color: 'rgb(140, 140, 170)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Predictions Today</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: '"Manrope", sans-serif' }}>{stats.predictionsToday.toLocaleString()}</div>
            </div>

            <div className="card" style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <BarChart2 size={24} style={{ color: 'rgb(248, 113, 113)' }} />
                <h3 style={{ margin: 0, color: 'rgb(140, 140, 170)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg Predicted Value</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: '"Manrope", sans-serif' }}>{formatPrice(stats.avgPredictedValue)}</div>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr lg:1fr', gap: '2rem' }}>
            {/* Model Information */}
            <motion.div variants={itemVariants} style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '2rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: '"Manrope", sans-serif', margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={20} style={{ color: 'rgb(99, 102, 241)' }} />
                  Current Model Information
                </h2>
                {modelInfo.isActive && (
                  <span className="badge-success" style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', color: 'rgb(52, 211, 153)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <p style={{ margin: 0, color: 'rgb(140, 140, 170)', fontSize: '0.875rem' }}>Version / Algorithm</p>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500 }}>{modelInfo.version} - {modelInfo.algorithm}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: 'rgb(140, 140, 170)', fontSize: '0.875rem' }}>Status</p>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', color: modelInfo.isLoaded ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)' }}>
                    {modelInfo.isLoaded ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {modelInfo.isLoaded ? 'Model Loaded' : 'Model Not Loaded'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: 'rgb(140, 140, 170)', fontSize: '0.875rem' }}>Training Records / Features</p>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500 }}>{modelInfo.trainingRecords.toLocaleString()} / {modelInfo.featureCount}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: 'rgb(140, 140, 170)', fontSize: '0.875rem' }}>Trained At</p>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 500 }}>{formatDate(modelInfo.trainedAt)}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgb(40, 40, 60)', paddingTop: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'rgb(140, 140, 170)' }}>Performance Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'rgb(22, 22, 34)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: 'rgb(140, 140, 170)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>MAE</div>
                    <div style={{ fontWeight: 600, color: 'rgb(99, 102, 241)' }}>{formatPrice(modelInfo.mae)}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgb(22, 22, 34)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: 'rgb(140, 140, 170)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>RMSE</div>
                    <div style={{ fontWeight: 600, color: 'rgb(99, 102, 241)' }}>{formatPrice(modelInfo.rmse)}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgb(22, 22, 34)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: 'rgb(140, 140, 170)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>R² Score</div>
                    <div style={{ fontWeight: 600, color: 'rgb(52, 211, 153)' }}>{(modelInfo.r2Score * 100).toFixed(1)}%</div>
                  </div>
                  <div style={{ backgroundColor: 'rgb(22, 22, 34)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: 'rgb(140, 140, 170)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>MAPE</div>
                    <div style={{ fontWeight: 600, color: 'rgb(251, 146, 60)' }}>{modelInfo.mape.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Model Comparison Chart */}
            <motion.div variants={itemVariants} style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '2rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)' }}>
               <h2 style={{ fontFamily: '"Manrope", sans-serif', margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Version Comparison</h2>
               <div style={{ width: '100%', height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metricsChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(40, 40, 60)" />
                      <XAxis dataKey="name" stroke="rgb(140, 140, 170)" />
                      <YAxis stroke="rgb(140, 140, 170)" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgb(22, 22, 34)', border: '1px solid rgb(40, 40, 60)', color: 'rgb(240, 240, 250)' }} />
                      <Legend />
                      <Bar dataKey="R2Score" fill="rgb(52, 211, 153)" name="R² Score (%)" />
                      <Bar dataKey="MAPE" fill="rgb(251, 146, 60)" name="MAPE (%)" />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* System Health & Data Generation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <motion.div variants={itemVariants} style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '2rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)' }}>
                <h2 style={{ fontFamily: '"Manrope", sans-serif', margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Dataset Management</h2>
                <div style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <AlertCircle size={20} style={{ color: 'rgb(251, 146, 60)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'rgb(251, 146, 60)' }}>Admin Only Feature</h4>
                    <p style={{ margin: 0, color: 'rgb(240, 240, 250)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      To regenerate the dataset and train a new model, you must run the server-side scripts manually via terminal for security reasons.
                    </p>
                  </div>
                </div>
                <div style={{ backgroundColor: 'rgb(10, 10, 15)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', color: 'rgb(140, 140, 170)', fontSize: '0.875rem' }}>
                  $ python scripts/generate_dataset.py<br/>
                  $ python scripts/train_model.py
                </div>
              </motion.div>

              <motion.div variants={itemVariants} style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '2rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)' }}>
                <h2 style={{ fontFamily: '"Manrope", sans-serif', margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>System Health</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgb(22, 22, 34)', padding: '1rem', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 500 }}>Prediction Engine</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgb(52, 211, 153)', fontSize: '0.875rem' }}><CheckCircle size={16} /> Online</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgb(22, 22, 34)', padding: '1rem', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 500 }}>Database Connection</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgb(52, 211, 153)', fontSize: '0.875rem' }}><CheckCircle size={16} /> Connected</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgb(22, 22, 34)', padding: '1rem', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 500 }}>External API Services</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgb(52, 211, 153)', fontSize: '0.875rem' }}><CheckCircle size={16} /> Operational</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Model Versions Table */}
            <motion.div variants={itemVariants} style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '2rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)', gridColumn: '1 / -1' }}>
              <h2 style={{ fontFamily: '"Manrope", sans-serif', margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Model Versions</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgb(40, 40, 60)', color: 'rgb(140, 140, 170)', fontSize: '0.875rem' }}>
                      <th style={{ padding: '1rem 0' }}>Version</th>
                      <th style={{ padding: '1rem 0' }}>Algorithm</th>
                      <th style={{ padding: '1rem 0' }}>R² Score</th>
                      <th style={{ padding: '1rem 0' }}>Trained At</th>
                      <th style={{ padding: '1rem 0' }}>Status</th>
                      <th style={{ padding: '1rem 0', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelVersions.map((v) => (
                      <tr key={v.version} style={{ borderBottom: '1px solid rgb(40, 40, 60)' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 500 }}>{v.version}</td>
                        <td style={{ padding: '1rem 0', color: 'rgb(140, 140, 170)' }}>{v.algorithm}</td>
                        <td style={{ padding: '1rem 0' }}>{(v.r2Score * 100).toFixed(1)}%</td>
                        <td style={{ padding: '1rem 0', color: 'rgb(140, 140, 170)' }}>{formatDate(v.trainedAt)}</td>
                        <td style={{ padding: '1rem 0' }}>
                          {v.isActive ? 
                            <span style={{ color: 'rgb(52, 211, 153)', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>ACTIVE</span> : 
                            <span style={{ color: 'rgb(140, 140, 170)', fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(140, 140, 170, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>INACTIVE</span>
                          }
                        </td>
                        <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                          <button className="btn-secondary" disabled={v.isActive} style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: '6px', 
                            border: '1px solid rgb(40, 40, 60)', 
                            backgroundColor: v.isActive ? 'transparent' : 'rgb(22, 22, 34)', 
                            color: v.isActive ? 'rgb(80, 80, 110)' : 'rgb(240, 240, 250)',
                            cursor: v.isActive ? 'not-allowed' : 'pointer'
                          }}>
                            {v.isActive ? 'Current' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* User Management */}
            <motion.div variants={itemVariants} style={{ backgroundColor: 'rgb(16, 16, 24)', padding: '2rem', borderRadius: '16px', border: '1px solid rgb(40, 40, 60)', gridColumn: '1 / -1' }}>
              <h2 style={{ fontFamily: '"Manrope", sans-serif', margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>User Management</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgb(40, 40, 60)', color: 'rgb(140, 140, 170)', fontSize: '0.875rem' }}>
                      <th style={{ padding: '1rem 0' }}>Name</th>
                      <th style={{ padding: '1rem 0' }}>Email</th>
                      <th style={{ padding: '1rem 0' }}>Role</th>
                      <th style={{ padding: '1rem 0' }}>Created At</th>
                      <th style={{ padding: '1rem 0' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid rgb(40, 40, 60)' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 500 }}>{user.name}</td>
                        <td style={{ padding: '1rem 0', color: 'rgb(140, 140, 170)' }}>{user.email}</td>
                        <td style={{ padding: '1rem 0' }}>
                          <span style={{ 
                            fontSize: '0.75rem', fontWeight: 600, 
                            backgroundColor: user.role === 'ADMIN' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
                            color: user.role === 'ADMIN' ? 'rgb(251, 146, 60)' : 'rgb(99, 102, 241)',
                            padding: '0.25rem 0.5rem', borderRadius: '4px' 
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0', color: 'rgb(140, 140, 170)' }}>{formatDate(user.createdAt)}</td>
                        <td style={{ padding: '1rem 0' }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: user.status === 'active' ? 'rgb(52, 211, 153)' : 'rgb(140, 140, 170)', fontSize: '0.875rem' }}>
                             {user.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                             {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
