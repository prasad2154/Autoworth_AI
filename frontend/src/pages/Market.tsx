import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, TrendingUp, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#34d399', '#f87171', '#fb923c', '#a78bfa'];

const mockSummary = {
  averagePrice: '8.45',
  totalListings: 12450,
  popularBrand: 'Maruti Suzuki',
  priceTrend: '+2.4%'
};

const brandData = [
  { name: 'Maruti Suzuki', count: 4200 },
  { name: 'Hyundai', count: 3100 },
  { name: 'Tata', count: 2100 },
  { name: 'Mahindra', count: 1500 },
  { name: 'Kia', count: 850 }
];

const priceRangeData = [
  { range: '0-5L', count: 2100 },
  { range: '5-10L', count: 4500 },
  { range: '10-15L', count: 3200 },
  { range: '15-20L', count: 1800 },
  { range: '20L+', count: 850 }
];

const fuelTypeData = [
  { name: 'Petrol', value: 65 },
  { name: 'Diesel', value: 25 },
  { name: 'CNG', value: 8 },
  { name: 'EV', value: 2 }
];

const insights = [
  { title: 'EV Adoption Rising', desc: 'Used EV listings have grown by 45% in top metros over the last quarter.', icon: TrendingUp, color: '#34d399' },
  { title: 'SUV Dominance', desc: 'SUVs now make up 42% of the total used car market, overtaking hatchbacks.', icon: Activity, color: '#6366f1' },
  { title: 'Price Stabilization', desc: 'Average asking prices have stabilized after a 2-year inflationary period.', icon: TrendingUp, color: '#fb923c' }
];

export default function Market() {
  const [summary, setSummary] = useState(mockSummary);

  return (
    <div style={{ backgroundColor: 'rgb(10 10 15)', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'rgb(240 240 250)', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '32px', margin: '0 0 8px 0' }}>Market Intelligence</h1>
            <p style={{ color: 'rgb(140 140 170)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: 'rgb(52 211 153)', borderRadius: '50%' }}></span>
              Live Market Data
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', backgroundColor: 'rgb(16 16 24)', padding: '16px', borderRadius: '12px', border: '1px solid rgb(40 40 60)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: 'rgb(140 140 170)', marginBottom: '4px' }}>Brand</label>
              <select className="input-field" style={{ backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: 'white', padding: '8px 12px', borderRadius: '6px' }}>
                <option>All Brands</option>
                <option>Maruti Suzuki</option>
                <option>Hyundai</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: 'rgb(140 140 170)', marginBottom: '4px' }}>City</label>
              <select className="input-field" style={{ backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)', color: 'white', padding: '8px 12px', borderRadius: '6px' }}>
                <option>Pan India</option>
                <option>Mumbai</option>
                <option>Delhi NCR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {[
            { label: 'Average Price', value: `₹${summary.averagePrice}L` },
            { label: 'Total Listings', value: summary.totalListings.toLocaleString() },
            { label: 'Popular Brand', value: summary.popularBrand },
            { label: 'Price Trend', value: summary.priceTrend, highlight: true }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card" style={{ backgroundColor: 'rgb(16 16 24)', padding: '24px', borderRadius: '16px', border: '1px solid rgb(40 40 60)' }}>
              <p style={{ color: 'rgb(140 140 170)', fontSize: '14px', margin: '0 0 8px 0' }}>{stat.label}</p>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', margin: 0, color: stat.highlight ? 'rgb(52 211 153)' : 'inherit' }}>{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="card" style={{ backgroundColor: 'rgb(16 16 24)', padding: '24px', borderRadius: '16px', border: '1px solid rgb(40 40 60)' }}>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', marginBottom: '24px' }}>Brand Distribution</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandData} layout="vertical" margin={{ left: 40 }}>
                  <XAxis type="number" stroke="rgb(140 140 170)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="rgb(140 140 170)" fontSize={12} width={80} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)' }} />
                  <Bar dataKey="count" fill="rgb(99 102 241)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'rgb(16 16 24)', padding: '24px', borderRadius: '16px', border: '1px solid rgb(40 40 60)' }}>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', marginBottom: '24px' }}>Price Range Distribution</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceRangeData}>
                  <XAxis dataKey="range" stroke="rgb(140 140 170)" fontSize={12} />
                  <YAxis stroke="rgb(140 140 170)" fontSize={12} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)' }} />
                  <Bar dataKey="count" fill="rgb(52 211 153)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'rgb(16 16 24)', padding: '24px', borderRadius: '16px', border: '1px solid rgb(40 40 60)' }}>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', marginBottom: '24px' }}>Fuel Type</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fuelTypeData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {fuelTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'rgb(140 140 170)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insights & Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          <div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', marginBottom: '16px' }}>Key Insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {insights.map((insight, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', backgroundColor: 'rgb(16 16 24)', padding: '20px', borderRadius: '12px', border: '1px solid rgb(40 40 60)' }}>
                  <div style={{ backgroundColor: 'rgb(22 22 34)', padding: '12px', borderRadius: '50%', height: 'fit-content' }}>
                    <insight.icon size={24} color={insight.color} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontFamily: 'Manrope, sans-serif' }}>{insight.title}</h4>
                    <p style={{ margin: 0, color: 'rgb(140 140 170)', fontSize: '14px', lineHeight: '1.5' }}>{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'rgb(16 16 24)', padding: '24px', borderRadius: '16px', border: '1px solid rgb(40 40 60)' }}>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', marginBottom: '16px' }}>Top Brands</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgb(40 40 60)', color: 'rgb(140 140 170)', fontSize: '14px' }}>
                  <th style={{ paddingBottom: '12px', fontWeight: 'normal' }}>Brand</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 'normal' }}>Avg Price</th>
                  <th style={{ paddingBottom: '12px', fontWeight: 'normal', textAlign: 'right' }}>Listings</th>
                </tr>
              </thead>
              <tbody>
                {brandData.map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgb(40 40 60)' }}>
                    <td style={{ padding: '16px 0', fontFamily: 'Manrope, sans-serif' }}>{b.name}</td>
                    <td style={{ padding: '16px 0', color: 'rgb(52 211 153)' }}>₹{(Math.random() * 5 + 4).toFixed(2)}L</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', color: 'rgb(140 140 170)' }}>{b.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
