import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { predictionApi } from '../api/prediction';
import { PredictionResponse } from '../types';

const formatLakhs = (value: number) => {
  return `₹${(value / 100000).toFixed(2)}L`;
};

export default function ValuationResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as { result: PredictionResponse, formData: any } | null;
  
  const [result, setResult] = useState<PredictionResponse | null>(state?.result || null);
  const formData = state?.formData;

  useEffect(() => {
    if (!state || !state.result) {
      navigate('/valuation');
    }
  }, [state, navigate]);

  // What-If Simulator State
  const [simParams, setSimParams] = useState({
    km_driven: formData?.km_driven || 50000,
    condition_score: formData?.condition_score || 8,
    year: formData?.year || 2018
  });
  const [isSimulating, setIsSimulating] = useState(false);

  // Negotiation Assistant State
  const [askingPrice, setAskingPrice] = useState('');
  const [negotiationResult, setNegotiationResult] = useState<any>(null);
  const [isNegotiating, setIsNegotiating] = useState(false);

  if (!result || !formData) return null;

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const response = await predictionApi.simulate(result.valuation_id || result.id || 1, simParams);
      if (response && (response.data || response.predicted_price)) {
        setResult(prev => prev ? { ...prev, ...(response.data || response) } : prev);
      }
    } catch (error) {
      console.error("Simulation failed", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleNegotiate = async () => {
    if (!askingPrice) return;
    setIsNegotiating(true);
    try {
      const response = await predictionApi.negotiate(result.valuation_id || result.id || 1, {
        seller_asking_price: Number(askingPrice)
      });
      if (response) {
        setNegotiationResult(response.data || response);
      }
    } catch (error) {
      console.error("Negotiation failed", error);
    } finally {
      setIsNegotiating(false);
    }
  };

  // Mock data if not provided
  const depreciationData = result.depreciation_curve || result.depreciation_forecast || [
    { year: 2024, price: 625000 },
    { year: 2025, price: 580000 },
    { year: 2026, price: 540000 },
    { year: 2027, price: 505000 },
    { year: 2028, price: 470000 }
  ];

  const shapData = result.shap_features || result.feature_contributions || [
    { feature: 'Year', value: 45000 },
    { feature: 'Condition', value: 20000 },
    { feature: 'Km Driven', value: -15000 },
    { feature: 'Owner', value: -8000 }
  ];

  const comparables = result.comparable_vehicles || result.comparables || [
    { id: 1, title: '2019 Swift VXI', price: 590000, score: 85 },
    { id: 2, title: '2018 Swift ZXI', price: 650000, score: 78 },
    { id: 3, title: '2019 Swift LXI', price: 540000, score: 88 }
  ];

  const confidenceScore = result.confidence || result.confidence_score || 85;

  return (
    <div style={{ backgroundColor: 'rgb(10, 10, 15)', minHeight: '100vh', color: 'rgb(240, 240, 250)', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      <main style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '0 auto', marginTop: '60px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Hero Result Card */}
          <section style={{ backgroundColor: 'rgb(16, 16, 24)', borderRadius: '16px', padding: '2rem', border: '1px solid rgb(40, 40, 60)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.2rem', color: 'rgb(140, 140, 170)', marginBottom: '0.5rem' }}>
                  Estimated Market Value
                </h1>
                <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'rgb(99, 102, 241)', fontFamily: 'Manrope, sans-serif' }}>
                  {formatLakhs(result.predicted_price)}
                </div>
                <div style={{ fontSize: '1rem', color: 'rgb(140, 140, 170)', marginTop: '0.5rem' }}>
                  Fair Range: {formatLakhs(result.lower_bound || result.price_range?.min || result.predicted_price * 0.95)} - {formatLakhs(result.upper_bound || result.price_range?.max || result.predicted_price * 1.05)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
                <div>
                  <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(rgb(52, 211, 153) ${confidenceScore}%, rgb(40, 40, 60) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgb(16, 16, 24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                      {confidenceScore}%
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgb(140, 140, 170)' }}>Confidence</div>
                </div>
                
                <div>
                  <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(rgb(99, 102, 241) ${result.deal_score || 80}%, rgb(40, 40, 60) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgb(16, 16, 24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                      {result.deal_score || 80}
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgb(140, 140, 170)' }}>Deal Score</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: 'rgb(52, 211, 153)', fontSize: '0.9rem', fontWeight: '600' }}>
                {result.market_status || 'Good Deal'}
              </span>
              <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgb(99, 102, 241)', backgroundColor: 'transparent', color: 'rgb(99, 102, 241)', cursor: 'pointer', fontWeight: '600' }}>
                Save Valuation
              </button>
              <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgb(40, 40, 60)', backgroundColor: 'transparent', color: 'rgb(240, 240, 250)', cursor: 'pointer' }}>
                Create Alert
              </button>
              <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgb(40, 40, 60)', backgroundColor: 'transparent', color: 'rgb(240, 240, 250)', cursor: 'pointer' }}>
                Compare
              </button>
            </div>
          </section>

          {/* Key Metrics Row */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'rgb(22, 22, 34)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgb(40, 40, 60)' }}>
              <div style={{ color: 'rgb(140, 140, 170)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Market Average</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatLakhs(result.market_average || result.predicted_price + 15000)}</div>
            </div>
            <div style={{ backgroundColor: 'rgb(22, 22, 34)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgb(40, 40, 60)' }}>
              <div style={{ color: 'rgb(140, 140, 170)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Recommended Listing</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatLakhs(result.recommended_listing_price || result.recommended_listing || result.predicted_price + 25000)}</div>
            </div>
            <div style={{ backgroundColor: 'rgb(22, 22, 34)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgb(40, 40, 60)' }}>
              <div style={{ color: 'rgb(140, 140, 170)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Model</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.brand} {formData.model}</div>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* Feature Contributions */}
            <section style={{ backgroundColor: 'rgb(16, 16, 24)', borderRadius: '16px', padding: '2rem', border: '1px solid rgb(40, 40, 60)' }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Value Factors (SHAP)</h2>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(40, 40, 60)" horizontal={false} />
                    <XAxis type="number" stroke="rgb(140, 140, 170)" tickFormatter={(val) => `₹${val/1000}k`} />
                    <YAxis dataKey="feature" type="category" stroke="rgb(140, 140, 170)" width={80} />
                    <RechartsTooltip cursor={{ fill: 'rgb(22, 22, 34)' }} contentStyle={{ backgroundColor: 'rgb(16, 16, 24)', borderColor: 'rgb(40, 40, 60)' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {shapData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Depreciation Forecast */}
            <section style={{ backgroundColor: 'rgb(16, 16, 24)', borderRadius: '16px', padding: '2rem', border: '1px solid rgb(40, 40, 60)' }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Depreciation Forecast</h2>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={depreciationData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(40, 40, 60)" vertical={false} />
                    <XAxis dataKey="year" stroke="rgb(140, 140, 170)" />
                    <YAxis stroke="rgb(140, 140, 170)" tickFormatter={(val) => `${val/100000}L`} />
                    <RechartsTooltip cursor={{ stroke: 'rgb(40, 40, 60)' }} contentStyle={{ backgroundColor: 'rgb(16, 16, 24)', borderColor: 'rgb(40, 40, 60)' }} />
                    <Line type="monotone" dataKey="price" stroke="rgb(99, 102, 241)" strokeWidth={3} dot={{ fill: 'rgb(16, 16, 24)', stroke: 'rgb(99, 102, 241)', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* What-If Simulator */}
            <section style={{ backgroundColor: 'rgb(22, 22, 34)', borderRadius: '16px', padding: '2rem', border: '1px solid rgb(40, 40, 60)' }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.2rem', marginBottom: '1.5rem', color: 'rgb(251, 146, 60)' }}>What-If Simulator</h2>
              <p style={{ color: 'rgb(140, 140, 170)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Adjust factors to see how they impact the valuation.</p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ color: 'rgb(140, 140, 170)', fontSize: '0.9rem' }}>Kilometers Driven: {simParams.km_driven.toLocaleString()} km</label>
                </div>
                <input 
                  type="range" 
                  min="0" max="200000" step="5000"
                  value={simParams.km_driven}
                  onChange={(e) => setSimParams({...simParams, km_driven: Number(e.target.value)})}
                  style={{ width: '100%', accentColor: 'rgb(251, 146, 60)' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ color: 'rgb(140, 140, 170)', fontSize: '0.9rem' }}>Condition Score: {simParams.condition_score}/10</label>
                </div>
                <input 
                  type="range" 
                  min="1" max="10" step="0.5"
                  value={simParams.condition_score}
                  onChange={(e) => setSimParams({...simParams, condition_score: Number(e.target.value)})}
                  style={{ width: '100%', accentColor: 'rgb(251, 146, 60)' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ color: 'rgb(140, 140, 170)', fontSize: '0.9rem' }}>Manufacturing Year: {simParams.year}</label>
                </div>
                <input 
                  type="range" 
                  min="2000" max={new Date().getFullYear()} step="1"
                  value={simParams.year}
                  onChange={(e) => setSimParams({...simParams, year: Number(e.target.value)})}
                  style={{ width: '100%', accentColor: 'rgb(251, 146, 60)' }}
                />
              </div>

              <button 
                onClick={handleSimulate}
                disabled={isSimulating}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgb(251, 146, 60)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', opacity: isSimulating ? 0.7 : 1 }}
              >
                {isSimulating ? 'Simulating...' : 'Simulate'}
              </button>
            </section>

            {/* Negotiation Assistant */}
            <section style={{ backgroundColor: 'rgb(22, 22, 34)', borderRadius: '16px', padding: '2rem', border: '1px solid rgb(40, 40, 60)' }}>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.2rem', marginBottom: '1.5rem', color: 'rgb(52, 211, 153)' }}>Negotiation Assistant</h2>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'rgb(140, 140, 170)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Seller's Asking Price (₹)</label>
                <input 
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="e.g. 650000"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgb(16, 16, 24)', border: '1px solid rgb(40, 40, 60)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
              <button 
                onClick={handleNegotiate}
                disabled={isNegotiating || !askingPrice}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid rgb(52, 211, 153)', color: 'rgb(52, 211, 153)', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1.5rem' }}
              >
                {isNegotiating ? 'Analyzing...' : 'Get Strategy'}
              </button>

              <AnimatePresence>
                {negotiationResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div style={{ padding: '1rem', backgroundColor: 'rgb(16, 16, 24)', borderRadius: '8px', border: '1px solid rgb(40, 40, 60)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgb(140, 140, 170)' }}>Assessment:</span>
                        <span style={{ fontWeight: 'bold', color: negotiationResult.is_fair ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)' }}>
                          {negotiationResult.assessment || 'Overpriced'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgb(140, 140, 170)' }}>Suggested Offer:</span>
                        <span style={{ fontWeight: 'bold' }}>{formatLakhs(negotiationResult.suggested_offer || result.predicted_price * 0.95)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'rgb(140, 140, 170)' }}>Walk-away Price:</span>
                        <span style={{ fontWeight: 'bold', color: 'rgb(248, 113, 113)' }}>{formatLakhs(negotiationResult.walk_away_price || result.predicted_price * 1.02)}</span>
                      </div>
                      
                      <div style={{ color: 'rgb(140, 140, 170)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Tips:</div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'rgb(240, 240, 250)' }}>
                        {(negotiationResult.tips || [
                          'Highlight the upcoming major service cost due to km driven.',
                          'Point out the slight depreciation trend for this specific model year.'
                        ]).map((tip: string, i: number) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* AI Recommendation */}
          <section style={{ backgroundColor: 'rgb(16, 16, 24)', borderRadius: '16px', padding: '2rem', border: '1px solid rgb(40, 40, 60)', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.2rem', marginBottom: '1rem', color: 'rgb(99, 102, 241)' }}>AI Recommendation</h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'rgb(240, 240, 250)' }}>
              {result.ai_recommendation || 'Based on current market trends and the specific condition of this vehicle, it presents a solid buying opportunity. The depreciation curve is flattening, meaning it will retain value well over the next 2-3 years. Ensure a thorough mechanic inspection before finalizing.'}
            </p>
          </section>

          {/* Comparable Vehicles */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Comparable Vehicles</h2>
            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
              {comparables.map((comp: any) => (
                <div key={comp.id} style={{ minWidth: '280px', backgroundColor: 'rgb(22, 22, 34)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgb(40, 40, 60)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{comp.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: 'rgb(99, 102, 241)', fontWeight: 'bold' }}>{formatLakhs(comp.price)}</div>
                    <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'rgb(99, 102, 241)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      Score: {comp.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
