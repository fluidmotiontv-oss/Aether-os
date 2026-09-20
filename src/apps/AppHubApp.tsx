import React, { useState, useEffect, useRef } from 'react';
import {
  Boxes,
  Sparkles,
  Terminal,
  BookOpen,
  Radio,
  Code2,
  FolderKanban,
  Clock,
  Gamepad2,
  Sliders,
  ArrowUpRight,
  Search,
  ArrowUpDown,
  ChevronDown,
  Check,
  Flame,
  Calendar,
  ArrowDownAZ,
} from 'lucide-react';
import { AppId, AppDefinition } from '../types';
import { APPS_CATALOG } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface AppHubAppProps {
  onOpenApp: (appId: AppId) => void;
}

type SortOption = 'most-used' | 'name' | 'recently-added';

interface SortConfig {
  id: SortOption;
  label: string;
  icon: React.ElementType;
}

const SORT_OPTIONS: SortConfig[] = [
  { id: 'most-used', label: 'Most Used', icon: Flame },
  { id: 'name', label: 'Name', icon: ArrowDownAZ },
  { id: 'recently-added', label: 'Recently Added', icon: Calendar },
];

export const AppHubApp: React.FC<AppHubAppProps> = ({ onOpenApp }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('most-used');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  // App Usage tracking for dynamic "Most Used" sorting
  const [usageStats, setUsageStats] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('aether_app_usage');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const initial: Record<string, number> = {};
    APPS_CATALOG.forEach((app) => {
      initial[app.id] = app.defaultUsage || 10;
    });
    return initial;
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLaunchApp = (appId: AppId) => {
    soundEngine.playUiSound('open');
    // Increment usage count
    setUsageStats((prev) => {
      const updated = {
        ...prev,
        [appId]: (prev[appId] || 0) + 1,
      };
      localStorage.setItem('aether_app_usage', JSON.stringify(updated));
      return updated;
    });
    onOpenApp(appId);
  };

  const categories = ['All', 'AI & Core', 'Development', 'Creativity', 'System', 'Utilities'];

  // Filtering
  const filtered = APPS_CATALOG.filter((app) => {
    const matchesCat = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch =
      app.title.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'most-used') {
      const usageA = usageStats[a.id] ?? a.defaultUsage ?? 0;
      const usageB = usageStats[b.id] ?? b.defaultUsage ?? 0;
      return usageB - usageA;
    }
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'recently-added') {
      const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0;
      const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-violet-400" />;
      case 'Terminal': return <Terminal className="w-6 h-6 text-emerald-400" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-cyan-400" />;
      case 'Radio': return <Radio className="w-6 h-6 text-pink-400" />;
      case 'Code2': return <Code2 className="w-6 h-6 text-blue-400" />;
      case 'FolderKanban': return <FolderKanban className="w-6 h-6 text-amber-400" />;
      case 'Clock': return <Clock className="w-6 h-6 text-indigo-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-6 h-6 text-red-400" />;
      case 'Sliders': return <Sliders className="w-6 h-6 text-purple-400" />;
      default: return <Boxes className="w-6 h-6 text-slate-400" />;
    }
  };

  const currentSortConfig = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];
  const CurrentSortIcon = currentSortConfig.icon;

  return (
    <div id="app-hub-container" className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-y-auto">
      {/* Hero Header */}
      <div className="p-6 bg-gradient-to-r from-violet-950/60 via-slate-900/80 to-slate-950 border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-2 text-violet-400 text-xs font-mono mb-1">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>AETHER SPATIAL ECOSYSTEM</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Aether Hub & App Gallery</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-lg">
          Explore spatial computing modules, neural assistants, sound synthesizers, and quantum development tools.
        </p>

        {/* Search, Filter & Sort Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 w-full sm:w-60 focus-within:border-violet-500/50 transition-colors">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              id="app-hub-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps..."
              className="bg-transparent text-xs text-white placeholder:text-slate-500 outline-none w-full"
            />
          </div>

          {/* Right: Sort Dropdown & Categories */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                id="app-hub-sort-dropdown-button"
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setIsSortOpen((prev) => !prev);
                }}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm"
                aria-label="Sort applications"
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-slate-400 font-normal">Sort:</span>
                <span className="font-semibold text-white flex items-center space-x-1">
                  <CurrentSortIcon className="w-3.5 h-3.5 text-violet-300 inline mr-1" />
                  {currentSortConfig.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isSortOpen && (
                <div
                  id="app-hub-sort-menu"
                  className="absolute right-0 mt-1.5 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl p-1.5 shadow-2xl z-30 flex flex-col space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-white/5 mb-1">
                    Sort Catalog By
                  </div>
                  {SORT_OPTIONS.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = sortBy === option.id;
                    return (
                      <button
                        key={option.id}
                        id={`sort-option-${option.id}`}
                        onClick={() => {
                          soundEngine.playUiSound('click');
                          setSortBy(option.id);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-violet-600/30 text-violet-200 font-semibold'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <OptionIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-violet-400' : 'text-slate-400'}`} />
                          <span>{option.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center space-x-1 overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  id={`category-pill-${c.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    soundEngine.playUiSound('click');
                    setSelectedCategory(c);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    selectedCategory === c
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Apps */}
      <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sorted.map((app) => {
          const usageCount = usageStats[app.id] ?? app.defaultUsage ?? 0;
          return (
            <div
              key={app.id}
              id={`app-card-${app.id}`}
              onClick={() => handleLaunchApp(app.id)}
              className="p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-violet-500/50 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                  {renderIcon(app.iconName)}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    {app.category}
                  </span>
                  {sortBy === 'most-used' && (
                    <span className="text-[10px] font-mono text-amber-400/90 flex items-center space-x-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      <Flame className="w-2.5 h-2.5" />
                      <span>{usageCount} launches</span>
                    </span>
                  )}
                  {sortBy === 'recently-added' && app.addedDate && (
                    <span className="text-[10px] font-mono text-cyan-400/90 flex items-center space-x-1 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{app.addedDate}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <div className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>{app.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-violet-400 font-medium">
                <span>Launch Module</span>
                <span className="text-[10px] text-slate-500 font-mono">Ready</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

