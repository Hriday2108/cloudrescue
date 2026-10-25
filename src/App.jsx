import React, { useState, Component } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/ToastContainer';
import Dashboard from './pages/Dashboard';
import BackupManager from './pages/BackupManager';
import RecoveryCenter from './pages/RecoveryCenter';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('UI Render Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong in the view</h2>
          <p style={{ color: '#ef4444' }}>{this.state.error?.message || 'Unexpected rendering error'}</p>
          <button 
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const pages = {
  dashboard: Dashboard,
  backups: BackupManager,
  recovery: RecoveryCenter,
  notifications: Notifications,
  settings: Settings,
};

function AppShell() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageComponent = pages[currentPage] || Dashboard;

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={`main-content`}>
        <Topbar
          currentPage={currentPage}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          onNavigate={setCurrentPage}
        />
        <ErrorBoundary>
          <PageComponent />
        </ErrorBoundary>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
