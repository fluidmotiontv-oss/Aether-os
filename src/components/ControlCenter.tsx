import React from 'react';
import {
  Volume2,
  VolumeX,
  Sliders,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Palette,
  Volume,
  Activity,
  Zap,
} from 'lucide-react';
import { SystemSettings, WallpaperStyle, ThemeColor } from '../types';
import { soundEngine } from '../utils/audio';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onUpdateSettings: (updater: Partial<SystemSettings>) => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const wallpapers: { id: WallpaperStyle; name: string }[] = [
    { id: 'aurora', name: 'Aurora' },
    { id: 'nebula', name: 'Nebula' },
    { id: 'cyber-grid', name: 'Cyber Grid' },
    { id: 'solar-flare', name: 'Solar' },
    { id: 'void-ethereal', name: 'Void' },
  ];

  const themes: { id: ThemeColor; name: string; bg: string }[] = [
    { id: 'violet', name: 'Violet', bg: 'bg-violet-500' },
    { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500' },
    { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
    { id: 'amber', name: 'Amber', bg: 'bg-amber-500' },
    { id: 'rose', name: 'Rose', bg: 'bg-rose-500' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        id="aether-control-center-panel"
        className="fixed top-11 right-3 w-80 max-w-[calc(100vw-24px)] bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-sm">Control Center</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
            Aether Core
          </span>
        </div>

        {/* Quick Toggles 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              const next = !settings.soundEffects;
              onUpdateSettings({ soundEffects: next });
              soundEngine.isMuted = !next;
              if (next) soundEngine.playUiSound('click');
            }}
            className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all text-left ${
              settings.soundEffects
                ? 'bg-violet-600/30 border-violet-500/40 text-violet-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Volume2 className="w-4 h-4 text-violet-400" />
            <div>
              <div className="text-xs font-medium">Sound FX</div>
              <div className="text-[10px] text-slate-400">
                {settings.soundEffects ? 'Active' : 'Muted'}
              </div>
            </div>
          </button>

          {/* Night Light Toggle */}
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              onUpdateSettings({ nightLight: !settings.nightLight });
            }}
            className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all text-left ${
              settings.nightLight
                ? 'bg-amber-600/30 border-amber-500/40 text-amber-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-xs font-medium">Night Light</div>
              <div className="text-[10px] text-slate-400">
                {settings.nightLight ? 'Warm Shift' : 'Standard'}
              </div>
            </div>
          </button>

          {/* Desktop Widgets Toggle */}
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              onUpdateSettings({ desktopWidgets: !settings.desktopWidgets });
            }}
            className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all text-left ${
              settings.desktopWidgets
                ? 'bg-cyan-600/30 border-cyan-500/40 text-cyan-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-medium">Widgets</div>
              <div className="text-[10px] text-slate-400">
                {settings.desktopWidgets ? 'Visible' : 'Hidden'}
              </div>
            </div>
          </button>

          {/* Dock Magnification */}
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              onUpdateSettings({ dockMagnification: !settings.dockMagnification });
            }}
            className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all text-left ${
              settings.dockMagnification
                ? 'bg-emerald-600/30 border-emerald-500/40 text-emerald-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-medium">Dock Zoom</div>
              <div className="text-[10px] text-slate-400">
                {settings.dockMagnification ? 'Smooth' : 'Static'}
              </div>
            </div>
          </button>
        </div>

        {/* Master Sound Volume Slider */}
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Master Sound Volume</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {Math.round(settings.soundVolume * 100)}%
            </span>
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

        {/* Wallpaper Modes */}
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Atmospheric Wallpaper</span>
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {wallpapers.map((wp) => (
              <button
                key={wp.id}
                onClick={() => {
                  soundEngine.playUiSound('warp');
                  onUpdateSettings({ wallpaper: wp.id });
                }}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all text-center truncate ${
                  settings.wallpaper === wp.id
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/40 font-bold'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {wp.name}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Themes */}
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              <span>Accent Glow</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            {themes.map((th) => (
              <button
                key={th.id}
                onClick={() => {
                  soundEngine.playUiSound('click');
                  onUpdateSettings({ theme: th.id });
                }}
                className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg transition-all ${
                  settings.theme === th.id
                    ? 'bg-white/15 ring-1 ring-white/30 text-white'
                    : 'hover:bg-white/5 text-slate-400'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${th.bg}`} />
                <span className="text-[11px] capitalize">{th.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
