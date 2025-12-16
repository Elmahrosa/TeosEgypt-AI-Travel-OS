import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeminiService } from '../services/geminiService';
import { Itinerary, TripPace, UserPreferences } from '../types';
import { Calendar, MapPin, DollarSign, Loader2, Sparkles, Accessibility, Diamond, ArrowRight, BedDouble, Star } from 'lucide-react';

const EGYPTIAN_CITIES = [
  { id: 'cairo', name: 'Cairo', type: 'Culture', description: 'Pyramids, Museums' },
  { id: 'luxor', name: 'Luxor', type: 'History', description: 'Valley of Kings' },
  { id: 'aswan', name: 'Aswan', type: 'Relax', description: 'Nile, Nubia' },
  { id: 'alex', name: 'Alexandria', type: 'Coast', description: 'Library, Sea' },
  { id: 'sharm', name: 'Sharm El-Sheikh', type: 'Resort', description: 'Diving, Nightlife' },
  { id: 'hurghada', name: 'Hurghada', type: 'Resort', description: 'Beaches, Family' },
  { id: 'siwa', name: 'Siwa Oasis', type: 'Nature', description: 'Desert, Springs' },
];

const Planner: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  
  // Advanced Form State
  const [prefs, setPrefs] = useState<UserPreferences>({
    selectedCities: [],
    duration: '7 days',
    interests: 'Ancient History & Local Food',
    budget: 'Mid-range',
    pace: 'Moderate',
    needsAccessibility: false,
    useTeosLoyalty: false
  });

  const toggleCity = (cityName: string) => {
    setPrefs(prev => {
      const cities = prev.selectedCities.includes(cityName)
        ? prev.selectedCities.filter(c => c !== cityName)
        : [...prev.selectedCities, cityName];
      return { ...prev, selectedCities: cities };
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prefs.selectedCities.length === 0) {
      alert("Please select at least one city to visit.");
      return;
    }
    setLoading(true);
    setItinerary(null);
    try {
      const result = await GeminiService.generateItinerary(prefs);
      setItinerary(result);
    } catch (error) {
      alert("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (itinerary) {
      navigate('/checkout', { state: { itinerary, prefs } });
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-amber-500" />
          AI Trip Planner
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your preferences for a bespoke Egyptian journey.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Wizard */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 sticky top-6 transition-colors">
            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* Core Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Destinations</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {EGYPTIAN_CITIES.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => toggleCity(city.name)}
                      className={`text-left p-2 rounded-xl border text-xs transition-all ${
                        prefs.selectedCities.includes(city.name)
                          ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-slate-900 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-700/50 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="font-bold">{city.name}</div>
                      <div className="text-[10px] opacity-70">{city.description}</div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                        type="text" 
                        value={prefs.duration}
                        onChange={(e) => setPrefs({...prefs, duration: e.target.value})}
                        className="w-full pl-9 pr-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white text-sm"
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                        value={prefs.budget}
                        onChange={(e) => setPrefs({...prefs, budget: e.target.value})}
                        className="w-full pl-9 pr-2 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white text-sm appearance-none"
                        >
                        <option>Budget</option>
                        <option>Mid-range</option>
                        <option>Luxury</option>
                        <option>Ultra</option>
                        </select>
                    </div>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Interests</label>
                  <textarea 
                    value={prefs.interests}
                    onChange={(e) => setPrefs({...prefs, interests: e.target.value})}
                    className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none h-20 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Preferences</h3>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pace</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['Relaxed', 'Moderate', 'Fast-paced'] as TripPace[]).map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPrefs({...prefs, pace: p})}
                                className={`text-xs py-2 px-1 rounded-lg border transition-all ${
                                    prefs.pace === p 
                                    ? 'bg-amber-500 border-amber-500 text-slate-900 font-bold' 
                                    : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                        <Accessibility className="w-4 h-4" />
                        Accessibility Needs
                    </div>
                    <input 
                        type="checkbox" 
                        checked={prefs.needsAccessibility}
                        onChange={(e) => setPrefs({...prefs, needsAccessibility: e.target.checked})}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                        <Diamond className={`w-4 h-4 ${prefs.useTeosLoyalty ? 'text-amber-500' : ''}`} />
                        TEOS Loyalty
                    </div>
                    <div 
                        onClick={() => setPrefs({...prefs, useTeosLoyalty: !prefs.useTeosLoyalty})}
                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                            prefs.useTeosLoyalty ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-600'
                        }`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                            prefs.useTeosLoyalty ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                    </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-slate-900 dark:bg-slate-950 text-white font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-500" />}
                {loading ? 'Designing Trip...' : 'Generate Itinerary'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 border-dashed">
              <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
              <p className="animate-pulse">Consulting TEOS AI & Finding Hotels...</p>
            </div>
          )}

          {!loading && !itinerary && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 border-dashed">
              <Sparkles className="w-12 h-12 mb-4 opacity-20" />
              <p>Select your destinations to begin.</p>
            </div>
          )}

          {itinerary && !loading && (
            <div className="space-y-6 pb-20">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">{itinerary.tripTitle}</h2>
                    <p className="text-slate-300 leading-relaxed mb-4">{itinerary.summary}</p>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        Estimated Total: <span className="font-bold text-white">{itinerary.totalEstimatedCost || "$0"}</span>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              </div>

              <div className="space-y-4">
                {itinerary.days.map((day) => (
                  <div key={day.day} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 font-bold rounded-lg text-sm">
                          D{day.day}
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{day.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <MapPin className="w-3 h-3" /> {day.location}
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                        {day.estimatedCost}
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-4">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>

                    {day.accommodation && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                             <BedDouble className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{day.accommodation.name}</h4>
                                <span className="flex items-center text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 px-1.5 py-0.5 rounded">
                                  <Star className="w-3 h-3 fill-current mr-0.5" />
                                  {day.accommodation.rating}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{day.accommodation.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Booking Action */}
              <div className="fixed bottom-6 right-6 lg:absolute lg:bottom-auto lg:right-auto lg:mt-8 flex justify-end z-20">
                <button 
                    onClick={handleCheckout}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 px-8 rounded-full shadow-xl shadow-amber-500/30 flex items-center gap-3 transform hover:scale-105 transition-all"
                >
                    Book this Trip
                    <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Planner;