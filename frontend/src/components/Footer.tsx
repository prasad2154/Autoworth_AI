import { Link } from 'react-router-dom';
import { Car, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      background: 'rgb(10 10 15)',
      borderTop: '1px solid rgb(40 40 60 / 0.4)',
      padding: '48px 24px 24px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Car size={16} color="white" />
              </div>
              <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem', color: 'rgb(240 240 250)' }}>
                AutoWorth<span style={{ color: 'rgb(129 140 248)' }}> AI</span>
              </span>
            </div>
            <p style={{ color: 'rgb(100 100 130)', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: 240 }}>
              AI-powered vehicle valuation & market intelligence. Know what your car is worth.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <button key={i} style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgb(22 22 34)', border: '1px solid rgb(40 40 60)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}>
                  <Icon size={15} color="rgb(140 140 170)" />
                </button>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Product',
              links: [
                { label: 'Value My Car', to: '/valuation' },
                { label: 'Market Intelligence', to: '/market' },
                { label: 'Compare Cars', to: '/compare' },
                { label: 'Price Alerts', to: '/alerts' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Valuation History', to: '/history' },
                { label: 'Saved Cars', to: '/saved-cars' },
                { label: 'Profile', to: '/profile' },
              ],
            },
          ].map(section => (
            <div key={section.title}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgb(140 140 170)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
                {section.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {section.links.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{ color: 'rgb(120 120 150)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgb(200 200 230)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgb(120 120 150)')}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgb(40 40 60 / 0.4)',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ color: 'rgb(80 80 110)', fontSize: '0.8125rem' }}>
            © 2026 AutoWorth AI. All rights reserved.
          </p>
          <p style={{ color: 'rgb(60 60 90)', fontSize: '0.75rem' }}>
            ⚠️ Synthetic data only — Not for real financial decisions
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

