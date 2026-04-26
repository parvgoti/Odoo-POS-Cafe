import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  LayoutDashboard, Package, CreditCard, Building2, Monitor,
  Smartphone, ChefHat, BarChart3, Settings, ChevronLeft,
  LogOut, Coffee, User, ShoppingBag
} from 'lucide-react';
import './sidebar.css';

const iconMap = {
  LayoutDashboard, Package, ShoppingBag, CreditCard, Building2, Monitor,
  Smartphone, ChefHat, BarChart3, Settings
};

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/orders', label: 'Orders', icon: 'ShoppingBag' },
  { path: '/products', label: 'Products', icon: 'Package' },
  { path: '/payment-methods', label: 'Payment Methods', icon: 'CreditCard' },
  { path: '/floor-plans', label: 'Floor Plans', icon: 'Building2' },
  { path: '/sessions', label: 'POS Sessions', icon: 'Monitor' },
  { path: '/self-ordering', label: 'Self Ordering', icon: 'Smartphone' },
  { path: '/kitchen', label: 'Kitchen Display', icon: 'ChefHat' },
  { path: '/reports', label: 'Reports', icon: 'BarChart3' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Coffee size={24} className="sidebar-logo-icon" />
            {!collapsed && <span className="sidebar-logo-text">Odoo POS Cafe</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft size={18} className={`sidebar-toggle-icon ${collapsed ? 'rotated' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = iconMap[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className="sidebar-link-icon" />
                {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-sm">
              {profile?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{profile?.name || 'Staff'}</span>
                <span className="sidebar-user-role">{profile?.role || 'staff'}</span>
              </div>
            )}
          </div>
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
