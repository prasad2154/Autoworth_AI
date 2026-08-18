import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Plus, X, Search, CheckCircle, Award, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data
const mockCars = [
  { id: 1, brand: 'Hyundai Creta', year: 2021, price: '12.45', dealScore: 92, fuel: 'Petrol', transmission: 'Automatic', km: '32,000', condition: 'Excellent', status: 'High Demand' },
  { id: 2, brand: 'Kia Seltos', year: 2020, price: '11.80', dealScore: 88, fuel: 'Diesel', transmission: 'Manual', km: '45,000', condition: 'Good', status: 'Stable' },
  { id: 3, brand: 'Tata Harrier', year: 2022, price: '16.50', dealScore: 95, fuel: 'Diesel', transmission: 'Automatic', km: '18,000', condition: 'Like New', status: 'High Demand' }
];

export default function Compare() {
  const [slots, setSlots] = useState<(typeof mockCars[0] | null)[]>([mockCars[0], mockCars[1], null]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  const handleAddCar = (index: number) => {
    setActiveSlot(index);
    setIsModalOpen(true);
  };

  const removeCar = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
  };

  const selectCar = (car: typeof mockCars[0]) => {
    const newSlots = [...slots];
    newSlots[activeSlot] = car;
    setSlots(newSlots);
    setIsModalOpen(false);
  };

  const compareFeatures = [
    { label: 'Estimated Price', key: 'price', format: (v: string) => `₹${v}L`, isBest: (vals: string[]) => Math.min(...vals.map(Number)).toString() },
    { label: 'Deal Score', key: 'dealScore', format: (v: number) => `${v}/100`, isBest: (vals: number[]) => Math.max(...vals) },
    { label: 'Year', key: 'year', format: (v: number) => v, isBest: (vals: number[]) => Math.max(...vals) },
    { label: 'KM Driven', key: 'km', format: (v: string) => `${v} km`, isBest: () => false }, // simplified
    { label: 'Condition', key: 'condition', format: (v: string) => v, isBest: () => false },
    { label: 'Market Status', key: 'status', format: (v: string) => v, isBest: () => false }
  ];

  const hasCars = slots.some(slot => slot !== null);

  return (
    <div style={{ backgroundColor: 'rgb(10 10 15)', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'rgb(240 240 250)', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '36px', margin: '0 0 12px 0' }}>Compare Vehicles</h1>
          <p style={{ color: 'rgb(140 140 170)', maxWidth: '600px', margin: '0 auto' }}>Side-by-side market valuation and specs comparison to find the best deal.</p>
        </div>

        {/* Top Slots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {slots.map((car, index) => (
            <div key={index} style={{ backgroundColor: 'rgb(16 16 24)', borderRadius: '16px', border: '1px solid rgb(40 40 60)', overflow: 'hidden', position: 'relative' }}>
              {car ? (
                <>
                  <button onClick={() => removeCar(index)} style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}>
                    <X size={16} />
                  </button>
                  <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid rgb(40 40 60)' }}>
                    <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', margin: '0 0 8px 0' }}>{car.brand}</h3>
                    <p style={{ color: 'rgb(140 140 170)', margin: '0 0 16px 0' }}>{car.year} • {car.fuel} • {car.transmission}</p>
                    <div className="badge-primary" style={{ display: 'inline-block', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'rgb(99, 102, 241)', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
                      ₹{car.price}L
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', border: '2px dashed rgb(40 40 60)', borderRadius: '16px', cursor: 'pointer' }} onClick={() => handleAddCar(index)}>
                  <div style={{ backgroundColor: 'rgb(22 22 34)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Plus size={24} color="rgb(99 102 241)" />
                  </div>
                  <p style={{ color: 'rgb(140 140 170)', fontWeight: 500, margin: 0 }}>Add Car to Compare</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        {hasCars ? (
          <div className="card" style={{ backgroundColor: 'rgb(16 16 24)', borderRadius: '16px', border: '1px solid rgb(40 40 60)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <tbody>
                {compareFeatures.map((feature, i) => (
                  <tr key={i} style={{ borderBottom: i < compareFeatures.length - 1 ? '1px solid rgb(40 40 60)' : 'none' }}>
                    <td style={{ padding: '20px', textAlign: 'left', color: 'rgb(140 140 170)', fontWeight: 500, width: '20%', borderRight: '1px solid rgb(40 40 60)' }}>
                      {feature.label}
                    </td>
                    {slots.map((car, colIndex) => {
                      if (!car) return <td key={colIndex} style={{ width: '26.6%', borderRight: colIndex < 2 ? '1px solid rgb(40 40 60)' : 'none' }}>-</td>;
                      
                      const val = (car as any)[feature.key];
                      const displayVal = feature.format ? feature.format(val) : val;
                      
                      // Highlight logic could be refined
                      let isHighlighted = false;
                      if (feature.key === 'dealScore' && val >= 90) isHighlighted = true;
                      
                      return (
                        <td key={colIndex} style={{ padding: '20px', width: '26.6%', borderRight: colIndex < 2 ? '1px solid rgb(40 40 60)' : 'none' }}>
                          <span style={{ 
                            color: isHighlighted ? 'rgb(52 211 153)' : 'rgb(240 240 250)', 
                            fontWeight: isHighlighted ? 600 : 400,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}>
                            {displayVal}
                            {isHighlighted && <CheckCircle size={16} color="rgb(52 211 153)" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgb(140 140 170)' }}>
            <Award size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>Add vehicles above to start comparing</p>
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ backgroundColor: 'rgb(16 16 24)', padding: '32px', borderRadius: '16px', border: '1px solid rgb(40 40 60)', width: '100%', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', margin: 0 }}>Select Vehicle</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'rgb(140 140 170)', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'rgb(140 140 170)' }} />
                <input type="text" placeholder="Search saved valuations..." className="input-field" style={{ width: '100%', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: 'white', padding: '14px 16px 14px 48px', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mockCars.map((car) => (
                  <div key={car.id} onClick={() => selectCar(car)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgb(22 22 34)', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0' }}>{car.brand}</h4>
                      <p style={{ margin: 0, color: 'rgb(140 140 170)', fontSize: '14px' }}>{car.year} • ₹{car.price}L</p>
                    </div>
                    <Plus size={20} color="rgb(99 102 241)" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
