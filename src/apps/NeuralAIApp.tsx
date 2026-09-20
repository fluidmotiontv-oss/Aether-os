import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Send,
  User,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Code2,
  Cpu,
  Feather,
  Mic,
  MicOff,
  Radio,
  AlertCircle,
  Settings2,
  Wand2,
  Zap,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { soundEngine } from '../utils/audio';

export const NeuralAIApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      role: 'assistant',
      content: `🌌 **Aether Neural Core Online** (v3.4.1 Quantum Engine)\n\nI am your spatial operating system intelligence. I can generate code, analyze system telemetry, craft creative concepts, or synthesize solutions.\n\n*Select a mode below, type a query, or tap the **Microphone** to converse via voice.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'general',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'general' | 'coder' | 'creative' | 'diagnostic'>('general');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Web Speech API - Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [autoSpeakResponse, setAutoSpeakResponse] = useState<boolean>(false);
  const [voiceWaveLevels, setVoiceWaveLevels] = useState<number[]>([12, 24, 18, 32, 16, 28, 10]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const waveAnimRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, interimTranscript]);

  // Check Web Speech API Support on Mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Animate voice wave bars while listening
  useEffect(() => {
    if (!isListening) {
      if (waveAnimRef.current) cancelAnimationFrame(waveAnimRef.current);
      setVoiceWaveLevels([8, 12, 10, 14, 8, 12, 6]);
      return;
    }

    let frame = 0;
    const animateWave = () => {
      frame++;
      setVoiceWaveLevels([
        10 + Math.sin(frame * 0.15) * 16 + Math.random() * 12,
        14 + Math.cos(frame * 0.12) * 20 + Math.random() * 16,
        18 + Math.sin(frame * 0.2) * 24 + Math.random() * 18,
        22 + Math.cos(frame * 0.18) * 26 + Math.random() * 20,
        16 + Math.sin(frame * 0.14) * 22 + Math.random() * 14,
        12 + Math.cos(frame * 0.16) * 18 + Math.random() * 12,
        8 + Math.sin(frame * 0.1) * 12 + Math.random() * 8,
      ]);
      waveAnimRef.current = requestAnimationFrame(animateWave);
    };

    waveAnimRef.current = requestAnimationFrame(animateWave);

    return () => {
      if (waveAnimRef.current) cancelAnimationFrame(waveAnimRef.current);
    };
  }, [isListening]);

  const modes = [
    { id: 'general', name: 'Spatial Core', icon: Sparkles, color: 'text-violet-400' },
    { id: 'coder', name: 'Code Architect', icon: Code2, color: 'text-cyan-400' },
    { id: 'creative', name: 'Creative Muse', icon: Feather, color: 'text-pink-400' },
    { id: 'diagnostic', name: 'System Diagnostic', icon: Cpu, color: 'text-emerald-400' },
  ];

  const presets = [
    'Explain quantum computing in spatial OS architecture',
    'Write a shader algorithm for undulating starlight',
    'Perform full Aether kernel integrity diagnostic',
    'Compose an ambient celestial soundscape narrative',
  ];

  const handleSpeak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_>-]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Pick an expressive English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.lang.startsWith('en'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    soundEngine.playUiSound('key');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setInterimTranscript('');
    setSpeechError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          mode: activeMode,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      soundEngine.playUiSound('chime');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'Neural synthesis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak the response if voice auto-speak is enabled
      if (autoSpeakResponse && data.response) {
        handleSpeak(data.response);
      }
    } catch (err: any) {
      soundEngine.playUiSound('click');
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ *Neural flux anomaly*: Could not connect to spatial synthesis node.\n\n${err?.message || 'Offline mode active.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start / Stop Web Speech API Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError('Web Speech API is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      soundEngine.playUiSound('close');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      setSpeechError(null);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        soundEngine.playUiSound('open');
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (finalChunk) {
          setInput((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return `${prev}${separator}${finalChunk.trim()}`;
          });
          setInterimTranscript('');
          soundEngine.playUiSound('key');
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please speak clearly into your microphone.');
        } else if (event.error === 'network') {
          setSpeechError('Network anomaly during speech recognition.');
        } else {
          setSpeechError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError(err?.message || 'Failed to initialize microphone access.');
      setIsListening(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    soundEngine.playUiSound('click');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="neural-ai-app" className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Top Header Controls */}
      <div className="px-4 py-2.5 bg-slate-900/80 border-b border-white/10 flex items-center justify-between shrink-0">
        {/* Mode Selector */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setActiveMode(m.id as any);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/40'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Auto-Voice Toggle & Reset */}
        <div className="flex items-center space-x-2">
          {/* Auto-Speak Responses Toggle */}
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              setAutoSpeakResponse(!autoSpeakResponse);
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center space-x-1.5 transition-all ${
              autoSpeakResponse
                ? 'bg-violet-500/20 border-violet-400/50 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle voice auto-narration for responses"
          >
            {autoSpeakResponse ? <Volume2 className="w-3.5 h-3.5 text-violet-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Voice Mode</span>
          </button>

          {/* Clear Chat */}
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setIsSpeaking(false);
              setMessages([messages[0]]);
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isBot
                    ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {isBot ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Box */}
              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border transition-all ${
                  isBot
                    ? 'bg-slate-900/90 border-white/15 text-slate-100 shadow-lg'
                    : 'bg-violet-600 text-white border-violet-500 shadow-md'
                }`}
              >
                {/* Content with basic formatting */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Footer action buttons for Bot */}
                {isBot && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{msg.timestamp}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-white flex items-center space-x-1"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.content)}
                        className={`hover:text-white flex items-center space-x-1 ${isSpeaking ? 'text-violet-400' : ''}`}
                        title="Read aloud via Speech Synthesis"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span className="text-amber-400 font-mono text-[10px]">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Read</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Interim Transcript Bubble while speaking */}
        {isListening && interimTranscript && (
          <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-xl bg-violet-500/30 border border-violet-400/50 flex items-center justify-center text-violet-300 shrink-0">
              <Mic className="w-4 h-4 animate-bounce text-violet-400" />
            </div>
            <div className="max-w-xl rounded-2xl p-3 text-xs leading-relaxed border border-violet-500/40 bg-violet-950/40 text-violet-200 italic shadow-lg flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping shrink-0" />
              <span>"{interimTranscript}..."</span>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/90 border border-white/15 rounded-2xl px-4 py-3 text-xs text-violet-300 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              <span>Synthesizing neural response via quantum node...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Prompts Pills */}
      {messages.length < 3 && !isListening && (
        <div className="px-4 py-1.5 flex items-center space-x-2 overflow-x-auto shrink-0 bg-slate-900/40 border-t border-white/5">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-violet-600/30 hover:text-violet-200 border border-white/10 text-slate-300 whitespace-nowrap transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Active Voice Listening Banner */}
      {isListening && (
        <div className="px-4 py-2.5 bg-violet-950/80 border-t border-violet-500/30 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 relative z-10" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-violet-200">Listening to your voice...</span>
              <span className="text-[10px] text-violet-300/80">Speak naturally into your microphone</span>
            </div>

            {/* Dynamic Sound Wave Bars */}
            <div className="flex items-center space-x-1 h-6 pl-2">
              {voiceWaveLevels.map((height, idx) => (
                <div
                  key={idx}
                  style={{ height: `${Math.min(26, Math.max(4, height))}px` }}
                  className="w-1 bg-gradient-to-t from-violet-400 to-cyan-300 rounded-full transition-all duration-75"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (input.trim()) {
                  handleSend();
                } else {
                  toggleSpeechRecognition();
                }
              }}
              className="px-3 py-1 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium flex items-center space-x-1 shadow-md shadow-violet-600/40"
            >
              <span>{input.trim() ? 'Send Voice Input' : 'Stop Listening'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Speech Error Banner */}
      {speechError && (
        <div className="px-4 py-2 bg-rose-950/80 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-rose-400 hover:text-white text-[11px] underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className={`flex items-center space-x-2 bg-slate-950/80 border rounded-2xl px-3 py-1.5 transition-all ${
            isListening
              ? 'border-violet-500 ring-2 ring-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
              : 'border-white/15 focus-within:border-violet-500/80 focus-within:ring-1 focus-within:ring-violet-500/50'
          }`}
        >
          {/* Speech-to-Text Microphone Trigger Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2 rounded-xl transition-all relative ${
              isListening
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/50 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 text-violet-400 hover:text-violet-300 border border-white/10'
            }`}
            title={isListening ? 'Stop voice recording' : 'Start Speech-to-Text Voice Input (Web Speech API)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening... (Speak your thoughts)'
                : `Ask Aether ${modes.find((m) => m.id === activeMode)?.name} or click mic to talk...`
            }
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 py-1.5 px-1"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all shadow-md shadow-violet-600/30"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

