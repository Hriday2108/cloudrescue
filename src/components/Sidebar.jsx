import { useState } from 'react';
import {
  LayoutDashboard, Database, RotateCcw, Bell, Settings,
  Shield, ChevronRight, LogOut, HelpCircle, Zap
} from 'lucide-react';
import { mockUser } from '../data/mockData';
import { useApp } from '../context/AppContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'backups', label: 'Backup Manager', icon: Database },
  { id: 'recovery', label: 'Recovery Center', icon: RotateCcw },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, mobileOpen, onClose }) {
  const { unreadCount } = useApp();

  return (
    <>
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Shield size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <span className="brand">CloudRescue</span>
            <span className="tagline">Backup & Recovery</span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { onNavigate(item.id); onClose?.(); }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon className="nav-icon" size={18} />
                <span>{item.label}</span>
                {item.badge && unreadCount > 0 && (
                  <span className="nav-badge" aria-label={`${unreadCount} unread notifications`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* System Nav */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">System</div>
          <button className="sidebar-nav-item" aria-label="Help and documentation">
            <HelpCircle className="nav-icon" size={18} />
            <span>Help & Docs</span>
          </button>
          <button className="sidebar-nav-item" style={{ color: '#f87171' }} aria-label="Sign out">
            <LogOut className="nav-icon" size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Status */}
        <div className="sidebar-section" style={{ marginTop: 4 }}>
          <div style={{
            background: '#0d2137',
            border: '1px solid #1e3a5f',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Zap size={14} color="#34d399" />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>System Healthy</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-sidebar-text)' }}>All services operational</div>
            </div>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#34d399',
              marginLeft: 'auto', animation: 'pulse 2s infinite',
            }} />
          </div>
        </div>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{mockUser.initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{mockUser.name}</div>
              <div className="role">{mockUser.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? '' : 'hidden'}`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
}
