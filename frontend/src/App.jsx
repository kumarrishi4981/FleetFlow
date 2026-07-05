import { useState, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FleetMap from './pages/FleetMap';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Orders from './pages/Orders';
import RouteOptimizer from './pages/RouteOptimizer';
import Dispatch from './pages/Dispatch';
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
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<FleetMap />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/routes" element={<RouteOptimizer />} />
          <Route path="/dispatch" element={<Dispatch />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

