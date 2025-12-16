import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import Explore from './components/Explore';
import Assistant from './components/Assistant';
import Checkout from './components/Checkout';
import { Menu } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
          <div className="font-bold text-xl text-slate-900 dark:text-white">TEOS.EG</div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
