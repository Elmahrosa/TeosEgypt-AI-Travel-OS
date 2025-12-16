import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { Sun, Wind, Thermometer, TrendingUp, Users, Wallet, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const visitData = [
  { name: 'Jan', visitors: 4000 },
  { name: 'Feb', visitors: 3000 },
  { name: 'Mar', visitors: 2000 },
  { name: 'Apr', visitors: 2780 },
  { name: 'May', visitors: 1890 },
  { name: 'Jun', visitors: 2390 },
];

const weatherData = [
  { time: '6am', temp: 22 },
  { time: '9am', temp: 26 },
  { time: '12pm', temp: 32 },
  { time: '3pm', temp: 34 },
  { time: '6pm', temp: 29 },
  { time: '9pm', temp: 25 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    borderRadius: '8px', 
    border: 'none', 
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
    color: theme === 'dark' ? '#fff' : '#0f172a'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">AI Trip Planner</h1>
        <p className="text-xl text-slate-500 dark:text-slate-400">
          Tell us your preferences, and TEOS will craft the perfect journey.
        </p>
      </header>

      {/* Hero / Quick Action */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl -mr-24 -mt-24 animate-pulse"></div>
        <div className="relative z-10 flex flex-col items-start gap-6 max-w-2xl">
          <div>
            <h2 className="text-3xl font-bold mb-3">Your personal travel operating system.</h2>
            <p className="text-slate-300 text-lg">
              Experience Egypt like never before. From hidden gems to seamless logistics, 
              TEOS handles the details so you can handle the adventure.
            </p>
          </div>
          <button 
            onClick={() => navigate('/planner')}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 transform hover:translate-x-1"
          >
            Start Planning Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Avg. Temperature" 
          value="32°C" 
          icon={<Thermometer className="w-6 h-6 text-orange-600" />} 
          color="bg-orange-100 dark:bg-orange-900/30"
        />
        <StatCard 
          title="Tourist Influx" 
          value="High" 
          icon={<TrendingUp className="w-6 h-6 text-green-600" />} 
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard 
          title="TEOS Token" 
          value="$0.15 USD" 
          icon={<Wallet className="w-6 h-6 text-blue-600" />} 
          color="bg-blue-100 dark:bg-blue-900/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Visitor Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Visitor Trends (Cairo)</h3>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: theme === 'dark' ? '#334155' : '#f8fafc'}}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="visitors" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's Forecast (Giza)</h3>
            <div className="flex gap-2 text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="temp" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
