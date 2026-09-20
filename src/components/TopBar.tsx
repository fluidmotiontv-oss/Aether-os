import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  Search,
  Wifi,
  BatteryCharging,
  Layers,
  Power,
  RefreshCw,
  Info,
  Radio,
  Moon,
  Sun,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { SystemSettings, AppId } from '../types';
import { soundEngine } from '../utils/audio';

interface TopBarProps {
  settings: SystemSettings;
  onUpdateSettings: (updater: Partial<SystemSettings>) => void;
  onOpenApp: (appId: AppId) => void;
  onOpenSpotlight: () => void;
  onToggleControlCenter: () => void;
  isControlCenterOpen: boolean;
  onToggleNotificationCenter?: () => void;
  isNotificationCenterOpen?: boolean;
  unreadNotificationsCount?: number;
  activeAppTitle?: string;
  activeWorkspace: number;
  onChangeWorkspace: (ws: number) => void;
  onLockScreen: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  onUpdateSettings,
  onOpenApp,
  onOpenSpotlight,
  onToggleControlCenter,
  isControlCenterOpen,
  onToggleNotificationCenter,
  isNotificationCenterOpen,
  unreadNotificationsCount = 0,
  activeAppTitle = 'Aether.OS',
  activeWorkspace,
  onChangeWorkspace,
  onLockScreen,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isAetherMenuOpen, setIsAetherMenuOpen] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAmbient = () => {
    soundEngine.playUiSound('click');
    const nextState = !isAmbientPlaying;
    setIsAmbientPlaying(nextState);
    soundEngine.toggleAmbientSound('topbar-drone', 'drone', nextState, 0.45);
  };

  const handleWorkspaceClick = (ws: number) => {
    soundEngine.playUiSound('warp');
    onChangeWorkspace(ws);
  };

  return (
    <header
      id="aether-top-bar"
      className="fixed top-0 left-0 right-0 h-9 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-3 text-xs text-slate-200 select-none shadow-sm transition-all"
    >
      {/* Left section: Aether Logo, Active App Name, Workspace Switcher */}
      <div className="flex items-center space-x-3">
        {/* Aether Main Menu Button */}
        <div className="relative">
          <button
            id="aether-system-menu-btn"
            onClick={() => {
              soundEngine.playUiSound('click');
              setIsAetherMenuOpen(!isAetherMenuOpen);
            }}
            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md transition-all font-medium ${
              isAetherMenuOpen
                ? 'bg-white/20 text-white shadow-inner'
                : 'hover:bg-white/10 text-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span className="font-semibold tracking-wide">Aether</span>
          </button>

          {/* Aether Dropdown Menu */}
          {isAetherMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsAetherMenuOpen(false)}
              />
              <div
                id="aether-system-dropdown"
                className="absolute top-8 left-0 w-56 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="font-medium text-white flex items-center justify-between">
                    <span>Aether.OS</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">
                      v3.4.1 Quantum
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Spatial Neural Kernel
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenApp('settings');
                      setIsAetherMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-violet-600/30 hover:text-white flex items-center space-x-2 text-slate-200"
                  >
                    <Sliders className="w-3.5 h-3.5 text-violet-400" />
                    <span>System Preferences...</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenApp('app-hub');
                      setIsAetherMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-violet-600/30 hover:text-white flex items-center space-x-2 text-slate-200"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Aether App Hub...</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenSpotlight();
                      setIsAetherMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-violet-600/30 hover:text-white flex items-center justify-between text-slate-200"
                  >
                    <span className="flex items-center space-x-2">
                      <Search className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Omni Search</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">⌘K</span>
                  </button>
                </div>

                <div className="border-t border-white/10 py-1">
                  <button
                    onClick={() => {
                      onLockScreen();
                      setIsAetherMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-600/30 hover:text-amber-200 flex items-center space-x-2 text-slate-200"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lock Workstation</span>
                  </button>
                  <button
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-600/30 hover:text-red-200 flex items-center space-x-2 text-slate-200"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-red-400" />
                    <span>Restart Kernel</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Active App title indicator */}
        <span className="font-medium text-slate-300 text-xs hidden sm:inline-block">
          {activeAppTitle}
        </span>

        {/* Workspace Switcher */}
        <div className="hidden sm:flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 ml-2">
          {[1, 2, 3, 4].map((ws) => (
            <button
              key={ws}
              id={`workspace-btn-${ws}`}
              onClick={() => handleWorkspaceClick(ws)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                activeWorkspace === ws
                  ? 'bg-violet-600 text-white font-bold shadow-sm shadow-violet-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
              title={`Workspace ${ws}`}
            >
              {ws}
            </button>
          ))}
        </div>
      </div>

      {/* Center section: Omni Search Bar shortcut */}
      <div className="hidden md:flex items-center">
        <button
          id="spotlight-quick-search-btn"
          onClick={onOpenSpotlight}
          className="flex items-center space-x-2 px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full border border-white/10 transition-all text-xs group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400 transition-colors" />
          <span className="text-[11px] text-slate-400 group-hover:text-slate-200">
            Search or ask Aether...
          </span>
          <kbd className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Ambient Sound, WiFi, Battery, Notification Bell, Control Center, Clock */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Ambient Sound Quick Toggle */}
        <button
          id="topbar-ambient-drone-btn"
          onClick={handleToggleAmbient}
          className={`p-1 rounded-md transition-all flex items-center space-x-1 ${
            isAmbientPlaying
              ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-sm shadow-violet-500/20'
              : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
          }`}
          title={isAmbientPlaying ? 'Ambient Sound: ON (Celestial Drone)' : 'Ambient Sound: OFF'}
        >
          <Radio className={`w-3.5 h-3.5 ${isAmbientPlaying ? 'animate-pulse text-violet-400' : ''}`} />
          {isAmbientPlaying && <span className="text-[10px] hidden md:inline">Drone</span>}
        </button>

        {/* Network & Battery Status */}
        <div className="flex items-center space-x-1.5 text-slate-400 hidden sm:flex">
          <Wifi className="w-3.5 h-3.5 text-emerald-400/90" />
          <BatteryCharging className="w-3.5 h-3.5 text-cyan-400/90" />
        </div>

        {/* Notification Center Trigger */}
        {onToggleNotificationCenter && (
          <button
            id="topbar-notification-btn"
            onClick={() => {
              soundEngine.playUiSound('click');
              onToggleNotificationCenter();
            }}
            className={`p-1 rounded-md transition-all relative ${
              isNotificationCenterOpen
                ? 'bg-white/20 text-white'
                : 'hover:bg-white/10 text-slate-300'
            }`}
            title="Notification Center"
          >
            <Bell className="w-3.5 h-3.5 text-violet-300" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        )}

        {/* Control Center Toggle Button */}
        <button
          id="topbar-control-center-btn"
          onClick={() => {
            soundEngine.playUiSound('click');
            onToggleControlCenter();
          }}
          className={`p-1 rounded-md transition-all ${
            isControlCenterOpen
              ? 'bg-white/20 text-white'
              : 'hover:bg-white/10 text-slate-300'
          }`}
          title="Control Center"
        >
          <Sliders className="w-3.5 h-3.5 text-violet-300" />
        </button>

        {/* Clock & Date */}
        <div className="relative">
          <button
            id="topbar-clock-btn"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="flex items-center space-x-1.5 hover:bg-white/10 px-1.5 py-0.5 rounded transition-all text-slate-200 font-mono text-xs"
          >
            <span className="hidden md:inline text-slate-400 font-sans text-[11px]">
              {dateStr}
            </span>
            <span className="font-semibold text-slate-100">{timeStr}</span>
          </button>

          {/* Quick Mini Calendar / Chronos Flyout */}
          {isCalendarOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsCalendarOpen(false)}
              />
              <div className="absolute right-0 top-8 w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="font-medium text-white">{dateStr}</div>
                  <span className="text-xs font-mono text-violet-400">{timeStr}</span>
                </div>
                <div className="mt-3 text-center py-2 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-2xl font-mono font-bold tracking-tight text-white">
                    {timeStr}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Universal Quantum Time (UQT)
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-xs">
                  <button
                    onClick={() => {
                      onOpenApp('clock');
                      setIsCalendarOpen(false);
                    }}
                    className="text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Open Chronos Clock →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

