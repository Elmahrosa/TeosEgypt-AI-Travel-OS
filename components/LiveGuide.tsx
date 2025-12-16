import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { Mic, MicOff, Volume2, Activity, AlertCircle, PhoneOff } from 'lucide-react';
import { LiveServerMessage, Modality } from '@google/genai';

const LiveGuide: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Playback Refs
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const cleanupAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // Stop all playing audio
    audioQueueRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    audioQueueRef.current = [];
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    setError(null);
    try {
      // 1. Initialize Audio Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 }); // Output rate
      
      // CRITICAL: Resume audio context if suspended (browser autoplay policy)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      audioContextRef.current = audioCtx;
      
      // Input context (often needs 16kHz for best results, but we can downsample)
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }
      
      // 2. Get User Media
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        throw new Error("Microphone access denied. Please enable permissions.");
      }
      streamRef.current = stream;

      // 3. Setup Gemini Connection
      sessionPromiseRef.current = GeminiService.connectLive(
        {
          onopen: () => {
            setIsConnected(true);
            console.log("Live Session Connected");
            
            // Start Audio Streaming
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                   session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            
            source.connect(processor);
            processor.connect(inputCtx.destination);
            
            inputSourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
               setIsSpeaking(true);
               
               // Decode
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 audioContextRef.current,
                 24000, 
                 1
               );

               // Schedule Playback
               const ctx = audioContextRef.current;
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(ctx.destination);
               
               // Calculate start time to ensure gapless playback
               const currentTime = ctx.currentTime;
               if (nextStartTimeRef.current < currentTime) {
                  nextStartTimeRef.current = currentTime;
               }
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               
               audioQueueRef.current.push(source);
               
               source.onended = () => {
                  audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
                  if (audioQueueRef.current.length === 0) {
                      setIsSpeaking(false);
                  }
               };
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
                audioQueueRef.current.forEach(s => {
                    try { s.stop(); } catch(e) {}
                });
                audioQueueRef.current = [];
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
            }
          },
          onclose: () => {
            setIsConnected(false);
            cleanupAudio();
          },
          onerror: (err: any) => {
            console.error("Session Error", err);
            setError("Connection disrupted.");
            setIsConnected(false);
            cleanupAudio();
          }
        },
        {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are TEOS, a helpful, warm, and knowledgeable Egyptian travel guide. Speak naturally, be concise, and help the user with travel questions about Egypt.",
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      );

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to start session.");
      cleanupAudio();
    }
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            session.close();
        });
    }
    cleanupAudio();
    setIsConnected(false);
    setIsSpeaking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6">
       <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Live Guide Mode</h1>
          <p className="text-slate-500 dark:text-slate-400">Have a natural, real-time conversation with TEOS.</p>
       </div>

       <div className="relative">
          {/* Status Rings */}
          {isConnected && (
            <>
               <div className={`absolute inset-0 rounded-full bg-amber-500/20 blur-3xl animate-pulse transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
               <div className={`absolute inset-0 rounded-full border-2 border-amber-500/30 animate-[spin_4s_linear_infinite]`}></div>
            </>
          )}

          <div className="relative z-10 w-64 h-64 bg-slate-900 dark:bg-slate-950 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-slate-800 transition-all duration-500">
             {isConnected ? (
                <div className="flex flex-col items-center gap-4">
                   {isSpeaking ? (
                     <Volume2 className="w-16 h-16 text-amber-500 animate-bounce" />
                   ) : (
                     <div className="flex gap-1 h-8 items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                        <div className="w-2 h-4 bg-amber-500 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                     </div>
                   )}
                   <span className="text-amber-500 font-medium tracking-widest text-sm uppercase">
                      {isSpeaking ? "TEOS Speaking" : "Listening..."}
                   </span>
                </div>
             ) : (
                <MicOff className="w-16 h-16 text-slate-600" />
             )}
          </div>
       </div>

       <div className="mt-12 flex flex-col items-center gap-4">
          {!isConnected ? (
            <button 
              onClick={startSession}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-3 transition-transform hover:scale-105"
            >
              <Mic className="w-5 h-5" />
              Start Conversation
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full shadow-lg shadow-red-500/30 flex items-center gap-3 transition-transform hover:scale-105"
            >
              <PhoneOff className="w-5 h-5" />
              End Session
            </button>
          )}

          {error && (
             <div className="flex items-center gap-2 text-red-500 text-sm mt-4 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
             </div>
          )}
       </div>
    </div>
  );
};

// --- Audio Utils ---

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default LiveGuide;