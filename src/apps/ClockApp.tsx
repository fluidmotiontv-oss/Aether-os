import React, { useState, useEffect } from 'react';
import {
  Clock as ClockIcon,
  Globe,
  Hourglass,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const ClockApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'world' | 'pomodoro' | 'stopwatch'>('world');
  const [time, setTime] = useState(new Date());

  // Pomodoro State (25 min default)
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);

  // Stopwatch State
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro timer tick
  useEffect(() => {
    let interval: any;
    if (isPomoRunning) {
      interval = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds((s) => s - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes((m) => m - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished
          soundEngine.playUiSound('chime');
          setIsPomoRunning(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoMinutes, pomoSeconds]);

  // Stopwatch tick
  useEffect(() => {
    let interval: any;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchMs((ms) => ms + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const worldCities = [
    { name: 'Universal UQT', timeZone: 'UTC', label: 'Quantum Meridian' },
    { name: 'Tokyo', timeZone: 'Asia/Tokyo', label: 'Neo-Edo Grid' },
    { name: 'Geneva / CERN', timeZone: 'Europe/Zurich', label: 'Particle Node' },
    { name: 'London', timeZone: 'Europe/London', label: 'Greenwich' },
    { name: 'New York', timeZone: 'America/New_York', label: 'Eastern Meridian' },
    { name: 'San Francisco', timeZone: 'America/Los_Angeles', label: 'Pacific Hub' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none">
      {/* Top Tabs */}
      <div className="px-4 py-2 bg-slate-900/80 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-xs text-white">Chronos Spatial Clock</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              setActiveTab('world');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'world'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            World Meridians
          </button>
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              setActiveTab('pomodoro');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            Circadian Focus
          </button>
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              setActiveTab('stopwatch');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'stopwatch'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            Precision Stopwatch
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center">
        {activeTab === 'world' && (
          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {worldCities.map((c) => {
              const cityTime = new Date().toLocaleTimeString('en-US', {
                timeZone: c.timeZone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              return (
                <div
                  key={c.name}
                  className="p-4 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between space-y-2 hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-white">{c.name}</span>
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-indigo-200">{cityTime}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{c.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'pomodoro' && (
          <div className="flex flex-col items-center space-y-6 text-center">
            {/* Timer Dial */}
            <div className="relative w-52 h-52 rounded-full border-4 border-indigo-500/30 bg-slate-900/80 flex flex-col items-center justify-center shadow-2xl shadow-indigo-500/20">
              <span className="text-5xl font-bold font-mono text-white">
                {String(pomoMinutes).padStart(2, '0')}:{String(pomoSeconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-indigo-300 mt-1 uppercase tracking-widest font-mono">
                {isPomoRunning ? 'Deep Focus Active' : 'Circadian Mode'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setIsPomoRunning(!isPomoRunning);
                }}
                className={`px-6 py-2.5 rounded-2xl font-medium flex items-center space-x-2 text-sm transition-all shadow-lg ${
                  isPomoRunning
                    ? 'bg-amber-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isPomoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPomoRunning ? 'Pause Flow' : 'Start Focus Session'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setIsPomoRunning(false);
                  setPomoMinutes(25);
                  setPomoSeconds(0);
                }}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'stopwatch' && (
          <div className="flex flex-col items-center space-y-6 text-center">
            {/* Stopwatch Display */}
            <div className="text-6xl font-bold font-mono tracking-tighter bg-gradient-to-r from-indigo-200 via-cyan-200 to-white bg-clip-text text-transparent">
              {Math.floor(stopwatchMs / 60000)
                .toString()
                .padStart(2, '0')}
              :
              {Math.floor((stopwatchMs % 60000) / 1000)
                .toString()
                .padStart(2, '0')}
              .
              {Math.floor((stopwatchMs % 1000) / 10)
                .toString()
                .padStart(2, '0')}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setIsStopwatchRunning(!isStopwatchRunning);
                }}
                className={`px-6 py-2.5 rounded-2xl font-medium flex items-center space-x-2 text-sm transition-all shadow-lg ${
                  isStopwatchRunning
                    ? 'bg-amber-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isStopwatchRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isStopwatchRunning ? 'Stop' : 'Start'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setIsStopwatchRunning(false);
                  setStopwatchMs(0);
                }}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
