import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { toast } from 'react-hot-toast';
import { Bell, BellOff, Trash2, Plus, Car, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { alertsApi } from '../api/market';

interface AlertItem {
  id: string;
  vehicleName: string;
  type: 'price_drop' | 'price_rise' | 'percentage_change';
  targetValue: number;
  active: boolean;
}

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [vehicleName, setVehicleName] = useState('');
  const [alertType, setAlertType] = useState<'price_drop' | 'price_rise' | 'percentage_change'>('price_drop');
  const [targetValue, setTargetValue] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertsApi.getAll();
      const items = Array.isArray(res) ? res : [];
      const formatted: AlertItem[] = items.map((a: any) => ({
        id: String(a.id),
        vehicleName: a.vehicleName || (a.brand ? `${a.brand} ${a.model}` : (a.vehicle ? `${a.vehicle.brand} ${a.vehicle.model}` : 'Vehicle Alert')),
        type: (a.type || a.alert_type || 'price_drop') as any,
        targetValue: a.targetValue || a.target_price || 0,
        active: a.active !== undefined ? a.active : (a.is_active !== undefined ? a.is_active : true),
      }));
      setAlerts(formatted);
    } catch (err) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await alertsApi.update(id, { is_active: !currentStatus });
      setAlerts(alerts.map(a => a.id === id ? { ...a, active: !currentStatus } : a));
      toast.success(`Alert ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to update alert');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await alertsApi.delete(id);
      setAlerts(alerts.filter(a => a.id !== id));
      toast.success('Alert deleted');
    } catch (err) {
      toast.error('Failed to delete alert');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName || !targetValue) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const created = await alertsApi.create({
        brand: vehicleName.split(' ')[0] || 'General',
        model: vehicleName.split(' ').slice(1).join(' ') || 'Model',
        target_price: parseFloat(targetValue),
        alert_type: alertType,
      });
      const newAlert: AlertItem = {
        id: String(created.id || Math.random()),
        vehicleName,
        type: alertType,
        targetValue: parseFloat(targetValue),
        active: true,
      };
      setAlerts([newAlert, ...alerts]);
      setShowForm(false);
      setVehicleName('');
      setTargetValue('');
      toast.success('Price alert created');
    } catch (err) {
      toast.error('Failed to create alert');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_drop': return <TrendingDown size={20} color="#34d399" />;
      case 'price_rise': return <TrendingUp size={20} color="#f87171" />;
      case 'percentage_change': return <Percent size={20} color="#6366f1" />;
      default: return <Bell size={20} />;
    }
  };

  const formatTarget = (type: string, value: number) => {
    if (type === 'percentage_change') return `${value}%`;
    return `₹${value}L`;
  };

  return (
    <div style={{ backgroundColor: '#0a0a0f', color: '#f0f0fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Manrope', fontSize: '2.5rem', fontWeight: 'bold' }}>Price Alerts</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#6366f1', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <Plus size={20} /> New Alert
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: '2rem' }}
            >
              <div style={{ backgroundColor: '#101018', border: '1px solid #28283c', borderRadius: '1rem', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'Manrope' }}>Create New Alert</h2>
                <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#8c8caa', fontSize: '0.875rem' }}>Vehicle (Brand & Model)</label>
                    <div style={{ position: 'relative' }}>
                      <Car size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8c8caa' }} />
                      <input 
                        type="text" 
                        value={vehicleName}
                        onChange={(e) => setVehicleName(e.target.value)}
                        placeholder="e.g. Honda City 2022"
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', backgroundColor: '#161622', border: '1px solid #28283c', borderRadius: '0.5rem', color: '#f0f0fa', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#8c8caa', fontSize: '0.875rem' }}>Condition</label>
                    <select 
                      value={alertType}
                      onChange={(e: any) => setAlertType(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#161622', border: '1px solid #28283c', borderRadius: '0.5rem', color: '#f0f0fa', appearance: 'none', boxSizing: 'border-box' }}
                    >
                      <option value="price_drop">Price Drops Below</option>
                      <option value="price_rise">Price Rises Above</option>
                      <option value="percentage_change">Percentage Change</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#8c8caa', fontSize: '0.875rem' }}>
                      Target {alertType === 'percentage_change' ? '(%)' : '(₹ Lakhs)'}
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input 
                        type="number" 
                        step="0.01"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        placeholder={alertType === 'percentage_change' ? "e.g. 5" : "e.g. 8.5"}
                        style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#161622', border: '1px solid #28283c', borderRadius: '0.5rem', color: '#f0f0fa', boxSizing: 'border-box' }}
                      />
                      <button 
                        type="submit"
                        style={{ backgroundColor: '#6366f1', color: 'white', padding: '0 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '0.75rem', backgroundColor: '#101018' }} />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#101018', borderRadius: '1rem', border: '1px solid #28283c' }}>
            <BellOff size={48} style={{ margin: '0 auto', color: '#50506e', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Manrope' }}>No active alerts</h2>
            <p style={{ color: '#8c8caa', marginBottom: '1.5rem' }}>Set up price alerts to track your favorite cars.</p>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                style={{ backgroundColor: '#161622', color: '#f0f0fa', border: '1px solid #28283c', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Create Alert
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div 
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="card"
                  style={{ backgroundColor: '#101018', borderRadius: '0.75rem', border: '1px solid #28283c', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: alert.active ? 1 : 0.6 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: alert.active ? '#161622' : 'transparent', padding: '0.75rem', borderRadius: '0.5rem' }}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', fontFamily: 'Manrope', marginBottom: '0.25rem' }}>
                        {alert.vehicleName}
                      </h3>
                      <p style={{ color: '#8c8caa', fontSize: '0.875rem' }}>
                        Alert me when {alert.type.replace('_', ' ')} {formatTarget(alert.type, alert.targetValue)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button 
                      onClick={() => handleToggle(alert.id, alert.active)}
                      style={{ background: 'none', border: 'none', color: alert.active ? '#6366f1' : '#8c8caa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
                    >
                      {alert.active ? <Bell size={18} /> : <BellOff size={18} />}
                      {alert.active ? 'Active' : 'Inactive'}
                    </button>
                    
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#28283c' }}></div>
                    
                    <button 
                      onClick={() => handleDelete(alert.id)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.5rem' }}
                      title="Delete alert"
                    >
                      <Trash2 size={18} />
                    </button>
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
