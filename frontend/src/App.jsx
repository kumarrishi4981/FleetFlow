import { useState, useContext, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Pages - lazy load for optimal bundle size
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FleetMap = lazy(() => import('./pages/FleetMap'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));
const Orders = lazy(() => import('./pages/Orders'));
const RouteOptimizer = lazy(() => import('./pages/RouteOptimizer'));
const Dispatch = lazy(() => import('./pages/Dispatch'));

import { Menu, Sun, Moon } from 'lucide-react';
import Logo from './components/Logo';
import { ThemeContext } from './context/ThemeContext';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="mobile-logo">
          <Logo size={24} />
          <span className="mobile-brand-text">FleetFlow</span>
        </div>
        <button className="mobile-theme-btn" onClick={toggleTheme} style={{ marginLeft: 'auto' }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="main-content">
        <Suspense fallback={
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Loading module...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<FleetMap />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/routes" element={<RouteOptimizer />} />
            <Route path="/dispatch" element={<Dispatch />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;

