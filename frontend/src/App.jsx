import { useState } from 'react';
import { LayoutDashboard, Upload, TrendingUp, Package, Settings as SettingsIcon, Menu, LogOut, User, Users } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import Forecast from './pages/Forecast';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Login from './pages/Login';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout, loading } = useAuth();

  // Initialize Theme and Accent on Load
  useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedAccent = localStorage.getItem('accent') || 'blue';
    const root = window.document.documentElement;

    // Theme
    root.classList.remove('light', 'dark');
    if (savedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(savedTheme);
    }

    // Accent
    const accentMap = {
      blue: '217.2 91.2% 59.8%',
      purple: '262.1 83.3% 57.8%',
      emerald: '160.6 84.1% 39.4%',
      rose: '346.8 77.2% 49.8%',
      amber: '37.7 92.1% 50.2%'
    };
    root.style.setProperty('--primary', accentMap[savedAccent] || accentMap.blue);
  });

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <UploadData />;
      case 'forecast':
        return <Forecast />;
      case 'inventory':
        return <Inventory />;
      case 'settings':
        return <Settings />;
      case 'team':
        return <Team />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">RetailSight</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-muted rounded-lg">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} expanded={isSidebarOpen} />
          <NavItem icon={<Upload size={20} />} label="Data Upload" active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} expanded={isSidebarOpen} />
          <NavItem icon={<TrendingUp size={20} />} label="Forecast Models" active={activeTab === 'forecast'} onClick={() => setActiveTab('forecast')} expanded={isSidebarOpen} />
          <NavItem icon={<Package size={20} />} label="Inventory Plan" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} expanded={isSidebarOpen} />
          <NavItem icon={<Users size={20} />} label="Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} expanded={isSidebarOpen} />
          <NavItem icon={<SettingsIcon size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} expanded={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-border">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.username}</p>
                <button onClick={logout} className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1">
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const NavItem = ({ icon, label, active, onClick, expanded }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-white'}`}
  >
    <span className="shrink-0">{icon}</span>
    {expanded && <span className="ml-3 font-medium whitespace-nowrap">{label}</span>}
  </button>
);

export default App;
