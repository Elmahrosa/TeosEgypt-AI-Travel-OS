import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { Search, MapPin, Star, Info, ExternalLink } from 'lucide-react';

const destinations = [
  { id: '1', name: 'Great Pyramids of Giza', image: 'https://picsum.photos/seed/pyramids/800/600', rating: 4.9, category: 'History' },
  { id: '2', name: 'Karnak Temple, Luxor', image: 'https://picsum.photos/seed/karnak/800/600', rating: 4.8, category: 'History' },
  { id: '3', name: 'Valley of the Kings', image: 'https://picsum.photos/seed/valley/800/600', rating: 4.9, category: 'Adventure' },
  { id: '4', name: 'Naama Bay, Sharm', image: 'https://picsum.photos/seed/sharm/800/600', rating: 4.7, category: 'Leisure' },
  { id: '5', name: 'Abu Simbel', image: 'https://picsum.photos/seed/abusimbel/800/600', rating: 5.0, category: 'History' },
  { id: '6', name: 'Khan el-Khalili', image: 'https://picsum.photos/seed/khan/800/600', rating: 4.6, category: 'Culture' },
];

const Explore: React.FC = () => {
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [liveInfo, setLiveInfo] = useState<{ text: string, sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLearnMore = async (placeName: string) => {
    setSelectedPlace(placeName);
    setLoading(true);
    setLiveInfo(null);
    try {
      const info = await GeminiService.getLivePlaceInfo(placeName);
      setLiveInfo(info);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Egypt</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Discover ancient wonders and modern luxuries with live data.</p>
      </header>

      {/* Grid of Destinations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <div key={dest.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-lg transition-all duration-300">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 text-slate-900">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {dest.rating}
              </div>
            </div>
            <div className="p-5">
              <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-500 px-2 py-1 rounded-md mb-2 inline-block">
                {dest.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{dest.name}</h3>
              <button 
                onClick={() => handleLearnMore(dest.name)}
                className="w-full mt-2 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Info className="w-4 h-4" />
                Get Live Insights
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal/Detail View for Live Info */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="text-amber-500" />
                {selectedPlace}
              </h2>
              <button 
                onClick={() => setSelectedPlace(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
              ) : liveInfo ? (
                <div className="space-y-6">
                  <div className="prose prose-sm text-slate-600 dark:text-slate-300">
                    <p className="leading-relaxed whitespace-pre-line">{liveInfo.text}</p>
                  </div>

                  {liveInfo.sources && liveInfo.sources.length > 0 && (
                     <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                       <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Google Maps Data & Sources</h4>
                       <ul className="space-y-2">
                         {liveInfo.sources.map((chunk, idx) => {
                            // WEB SOURCE
                            if (chunk.web) {
                               return (
                                 <li key={idx}>
                                   <a 
                                     href={chunk.web.uri} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                   >
                                     <ExternalLink className="w-3 h-3" />
                                     {chunk.web.title || chunk.web.uri}
                                   </a>
                                 </li>
                               );
                            }
                            // GOOGLE MAPS SOURCE
                            if (chunk.maps) {
                                const mapTitle = chunk.maps.title || "View on Google Maps";
                                const mapUri = chunk.maps.uri; 
                                return (
                                 <li key={idx}>
                                   <a 
                                     href={mapUri} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                                   >
                                     <MapPin className="w-3 h-3 text-amber-500" />
                                     {mapTitle}
                                   </a>
                                 </li>
                                );
                            }
                            return null;
                         })}
                       </ul>
                     </div>
                  )}
                </div>
              ) : (
                <p className="text-red-500">Could not load information.</p>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 text-center">
              <button 
                onClick={() => setSelectedPlace(null)}
                className="px-6 py-2 bg-slate-900 dark:bg-slate-950 text-white rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;