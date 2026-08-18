import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { toast } from 'react-hot-toast';
import { Trash2, Car, Settings, Fuel } from 'lucide-react';
import { savedCarsApi } from '../api/market';

interface SavedCarItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  imageUrl?: string;
}

export default function SavedCars() {
  const [cars, setCars] = useState<SavedCarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedCars();
  }, []);

  const loadSavedCars = async () => {
    setLoading(true);
    try {
      const res = await savedCarsApi.getAll();
      const items = Array.isArray(res) ? res : [];
      const formatted: SavedCarItem[] = items.map((c: any) => ({
        id: String(c.id),
        brand: c.vehicle?.brand || c.brand || 'Vehicle',
        model: c.vehicle?.model || c.model || '',
        year: c.vehicle?.year || c.year || 2022,
        fuelType: c.vehicle?.fuel_type || c.fuelType || 'Petrol',
        transmission: c.vehicle?.transmission || c.transmission || 'Manual',
        imageUrl: c.imageUrl,
      }));
      setCars(formatted);
    } catch (err) {
      toast.error('Failed to load saved cars');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await savedCarsApi.remove(id);
      setCars(cars.filter(c => c.id !== id));
      toast.success('Car removed from saved list');
    } catch (err) {
      toast.error('Failed to remove car');
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0f', color: '#f0f0fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontFamily: 'Manrope', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Saved Cars</h1>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '1rem', backgroundColor: '#101018' }} />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: '#101018', borderRadius: '1rem', border: '1px solid #28283c' }}>
            <Car size={64} style={{ margin: '0 auto', color: '#50506e', marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontFamily: 'Manrope' }}>No saved cars yet</h2>
            <p style={{ color: '#8c8caa', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              Save your favorite cars while browsing to compare them later and track their value.
            </p>
            <button 
              className="btn-primary"
              style={{ backgroundColor: '#6366f1', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Browse Cars
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <AnimatePresence>
              {cars.map((car) => (
                <motion.div 
                  key={car.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card"
                  style={{ backgroundColor: '#101018', borderRadius: '1rem', border: '1px solid #28283c', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ height: '160px', backgroundColor: '#161622', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {car.imageUrl ? (
                      <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Car size={48} style={{ color: '#28283c' }} />
                    )}
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', fontFamily: 'Manrope' }}>
                      {car.year} {car.brand} {car.model}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', color: '#8c8caa', fontSize: '0.875rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Fuel size={16} /> {car.fuelType}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={16} /> {car.transmission}</span>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #28283c' }}>
                      <button 
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#161622', border: '1px solid #28283c', color: '#f0f0fa', cursor: 'pointer', flex: 1, marginRight: '1rem' }}
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleRemove(car.id)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: '#28283c', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Remove"
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
