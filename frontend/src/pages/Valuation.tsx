import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Car, Route, Wrench, MapPin, CheckCircle, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import { predictionApi } from '../api/prediction';

const BRANDS = ['Maruti Suzuki','Hyundai','Tata','Mahindra','Honda','Toyota','Kia','Renault','Volkswagen','Skoda','Ford','MG','Jeep','Nissan','Mercedes-Benz','BMW','Audi','Volvo','Datsun'];

const STATES_CITIES: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Delhi': ['New Delhi', 'Dwarka'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
  'Telangana': ['Hyderabad', 'Warangal'],
};

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT'];

const STEPS = [
  { id: 1, title: 'Vehicle', icon: Car },
  { id: 2, title: 'Usage', icon: Route },
  { id: 3, title: 'Condition', icon: Wrench },
  { id: 4, title: 'Location', icon: MapPin },
  { id: 5, title: 'Review', icon: CheckCircle },
];

export default function Valuation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    variant: '',
    year: '',
    fuelType: '',
    transmission: '',
    engineCC: '',
    fuelEfficiency: '',
    seatingCapacity: '5',
    kmDriven: '',
    ownerCount: '1',
    insuranceValid: true,
    conditionScore: 50,
    accidentHistory: false,
    serviceHistory: true,
    state: '',
    city: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.brand || !formData.model || !formData.year || !formData.fuelType || !formData.transmission || !formData.seatingCapacity) {
          toast.error('Please fill all required fields in Vehicle step');
          return false;
        }
        return true;
      case 2:
        if (!formData.kmDriven || !formData.ownerCount) {
          toast.error('Please fill KM Driven and Owner Count');
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        if (!formData.state || !formData.city) {
          toast.error('Please select State and City');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    try {
      const result = await predictionApi.predict({
        brand: formData.brand,
        model: formData.model,
        variant: formData.variant,
        year: parseInt(formData.year) || 2020,
        fuel_type: formData.fuelType,
        transmission: formData.transmission,
        engine_cc: formData.engineCC ? parseInt(formData.engineCC) : undefined,
        mileage_kmpl: formData.fuelEfficiency ? parseFloat(formData.fuelEfficiency) : undefined,
        seating_capacity: parseInt(formData.seatingCapacity) || 5,
        km_driven: parseInt(formData.kmDriven) || 30000,
        owner_count: parseInt(formData.ownerCount) || 1,
        condition_score: formData.conditionScore || 8,
        accident_history: Boolean(formData.accidentHistory),
        service_history: Boolean(formData.serviceHistory),
        city: formData.city,
        state: formData.state,
      });
      
      navigate('/valuation/result', { state: { result, formData } });
    } catch (error) {
      console.error('Prediction failed:', error);
      toast.error('Failed to calculate value. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConditionLabel = (score: number) => {
    if (score < 20) return 'Poor';
    if (score < 40) return 'Below Average';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Excellent';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>Brand *</label>
                <select name="brand" value={formData.brand} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }}>
                  <option value="">Select Brand</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>Model *</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Swift" className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>Variant</label>
                <input type="text" name="variant" value={formData.variant} onChange={handleChange} placeholder="e.g. LXI" className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>Year *</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} min="1990" max="2026" placeholder="e.g. 2020" className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>Fuel Type *</label>
                <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }}>
                  <option value="">Select Fuel Type</option>
                  {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>Transmission *</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }}>
                  <option value="">Select Transmission</option>
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>Engine CC</label>
                <input type="number" name="engineCC" value={formData.engineCC} onChange={handleChange} placeholder="e.g. 1197" className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>Fuel Efficiency (kmpl)</label>
                <input type="number" name="fuelEfficiency" value={formData.fuelEfficiency} onChange={handleChange} placeholder="e.g. 21.4" step="0.1" className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>Seating Capacity *</label>
                <input type="number" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} placeholder="e.g. 5" className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'rgb(240 240 250)' }}>
                <span>KM Driven *</span>
                <span style={{ color: 'rgb(99 102 241)', fontWeight: 'bold' }}>{formData.kmDriven || '0'} km</span>
              </label>
              <input type="range" name="kmDriven" min="0" max="300000" step="1000" value={formData.kmDriven || 0} onChange={handleChange} style={{ width: '100%', accentColor: 'rgb(99 102 241)', cursor: 'pointer' }} />
              <input type="number" name="kmDriven" value={formData.kmDriven} onChange={handleChange} placeholder="Or type exact km" className="input-field" style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }} />
            </div>
            
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '12px', color: 'rgb(240 240 250)' }}>Owner Count *</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, ownerCount: num.toString() }))}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: formData.ownerCount === num.toString() ? '2px solid rgb(99 102 241)' : '1px solid rgb(40 40 60)',
                      backgroundColor: formData.ownerCount === num.toString() ? 'rgba(99, 102, 241, 0.1)' : 'rgb(22 22 34)',
                      color: formData.ownerCount === num.toString() ? 'rgb(99 102 241)' : 'rgb(240 240 250)',
                      cursor: 'pointer',
                      fontWeight: formData.ownerCount === num.toString() ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgb(22 22 34)', borderRadius: '8px', border: '1px solid rgb(40 40 60)' }}>
              <div>
                <h4 style={{ color: 'rgb(240 240 250)', margin: 0, fontSize: '1rem' }}>Insurance Valid</h4>
                <p style={{ color: 'rgb(140 140 170)', margin: 0, fontSize: '0.875rem' }}>Does the vehicle have an active comprehensive insurance?</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                <input type="checkbox" name="insuranceValid" checked={formData.insuranceValid} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: formData.insuranceValid ? 'rgb(99 102 241)' : 'rgb(80 80 110)', 
                  transition: '.4s', borderRadius: '34px' 
                }}>
                  <span style={{ 
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: formData.insuranceValid ? '30px' : '4px', bottom: '4px', 
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%' 
                  }} />
                </span>
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <label className="input-label" style={{ color: 'rgb(240 240 250)' }}>Condition Score</label>
                <span style={{ color: 'rgb(99 102 241)', fontWeight: 'bold', backgroundColor: 'rgba(99,102,241,0.1)', padding: '4px 12px', borderRadius: '16px' }}>
                  {formData.conditionScore}/100 - {getConditionLabel(formData.conditionScore)}
                </span>
              </div>
              <input 
                type="range" 
                name="conditionScore" 
                min="0" 
                max="100" 
                value={formData.conditionScore} 
                onChange={(e) => setFormData(prev => ({ ...prev, conditionScore: parseInt(e.target.value) }))} 
                style={{ width: '100%', accentColor: 'rgb(99 102 241)', cursor: 'pointer', height: '8px', borderRadius: '4px' }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgb(140 140 170)', fontSize: '0.8rem', marginTop: '8px' }}>
                <span>Poor</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgb(22 22 34)', borderRadius: '8px', border: '1px solid rgb(40 40 60)' }}>
              <div>
                <h4 style={{ color: 'rgb(240 240 250)', margin: 0, fontSize: '1rem' }}>Accident History</h4>
                <p style={{ color: 'rgb(140 140 170)', margin: 0, fontSize: '0.875rem' }}>Has the vehicle been in a major accident?</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                <input type="checkbox" name="accidentHistory" checked={formData.accidentHistory} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: formData.accidentHistory ? 'rgb(248 113 113)' : 'rgb(80 80 110)', 
                  transition: '.4s', borderRadius: '34px' 
                }}>
                  <span style={{ 
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: formData.accidentHistory ? '30px' : '4px', bottom: '4px', 
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%' 
                  }} />
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgb(22 22 34)', borderRadius: '8px', border: '1px solid rgb(40 40 60)' }}>
              <div>
                <h4 style={{ color: 'rgb(240 240 250)', margin: 0, fontSize: '1rem' }}>Service History</h4>
                <p style={{ color: 'rgb(140 140 170)', margin: 0, fontSize: '0.875rem' }}>Do you have complete service records?</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                <input type="checkbox" name="serviceHistory" checked={formData.serviceHistory} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: formData.serviceHistory ? 'rgb(52 211 153)' : 'rgb(80 80 110)', 
                  transition: '.4s', borderRadius: '34px' 
                }}>
                  <span style={{ 
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: formData.serviceHistory ? '30px' : '4px', bottom: '4px', 
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%' 
                  }} />
                </span>
              </label>
            </div>
          </div>
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>State *</label>
              <select name="state" value={formData.state} onChange={(e) => { handleChange(e); setFormData(prev => ({...prev, city: ''})); }} className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff' }}>
                <option value="">Select State</option>
                {Object.keys(STATES_CITIES).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', color: 'rgb(240 240 250)' }}>City *</label>
              <select name="city" value={formData.city} onChange={handleChange} disabled={!formData.state} className="input-field" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: '#fff', opacity: !formData.state ? 0.5 : 1 }}>
                <option value="">Select City</option>
                {formData.state && STATES_CITIES[formData.state]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        );
      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: 'rgb(22 22 34)', padding: '24px', borderRadius: '12px', border: '1px solid rgb(40 40 60)' }}>
              <h3 style={{ color: 'rgb(240 240 250)', margin: '0 0 16px 0', fontSize: '1.25rem' }}>Vehicle Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div><span style={{ color: 'rgb(140 140 170)', display: 'block', fontSize: '0.875rem' }}>Brand & Model</span><span style={{ color: 'rgb(240 240 250)', fontWeight: '500' }}>{formData.brand} {formData.model}</span></div>
                <div><span style={{ color: 'rgb(140 140 170)', display: 'block', fontSize: '0.875rem' }}>Year</span><span style={{ color: 'rgb(240 240 250)', fontWeight: '500' }}>{formData.year}</span></div>
                <div><span style={{ color: 'rgb(140 140 170)', display: 'block', fontSize: '0.875rem' }}>Fuel Type</span><span style={{ color: 'rgb(240 240 250)', fontWeight: '500' }}>{formData.fuelType}</span></div>
                <div><span style={{ color: 'rgb(140 140 170)', display: 'block', fontSize: '0.875rem' }}>Transmission</span><span style={{ color: 'rgb(240 240 250)', fontWeight: '500' }}>{formData.transmission}</span></div>
                <div><span style={{ color: 'rgb(140 140 170)', display: 'block', fontSize: '0.875rem' }}>KM Driven</span><span style={{ color: 'rgb(240 240 250)', fontWeight: '500' }}>{Number(formData.kmDriven).toLocaleString()} km</span></div>
                <div><span style={{ color: 'rgb(140 140 170)', display: 'block', fontSize: '0.875rem' }}>Location</span><span style={{ color: 'rgb(240 240 250)', fontWeight: '500' }}>{formData.city}, {formData.state}</span></div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgb(22 22 34)', padding: '16px', borderRadius: '8px', border: '1px solid rgb(40 40 60)' }}>
                <div style={{ color: formData.insuranceValid ? 'rgb(52 211 153)' : 'rgb(248 113 113)' }}>
                  {formData.insuranceValid ? <CheckCircle size={24} /> : <div style={{width: 24, height: 24, borderRadius: '50%', border: '2px solid rgb(248 113 113)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>!</div>}
                </div>
                <div>
                  <div style={{ color: 'rgb(240 240 250)', fontWeight: '500' }}>Insurance</div>
                  <div style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>{formData.insuranceValid ? 'Active' : 'Expired'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgb(22 22 34)', padding: '16px', borderRadius: '8px', border: '1px solid rgb(40 40 60)' }}>
                <div style={{ color: formData.serviceHistory ? 'rgb(52 211 153)' : 'rgb(251 146 60)' }}>
                  {formData.serviceHistory ? <CheckCircle size={24} /> : <div style={{width: 24, height: 24, borderRadius: '50%', border: '2px solid rgb(251 146 60)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>?</div>}
                </div>
                <div>
                  <div style={{ color: 'rgb(240 240 250)', fontWeight: '500' }}>Service History</div>
                  <div style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>{formData.serviceHistory ? 'Available' : 'Not Available'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgb(22 22 34)', padding: '16px', borderRadius: '8px', border: '1px solid rgb(40 40 60)' }}>
                <div style={{ color: formData.accidentHistory ? 'rgb(248 113 113)' : 'rgb(52 211 153)' }}>
                  {!formData.accidentHistory ? <CheckCircle size={24} /> : <div style={{width: 24, height: 24, borderRadius: '50%', border: '2px solid rgb(248 113 113)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>!</div>}
                </div>
                <div>
                  <div style={{ color: 'rgb(240 240 250)', fontWeight: '500' }}>Accident History</div>
                  <div style={{ color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>{formData.accidentHistory ? 'Reported' : 'Clean'}</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'rgb(10 10 15)', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ color: 'rgb(240 240 250)', fontFamily: "'Manrope', sans-serif", fontSize: '2rem', textAlign: 'center', marginBottom: '24px' }}>
              Vehicle Valuation
            </h1>
            
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', backgroundColor: 'rgb(40 40 60)', zIndex: 0, transform: 'translateY(-50%)', borderRadius: '2px' }}>
                <div style={{ height: '100%', backgroundColor: 'rgb(99 102 241)', width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`, transition: 'width 0.4s ease-in-out', borderRadius: '2px' }} />
              </div>
              
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isActive || isCompleted ? 'rgb(99 102 241)' : 'rgb(22 22 34)',
                      border: isActive ? '2px solid #fff' : `2px solid ${isCompleted ? 'rgb(99 102 241)' : 'rgb(40 40 60)'}`,
                      color: isActive || isCompleted ? '#fff' : 'rgb(140 140 170)',
                      transition: 'all 0.3s ease'
                    }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? 'rgb(240 240 250)' : 'rgb(140 140 170)' }}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', color: 'rgb(140 140 170)', fontSize: '0.875rem' }}>Step {currentStep} of {STEPS.length}</div>
          </div>

          <div className="card" style={{ backgroundColor: 'rgb(16 16 24)', borderRadius: '16px', padding: '32px', border: '1px solid rgb(40 40 60)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: 'rgb(240 240 250)', fontFamily: "'Manrope', sans-serif", fontSize: '1.5rem', marginBottom: '24px', borderBottom: '1px solid rgb(40 40 60)', paddingBottom: '16px' }}>
              {STEPS[currentStep - 1].title}
            </h2>

            <div style={{ flex: 1, position: 'relative' }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgb(40 40 60)' }}>
              <button 
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                className="btn-secondary"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px',
                  backgroundColor: 'transparent', border: '1px solid rgb(80 80 110)', color: 'rgb(240 240 250)',
                  cursor: currentStep === 1 || isSubmitting ? 'not-allowed' : 'pointer', opacity: currentStep === 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft size={20} /> Back
              </button>

              {currentStep < 5 ? (
                <button 
                  onClick={handleNext}
                  className="btn-primary"
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px',
                    backgroundColor: 'rgb(99 102 241)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  Next <ChevronRight size={20} />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgb(99, 102, 241), rgb(139, 92, 246))', border: 'none', color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold'
                  }}
                >
                  {isSubmitting ? (
                    <><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Calculating...</>
                  ) : (
                    <><CheckCircle size={20} /> Calculate Value</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
