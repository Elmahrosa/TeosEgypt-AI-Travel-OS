import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { Upload, Wand2, Download, Image as ImageIcon, Loader2, X } from 'lucide-react';

const PhotoLab: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Extract base64 data and mime type
      const [mimePrefix, base64Data] = selectedImage.split(';base64,');
      const mimeType = mimePrefix.split(':')[1];

      const resultUrl = await GeminiService.editImage(base64Data, mimeType, prompt);
      setGeneratedImage(resultUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wand2 className="text-amber-500" />
          TEOS Photo Lab
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Use AI to edit, enhance, or transform your Egypt travel photos instantly.
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Editor Controls */}
        <div className="flex flex-col gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full overflow-y-auto">
          {!selectedImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-h-[300px]"
            >
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-slate-900 dark:text-white font-medium">Click to upload photo</p>
              <p className="text-sm text-slate-500 mt-1">JPG or PNG (max 5MB)</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={selectedImage} alt="Original" className="w-full max-h-[400px] object-contain bg-slate-100 dark:bg-slate-900" />
                <button 
                  onClick={handleClear}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">How would you like to edit this?</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='e.g., "Add a vintage retro filter", "Make it look like sunset", "Remove the people in the background"'
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none h-32"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Magic...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Edit
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Result Area */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-slate-800 h-full relative overflow-hidden">
            {!generatedImage && !loading && (
              <div className="text-slate-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Your masterpiece will appear here</p>
              </div>
            )}
            
            {loading && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className="text-amber-500 font-medium animate-pulse">Consulting Gemini Vision...</p>
              </div>
            )}

            {generatedImage && (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center overflow-hidden mb-4">
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                  />
                </div>
                <a 
                  href={generatedImage} 
                  download="teos-edited.png"
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </a>
              </div>
            )}
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default PhotoLab;