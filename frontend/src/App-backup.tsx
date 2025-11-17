/**
 * Main App Component
 * Root component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { BuyerHome } from './pages/BuyerHome';
import './i18n/config'; // Initialize i18next

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Main app layout with nested routes */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<BuyerHome />} />
          <Route path="/projects" element={<div style={{ padding: '2rem' }}>Projects Page (Coming Soon)</div>} />
          <Route path="/catalog" element={<div style={{ padding: '2rem' }}>Catalog Page (Coming Soon)</div>} />
          <Route path="/profile" element={<div style={{ padding: '2rem' }}>Profile Page (Coming Soon)</div>} />
          <Route path="/factories" element={<div style={{ padding: '2rem' }}>Factories Page (Coming Soon)</div>} />
          <Route path="/orders" element={<div style={{ padding: '2rem' }}>Orders Page (Coming Soon)</div>} />
          <Route path="/settings" element={<div style={{ padding: '2rem' }}>Settings Page (Coming Soon)</div>} />
          <Route path="/notifications" element={<div style={{ padding: '2rem' }}>Notifications Page (Coming Soon)</div>} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <h1 style={{ fontSize: '3rem', margin: 0 }}>404</h1>
            <p>Page not found</p>
            <a href="/home" style={{ color: '#4CAF50', textDecoration: 'underline' }}>Go to Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
