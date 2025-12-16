import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Calendar, MessageSquareText, Sun, Moon, Pyramid } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/planner', label: 'Trip Planner', icon: Calendar },
    { path: '/explore', label: 'Explore Egypt', icon: Map },
    { path: '/assistant', label: 'TEOS Guide', icon: MessageSquareText },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-20 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Pyramid className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-bold tracking-wider">TEOS<span className="text-amber-500">.EG</span></span>
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if active: exact match for root, or starts with path for others (to handle sub-routes if any)
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button 
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;