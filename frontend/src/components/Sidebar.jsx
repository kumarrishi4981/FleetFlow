import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Truck, Package, Route, Zap, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { ThemeContext } from '../context/ThemeContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Fleet Map' },
  { to: '/vehicles', icon: Truck, label: 'Vehicles' },
  { to: '/orders', icon: Package, label: 'Orders' },
  { to: '/routes', icon: Route, label: 'Route Optimizer' },
  { to: '/dispatch', icon: Zap, label: 'Dispatch' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onClose }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <Logo className="sidebar-logo-icon" />
        <span>FleetFlow</span>
      </div>
      <nav className="sidebar-menu">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer-theme">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Light/Dark Mode">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
      <button className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </aside>
  );
}


