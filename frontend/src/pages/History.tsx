import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { predictionApi } from '../api/prediction';
import { toast } from 'react-hot-toast';
import { Trash2, Search, Car, Calendar, Activity } from 'lucide-react';

interface HistoryItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  predictedPrice: number;
  date: string;
  confidence: number;
  dealScore: number;
  marketStatus: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await predictionApi.getHistory();
      const items = (res as any)?.items || (res as any)?.data || (Array.isArray(res) ? res : []);
      const formatted: HistoryItem[] = items.map((item: any) => ({
        id: String(item.id),
        brand: item.vehicle?.brand || item.brand || 'Vehicle',
        model: item.vehicle?.model || item.model || '',
        year: item.vehicle?.year || item.year || 2022,
        predictedPrice: (item.predicted_price ? item.predicted_price / 100000 : (item.predictedPrice || 5.0)),
        date: item.created_at || item.date || new Date().toISOString(),
        confidence: item.confidence || 85,
        dealScore: item.deal_score || item.dealScore || 80,
        marketStatus: item.market_status || item.marketStatus || 'Good Deal',
      }));
      setHistory(formatted);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this valuation?')) return;
    try {
      await predictionApi.deleteHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      toast.success('Valuation deleted');
    } catch (err) {
      toast.error('Failed to delete valuation');
    }
  };

  const filteredHistory = history.filter(h => 
    h.brand.toLowerCase().includes(search.toLowerCase()) || 
    h.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#0a0a0f', color: '#f0f0fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Manrope', fontSize: '2.5rem', fontWeight: 'bold' }}>Valuation History</h1>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8c8caa' }} size={20} />
            <input 
              type="text" 
              placeholder="Search vehicles..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '3rem', backgroundColor: '#101018', border: '1px solid #28283c', borderRadius: '0.5rem', color: '#f0f0fa', padding: '0.75rem 1rem 0.75rem 3rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '1rem', backgroundColor: '#101018' }} />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#101018', borderRadius: '1rem', border: '1px solid #28283c' }}>
            <Car size={48} style={{ margin: '0 auto', color: '#50506e', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Manrope' }}>No valuations yet</h2>
            <p style={{ color: '#8c8caa' }}>Value your first car to see its history here!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AnimatePresence>
              {filteredHistory.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card"
                  style={{ backgroundColor: '#101018', borderRadius: '1rem', border: '1px solid #28283c', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#161622', padding: '1.5rem', borderRadius: '0.75rem' }}>
                      <Car size={32} style={{ color: '#6366f1' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem', fontFamily: 'Manrope' }}>
                        {item.year} {item.brand} {item.model}
                      </h3>
                      <div style={{ display: 'flex', gap: '1rem', color: '#8c8caa', fontSize: '0.875rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> {new Date(item.date).toLocaleDateString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={14} /> {item.marketStatus}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#8c8caa', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Predicted Price</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399', fontFamily: 'Manrope' }}>₹{item.predictedPrice.toFixed(2)}L</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#161622', border: '1px solid #28283c', color: '#f0f0fa', cursor: 'pointer' }}
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
