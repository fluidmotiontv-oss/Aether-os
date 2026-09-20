import React, { useState } from 'react';
import {
  Sparkles,
  Terminal,
  BookOpen,
  Radio,
  Code2,
  FolderKanban,
  Clock,
  Gamepad2,
  Sliders,
  Boxes,
  Trash2,
  Calculator,
  PenTool,
  Disc,
} from 'lucide-react';
import { AppId, WindowState } from '../types';
import { APPS_CATALOG } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface DockProps {
  openWindows: WindowState[];
  activeWindowId?: string;
  onOpenApp: (appId: AppId) => void;
  onRestoreWindow: (winId: string) => void;
  isMagnified: boolean;
}

export const Dock: React.FC<DockProps> = ({
  openWindows,
  activeWindowId,
  onOpenApp,
  onRestoreWindow,
  isMagnified = true,
}) => {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />;
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]" />;
      case 'Radio':
        return <Radio className="w-6 h-6 text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]" />;
      case 'Code2':
        return <Code2 className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]" />;
      case 'FolderKanban':
        return <FolderKanban className="w-6 h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-6 h-6 text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]" />;
      case 'Calculator':
        return <Calculator className="w-6 h-6 text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" />;
      case 'PenTool':
        return <PenTool className="w-6 h-6 text-fuchsia-300 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]" />;
      case 'Disc':
        return <Disc className="w-6 h-6 text-rose-300 drop-shadow-[0_0_8px_rgba(253,164,175,0.5)]" />;
      case 'Sliders':
        return <Sliders className="w-6 h-6 text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.5)]" />;
      default:
        return <Boxes className="w-6 h-6 text-slate-300" />;
    }
  };


  const pinnedApps = APPS_CATALOG.filter((app) => app.pinnedToDock);

  return (
    <div
      id="aether-floating-dock"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none max-w-[95vw]"
    >
      <div className="flex items-end px-3 py-2 bg-slate-950/60 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl space-x-2 transition-all overflow-x-auto no-scrollbar">
        {pinnedApps.map((app) => {
          const isOpen = openWindows.some((w) => w.appId === app.id);
          const isFocused = openWindows.some(
            (w) => w.appId === app.id && w.id === activeWindowId && !w.isMinimized
          );
          const isHovered = hoveredApp === app.id;

          return (
            <div key={app.id} className="relative group flex flex-col items-center">
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-lg text-[11px] text-slate-100 whitespace-nowrap shadow-lg pointer-events-none animate-in fade-in zoom-in-95 duration-100 font-medium">
                  {app.title}
                </div>
              )}

              {/* Dock Icon Button */}
              <button
                id={`dock-icon-${app.id}`}
                onClick={() => {
                  soundEngine.playUiSound('click');
                  onOpenApp(app.id);
                }}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
                className={`relative p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-200 flex items-center justify-center ${
                  isMagnified ? 'hover:-translate-y-2 hover:scale-115 active:scale-95' : 'hover:scale-105'
                } ${isFocused ? 'ring-2 ring-violet-400/50 bg-white/15' : ''}`}
              >
                {renderIcon(app.iconName)}
              </button>

              {/* Running Status Dot */}
              <div className="h-1.5 flex items-center justify-center mt-1">
                {isOpen && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isFocused
                        ? 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,1)]'
                        : 'bg-white/60'
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Separator */}
        <div className="h-9 w-[1px] bg-white/15 mx-1 self-center" />

        {/* App Hub launcher icon */}
        <div className="relative group flex flex-col items-center">
          {hoveredApp === 'app-hub' && (
            <div className="absolute -top-10 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-lg text-[11px] text-slate-100 whitespace-nowrap shadow-lg pointer-events-none font-medium">
              Aether App Hub
            </div>
          )}
          <button
            id="dock-icon-app-hub"
            onClick={() => {
              soundEngine.playUiSound('click');
              onOpenApp('app-hub');
            }}
            onMouseEnter={() => setHoveredApp('app-hub')}
            onMouseLeave={() => setHoveredApp(null)}
            className={`p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-200 flex items-center justify-center ${
              isMagnified ? 'hover:-translate-y-2 hover:scale-115 active:scale-95' : 'hover:scale-105'
            }`}
          >
            <Boxes className="w-6 h-6 text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.5)]" />
          </button>
          <div className="h-1.5 mt-1" />
        </div>
      </div>
    </div>
  );
};
