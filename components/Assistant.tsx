import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Loader2, Mic, MicOff, MapPin, ExternalLink } from 'lucide-react';

// Type definition for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const Assistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Marhaba! I am TEOS, your personal Egypt guide. Ask me about hidden gems, visa requirements, or the best time to visit the Pyramids.",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Create a placeholder for the bot response
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      isStreaming: true
    }]);

    try {
      const stream = GeminiService.createChatStream(history, userMsg.text);
      let fullText = '';
      let allChunks: any[] = [];

      for await (const chunk of stream) {
        if (chunk.text) fullText += chunk.text;
        if (chunk.groundingChunks) {
          allChunks = [...allChunks, ...chunk.groundingChunks];
        }

        setMessages(prev => prev.map(m => 
          m.id === botMsgId ? { ...m, text: fullText, groundingChunks: allChunks } : m
        ));
      }
      
      setMessages(prev => prev.map(m => 
        m.id === botMsgId ? { ...m, isStreaming: false } : m
      ));

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(m => 
        m.id === botMsgId ? { ...m, text: "Connection interrupted. Please try again.", isStreaming: false } : m
      ));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in transition-colors">
      {/* Header */}
      <div className="bg-slate-900 dark:bg-slate-950 p-4 flex items-center gap-3 text-white">
        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold">TEOS Guide</h2>
          <p className="text-xs text-slate-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Online
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-900 dark:bg-slate-700 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
            }`}>
              {msg.text}
              {msg.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-amber-500 animate-pulse"></span>
              )}

              {/* Grounding Sources */}
              {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                 <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Sources & Maps</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingChunks.map((chunk, idx) => {
                          if (chunk.maps) {
                             return (
                               <a key={idx} href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-blue-600 dark:text-blue-400">
                                 <MapPin className="w-3 h-3 text-amber-500" />
                                 <span className="truncate max-w-[150px]">{chunk.maps.title || "View Map"}</span>
                               </a>
                             )
                          }
                          if (chunk.web) {
                             return (
                               <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-blue-600 dark:text-blue-400">
                                 <ExternalLink className="w-3 h-3 text-slate-400" />
                                 <span className="truncate max-w-[150px]">{chunk.web.title || "Source"}</span>
                               </a>
                             )
                          }
                          return null;
                      })}
                    </div>
                 </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            title="Toggle voice input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask anything about traveling in Egypt..."}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assistant;