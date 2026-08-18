import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgb(22 22 34)',
              color: 'rgb(240 240 250)',
              border: '1px solid rgb(40 40 60)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
            success: { iconTheme: { primary: '#34d399', secondary: 'rgb(22 22 34)' } },
            error: { iconTheme: { primary: '#f87171', secondary: 'rgb(22 22 34)' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
