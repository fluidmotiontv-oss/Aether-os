import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
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
  ArrowRight,
  Calculator,
  CornerDownLeft,
} from 'lucide-react';
import { AppId } from '../types';
import { APPS_CATALOG } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppId) => void;
  onAskAI?: (prompt: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  onAskAI,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      soundEngine.playUiSound('open');
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Icon mapping
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-violet-400" />;
      case 'Terminal': return <Terminal className="w-4 h-4 text-emerald-400" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'Radio': return <Radio className="w-4 h-4 text-pink-400" />;
      case 'Code2': return <Code2 className="w-4 h-4 text-blue-400" />;
      case 'FolderKanban': return <FolderKanban className="w-4 h-4 text-amber-400" />;
      case 'Clock': return <Clock className="w-4 h-4 text-indigo-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-4 h-4 text-red-400" />;
      case 'Sliders': return <Sliders className="w-4 h-4 text-purple-400" />;
      default: return <Boxes className="w-4 h-4 text-slate-400" />;
    }
  };

  // Math calculator check
  let mathResult: string | null = null;
  if (/^[0-9+\-*/().\s^%]+$/.test(query.trim()) && /[0-9]/.test(query)) {
    try {
      // Safe math evaluation
      // eslint-disable-next-line no-eval
      const res = Function(`"use strict"; return (${query.replace(/\^/g, '**')})`)();
      if (typeof res === 'number' && !isNaN(res)) {
        mathResult = res.toString();
      }
    } catch {}
  }

  // Filter apps
  const filteredApps = APPS_CATALOG.filter(
    (app) =>
      app.title.toLowerCase().includes(query.toLowerCase()) ||
      app.description.toLowerCase().includes(query.toLowerCase()) ||
      app.category.toLowerCase().includes(query.toLowerCase())
  );

  const itemsCount = filteredApps.length + (query.trim() ? 1 : 0) + (mathResult ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, itemsCount));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + itemsCount) % Math.max(1, itemsCount));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (mathResult && selectedIndex === 0) {
        navigator.clipboard?.writeText(mathResult);
        soundEngine.playUiSound('chime');
        onClose();
        return;
      }

      if (filteredApps.length > 0 && selectedIndex < filteredApps.length) {
        const selectedApp = filteredApps[selectedIndex];
        onOpenApp(selectedApp.id);
        onClose();
      } else if (query.trim()) {
        // Trigger AI chat with query
        onOpenApp('neural-ai');
        onClose();
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-in fade-in duration-100" onClick={onClose} />
      <div
        id="aether-omni-spotlight"
        className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] sm:w-full max-w-xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-100 animate-in zoom-in-95 fade-in duration-150"
      >
        {/* Search input field */}
        <div className="flex items-center px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-violet-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Launch apps, calculate, or ask Aether Neural Core..."
            className="w-full bg-transparent border-none outline-none text-base placeholder:text-slate-500 text-white"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Math calculation result if valid */}
          {mathResult && (
            <div
              onClick={() => {
                navigator.clipboard?.writeText(mathResult!);
                soundEngine.playUiSound('chime');
                onClose();
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-white cursor-pointer hover:bg-violet-600/30 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-violet-500/30">
                  <Calculator className="w-4 h-4 text-violet-300" />
                </div>
                <div>
                  <div className="text-xs text-violet-300">Calculation Result</div>
                  <div className="text-base font-mono font-bold text-white">{mathResult}</div>
                </div>
              </div>
              <span className="text-[10px] text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded">
                Click to copy
              </span>
            </div>
          )}

          {/* Filtered Apps */}
          {filteredApps.map((app, idx) => {
            const isSelected = selectedIndex === idx + (mathResult ? 1 : 0);
            return (
              <div
                key={app.id}
                onClick={() => {
                  onOpenApp(app.id);
                  onClose();
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white/15 text-white border border-white/20 shadow-md'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    {renderIcon(app.iconName)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{app.title}</div>
                    <div className="text-xs text-slate-400 truncate max-w-sm">
                      {app.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    {app.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })}

          {/* Ask AI prompt option */}
          {query.trim() && (
            <div
              onClick={() => {
                onOpenApp('neural-ai');
                onClose();
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-violet-600/20 cursor-pointer border border-violet-500/20 transition-all text-violet-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-medium text-violet-200">
                    Ask Aether Neural Core: "{query}"
                  </div>
                  <div className="text-xs text-violet-400/80">
                    Process query through spatial intelligence network
                  </div>
                </div>
              </div>
              <CornerDownLeft className="w-4 h-4 text-violet-400" />
            </div>
          )}

          {filteredApps.length === 0 && !query.trim() && (
            <div className="text-center py-8 text-slate-500 text-xs">
              Type an app name, command, or arithmetic equation...
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span>
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-slate-300 font-mono">↑↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-slate-300 font-mono">↵</kbd>{' '}
              Launch
            </span>
            <span>
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-slate-300 font-mono">ESC</kbd>{' '}
              Close
            </span>
          </div>
          <span className="font-mono text-violet-400">Aether.OS Spotlight</span>
        </div>
      </div>
    </>
  );
};
