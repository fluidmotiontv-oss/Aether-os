import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Palette,
  Volume2,
  Cpu,
  Shield,
  Monitor,
  User,
  Zap,
} from 'lucide-react';
import { SystemSettings, WallpaperStyle, ThemeColor } from '../types';
import { soundEngine } from '../utils/audio';

interface SettingsAppProps {
  settings: SystemSettings;
  onUpdateSettings: (updater: Partial<SystemSettings>) => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ settings, onUpdateSettings }) => {
  const [activeNav, setActiveNav] = useState<'atmosphere' | 'theme' | 'audio' | 'system' | 'profile'>('atmosphere');
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    fetch('/api/system/status')
      .then((res) => res.json())
      .then((data) => setTelemetry(data))
      .catch(() => {});
  }, []);

  const wallpapers: { id: WallpaperStyle; name: string; desc: string }[] = [
    { id: 'aurora', name: 'Spectral Aurora', desc: 'Undulating ribbons of atmospheric luminescence' },
    { id: 'nebula', name: 'Deep Space Nebula', desc: 'Drifting interstellar dust clouds and glowing clusters' },
    { id: 'cyber-grid', name: 'Cybernetic Matrix', desc: '3D perspective wireframe responding to spatial cursor' },
    { id: 'solar-flare', name: 'Solar Corona Flare', desc: 'Golden pulsating plasma with magnetic fields' },
    { id: 'void-ethereal', name: 'Void Minimalist', desc: 'Deep high-contrast luxury with subtle chromatic breath' },
  ];

  const themes: { id: ThemeColor; name: string; hex: string }[] = [
    { id: 'violet', name: 'Ethereal Violet', hex: '#8b5cf6' },
    { id: 'cyan', name: 'Cyber Cyan', hex: '#06b6d4' },
    { id: 'emerald', name: 'Aurora Emerald', hex: '#10b981' },
    { id: 'amber', name: 'Solar Amber', hex: '#f59e0b' },
    { id: 'rose', name: 'Stellar Rose', hex: '#f43f5e' },
  ];

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 font-sans select-none">
      {/* Left Sidebar */}
      <div className="w-56 border-r border-white/10 bg-slate-900/60 p-3 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-white mb-4 px-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            <span>Preferences</span>
          </div>

          <div className="space-y-1 text-xs">
            <button
              onClick={() => { soundEngine.playUiSound('click'); setActiveNav('atmosphere'); }}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2.5 transition-all ${
                activeNav === 'atmosphere' ? 'bg-violet-600/25 text-violet-300 font-medium' : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Atmosphere & Shaders</span>
            </button>

            <button
              onClick={() => { soundEngine.playUiSound('click'); setActiveNav('theme'); }}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2.5 transition-all ${
                activeNav === 'theme' ? 'bg-violet-600/25 text-violet-300 font-medium' : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <Palette className="w-4 h-4 text-rose-400" />
              <span>Theme & Accents</span>
            </button>

            <button
              onClick={() => { soundEngine.playUiSound('click'); setActiveNav('audio'); }}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2.5 transition-all ${
                activeNav === 'audio' ? 'bg-violet-600/25 text-violet-300 font-medium' : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Audio Synthesis</span>
            </button>

            <button
              onClick={() => { soundEngine.playUiSound('click'); setActiveNav('system'); }}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2.5 transition-all ${
                activeNav === 'system' ? 'bg-violet-600/25 text-violet-300 font-medium' : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>System & Telemetry</span>
            </button>

            <button
              onClick={() => { soundEngine.playUiSound('click'); setActiveNav('profile'); }}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2.5 transition-all ${
                activeNav === 'profile' ? 'bg-violet-600/25 text-violet-300 font-medium' : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Spatial Identity</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 text-center font-mono py-2 border-t border-white/5">
          Aether Kernel v3.4.1
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeNav === 'atmosphere' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Atmospheric Shaders & Wallpapers</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select high-performance dynamic spatial canvas backgrounds</p>
            </div>

            <div className="space-y-2.5">
              {wallpapers.map((wp) => (
                <div
                  key={wp.id}
                  onClick={() => {
                    soundEngine.playUiSound('warp');
                    onUpdateSettings({ wallpaper: wp.id });
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    settings.wallpaper === wp.id
                      ? 'bg-violet-600/20 border-violet-500/50 text-white shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{wp.name}</div>
                    <div className="text-[11px] text-slate-400">{wp.desc}</div>
                  </div>
                  {settings.wallpaper === wp.id && (
                    <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Shader Parameters */}
            <div className="p-4 bg-slate-900/60 border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-xs font-semibold text-white">Particle & Flow Controls</h3>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Particle Density</span>
                  <span className="font-mono text-white">{settings.particleDensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={settings.particleDensity}
                  onChange={(e) => onUpdateSettings({ particleDensity: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeNav === 'theme' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Accent Glow & Themes</h2>
              <p className="text-xs text-slate-400 mt-0.5">Customize UI highlights and glassmorphic colors</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {themes.map((th) => (
                <div
                  key={th.id}
                  onClick={() => {
                    soundEngine.playUiSound('click');
                    onUpdateSettings({ theme: th.id });
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition-all ${
                    settings.theme === th.id
                      ? 'bg-white/15 border-white/30 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full shadow-md" style={{ backgroundColor: th.hex }} />
                  <span className="text-xs font-medium text-white">{th.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeNav === 'audio' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Audio Synthesis & FX</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure Web Audio procedural sound generation</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-white/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white">Interface Audio Clicks & Chimes</div>
                  <div className="text-[11px] text-slate-400">Tactile acoustic feedback on interaction</div>
                </div>
                <button
                  onClick={() => {
                    const next = !settings.soundEffects;
                    onUpdateSettings({ soundEffects: next });
                    soundEngine.isMuted = !next;
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    settings.soundEffects ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {settings.soundEffects ? 'ENABLED' : 'MUTED'}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Master Volume Output</span>
                  <span className="font-mono text-white">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateSettings({ soundVolume: val });
                    soundEngine.setSoundEffectVolume(val);
                    soundEngine.setAmbientVolume(val);
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeNav === 'system' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Quantum System Telemetry</h2>
              <p className="text-xs text-slate-400 mt-0.5">Hardware telemetry across virtual quantum nodes</p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-slate-500 block text-[10px]">MICROKERNEL</span>
                <span className="font-bold text-white">{telemetry?.kernel || 'Aether 3.4.1-quantum'}</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-slate-500 block text-[10px]">QUANTUM COHERENCE</span>
                <span className="font-bold text-emerald-400">{telemetry?.quantumEntanglement || '99.4%'}</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-slate-500 block text-[10px]">CORE THERMAL</span>
                <span className="font-bold text-cyan-400">{telemetry?.temperature || '41.2°C'}</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-slate-500 block text-[10px]">THROUGHPUT</span>
                <span className="font-bold text-violet-400">{telemetry?.networkThroughput || '62.4 MB/s'}</span>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'profile' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Spatial Node Identity</h2>
              <p className="text-xs text-slate-400 mt-0.5">Personalize workstation user and credentials</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-white/10 rounded-2xl space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Explorer Name</label>
                <input
                  type="text"
                  value={settings.userName}
                  onChange={(e) => onUpdateSettings({ userName: e.target.value })}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
