import React, { useState, useEffect } from 'react';
import { Sparkles, Fingerprint, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  userName: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({ isLocked, onUnlock, userName }) => {
  const [time, setTime] = useState(new Date());
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isLocked) return null;

  const handleUnlock = () => {
    setIsUnlocking(true);
    soundEngine.playUiSound('warp');
    setTimeout(() => {
      setIsUnlocking(false);
      onUnlock();
    }, 450);
  };

  return (
    <div
      id="aether-lockscreen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-slate-950/80 backdrop-blur-3xl text-white select-none transition-all duration-500 ${
        isUnlocking ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top: Status lock badge */}
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-slate-300">
        <Lock className="w-3.5 h-3.5 text-violet-400" />
        <span>Quantum Biometric Encrypted</span>
      </div>

      {/* Center: Clock & Welcome Greeting */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="text-6xl sm:text-8xl font-bold font-mono tracking-tighter bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-2xl">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-sm sm:text-base text-slate-300 font-medium tracking-wide">
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        {/* User Card */}
        <div className="mt-8 flex flex-col items-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-1 shadow-2xl shadow-violet-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-300 animate-pulse" />
            </div>
          </div>
          <div className="text-lg font-semibold text-white">{userName}</div>
          <div className="text-xs text-slate-400 font-mono">Kernel Aether v3.4.1</div>
        </div>

        {/* Biometric Unlock Trigger */}
        <button
          id="lockscreen-unlock-btn"
          onClick={handleUnlock}
          className="mt-6 px-6 py-3 bg-white/10 hover:bg-violet-600 border border-white/20 hover:border-violet-400/50 rounded-2xl flex items-center space-x-3 transition-all group shadow-xl hover:shadow-violet-500/25 hover:scale-105 active:scale-95"
        >
          <Fingerprint className="w-5 h-5 text-cyan-300 group-hover:text-white transition-colors" />
          <span className="text-sm font-medium">Authenticate Spatial Node</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Bottom hint */}
      <div className="text-xs text-slate-400 flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Click to synchronize neural state & restore workspaces</span>
      </div>
    </div>
  );
};
