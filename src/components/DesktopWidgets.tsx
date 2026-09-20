import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, HardDrive, Radio, Clock, Play, Pause, Plus, Trash2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface DesktopWidgetsProps {
  onOpenApp: (appId: any) => void;
  visible: boolean;
}

export const DesktopWidgets: React.FC<DesktopWidgetsProps> = ({ onOpenApp, visible }) => {
  const [time, setTime] = useState(new Date());
  const [sysStats, setSysStats] = useState({
    cpu: 18,
    ram: 42,
    quantum: 99.4,
    fps: 60,
  });
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [stickies, setStickies] = useState<string[]>([
    '⚡ Shift perspectives: Cmd+K for spatial omni search',
    '✨ Deep work flow: Switch to Nebula Sound Lab for 432Hz focus drone',
  ]);
  const [newStickyText, setNewStickyText] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const statsTimer = setInterval(() => {
      setSysStats({
        cpu: Math.floor(14 + Math.random() * 15),
        ram: Math.floor(40 + Math.random() * 8),
        quantum: +(98.5 + Math.random() * 1.4).toFixed(1),
        fps: 60,
      });
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(statsTimer);
    };
  }, []);

  if (!visible) return null;

  const secondsRatio = time.getSeconds() / 60;
  const minutesRatio = (secondsRatio + time.getMinutes()) / 60;
  const hoursRatio = (minutesRatio + (time.getHours() % 12)) / 12;

  const toggleSound = () => {
    soundEngine.playUiSound('click');
    const next = !isPlayingSound;
    setIsPlayingSound(next);
    soundEngine.toggleAmbientSound('widget-drone', 'drone', next, 0.4);
  };

  const addSticky = () => {
    if (!newStickyText.trim()) return;
    soundEngine.playUiSound('key');
    setStickies([...stickies, newStickyText.trim()]);
    setNewStickyText('');
  };

  const removeSticky = (idx: number) => {
    soundEngine.playUiSound('click');
    setStickies(stickies.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed top-14 right-6 w-72 flex flex-col space-y-4 pointer-events-auto select-none z-10 hidden xl:flex">
      {/* Celestial Analog & Digital Clock Widget */}
      <div
        id="widget-chronos-clock"
        onClick={() => onOpenApp('clock')}
        className="p-4 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-xl transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="flex items-center space-x-1 font-medium text-slate-200">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span>Chronos Celestial</span>
          </span>
          <span className="font-mono text-[10px] text-violet-400">LIVE</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Mini Analog Dial */}
          <div className="relative w-16 h-16 rounded-full border border-white/20 bg-slate-950/80 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 z-20" />
            {/* Hour hand */}
            <div
              className="absolute w-0.5 h-4 bg-slate-200 origin-bottom rounded-full top-4"
              style={{ transform: `rotate(${hoursRatio * 360}deg)` }}
            />
            {/* Minute hand */}
            <div
              className="absolute w-0.5 h-6 bg-violet-300 origin-bottom rounded-full top-2"
              style={{ transform: `rotate(${minutesRatio * 360}deg)` }}
            />
            {/* Second hand */}
            <div
              className="absolute w-[1px] h-6 bg-cyan-400 origin-bottom rounded-full top-2"
              style={{ transform: `rotate(${secondsRatio * 360}deg)` }}
            />
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-slate-400">
              {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* System Quantum Telemetry Widget */}
      <div
        id="widget-system-telemetry"
        onClick={() => onOpenApp('settings')}
        className="p-4 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-xl transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <span className="flex items-center space-x-1 font-medium text-slate-200">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quantum Diagnostics</span>
          </span>
          <span className="font-mono text-[10px] text-cyan-400">60 FPS</span>
        </div>

        {/* CPU Bar */}
        <div className="space-y-2 text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Neural Processing (NPU)</span>
              <span className="font-mono text-slate-200">{sysStats.cpu}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${sysStats.cpu}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Quantum Entanglement</span>
              <span className="font-mono text-slate-200">{sysStats.quantum}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${sysStats.quantum}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ambient Sound Stream Mini Widget */}
      <div
        id="widget-ambient-player"
        className="p-3.5 bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-xl transition-all flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-violet-600/30 border border-violet-500/40 text-violet-300">
            <Radio className={`w-4 h-4 ${isPlayingSound ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">432Hz Celestial Drone</div>
            <div className="text-[10px] text-slate-400">
              {isPlayingSound ? 'Harmonizing Brainwaves' : 'Focus Soundscape'}
            </div>
          </div>
        </div>
        <button
          onClick={toggleSound}
          className="p-2 rounded-full bg-white/10 hover:bg-violet-600 text-white transition-all shadow-md"
        >
          {isPlayingSound ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
        </button>
      </div>

      {/* Quick Synaptic Scratchpad Widget */}
      <div
        id="widget-synaptic-scratchpad"
        className="p-3.5 bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-xl transition-all text-xs"
      >
        <div className="flex items-center justify-between font-medium text-slate-200 mb-2">
          <span>Quick Thoughts</span>
          <span className="text-[10px] text-slate-400 font-mono">{stickies.length} notes</span>
        </div>

        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {stickies.map((st, i) => (
            <div
              key={i}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-start justify-between group"
            >
              <p className="text-[11px] leading-relaxed select-text">{st}</p>
              <button
                onClick={() => removeSticky(i)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity ml-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-1.5 mt-2 pt-2 border-t border-white/10">
          <input
            type="text"
            value={newStickyText}
            onChange={(e) => setNewStickyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSticky()}
            placeholder="Add quick thought..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white placeholder:text-slate-500 outline-none"
          />
          <button
            onClick={addSticky}
            className="p-1 rounded-lg bg-violet-600/60 hover:bg-violet-600 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
