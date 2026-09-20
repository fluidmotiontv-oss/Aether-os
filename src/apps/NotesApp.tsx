import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Pin,
  Search,
  Share2,
  FileDown,
  Sparkles,
  Network,
  Edit3,
  Tag,
  Clock,
} from 'lucide-react';
import { NoteItem } from '../types';
import { INITIAL_NOTES } from '../utils/storage';
import { soundEngine } from '../utils/audio';

export const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('aether_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'editor' | 'graph'>('editor');

  useEffect(() => {
    localStorage.setItem('aether_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    soundEngine.playUiSound('open');
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: 'Untitled Synaptic Node',
      content: '# New Synaptic Note\n\nBegin capturing thoughts...',
      tags: ['concept'],
      color: ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
      isPinned: false,
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateActive = (patch: Partial<NoteItem>) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? { ...n, ...patch, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handleDelete = (id: string) => {
    soundEngine.playUiSound('close');
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    if (activeNoteId === id && next.length > 0) {
      setActiveNoteId(next[0].id);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 font-sans select-text">
      {/* Sidebar List */}
      <div className="w-64 border-r border-white/10 bg-slate-900/60 flex flex-col shrink-0">
        {/* Top actions */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-xs text-white">Synaptic Notes</span>
          </div>
          <button
            onClick={handleCreateNote}
            className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30 flex items-center space-x-1"
            title="Create Note"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-white/5">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-2.5 py-1">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thoughts..."
              className="bg-transparent text-xs text-white placeholder:text-slate-500 outline-none w-full"
            />
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.map((n) => {
            const isSelected = n.id === activeNoteId;
            return (
              <div
                key={n.id}
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setActiveNoteId(n.id);
                }}
                className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-violet-600/25 border-violet-500/40 text-white shadow-md'
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: n.color }}
                    />
                    <span className="font-medium text-xs truncate text-white">{n.title}</span>
                  </div>
                  {n.isPinned && <Pin className="w-3 h-3 text-amber-400 shrink-0" />}
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {n.content.replace(/[#*`_]/g, '')}
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-500">
                  <span className="font-mono">
                    {new Date(n.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex space-x-1">
                    {n.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Mode Switcher */}
        <div className="p-2 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              soundEngine.playUiSound('click');
              setViewMode(viewMode === 'editor' ? 'graph' : 'editor');
            }}
            className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 flex items-center justify-center space-x-2 transition-all"
          >
            {viewMode === 'editor' ? (
              <>
                <Network className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Synaptic Graph</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                <span>Open Editor</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {viewMode === 'editor' && activeNote ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Note Editor Header */}
            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateActive({ title: e.target.value })}
                placeholder="Note Title..."
                className="text-base font-bold text-white bg-transparent border-none outline-none w-full max-w-md"
              />

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateActive({ isPinned: !activeNote.isPinned })}
                  className={`p-1.5 rounded-lg border transition-all ${
                    activeNote.isPinned
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Pin Note"
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(activeNote.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition-all"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Note Tags & Color Bar */}
            <div className="px-6 py-2 border-b border-white/5 flex items-center space-x-3 text-xs bg-slate-900/20">
              <span className="text-slate-400 flex items-center space-x-1">
                <Tag className="w-3 h-3 text-violet-400" />
                <span>Tags:</span>
              </span>
              <input
                type="text"
                value={activeNote.tags.join(', ')}
                onChange={(e) =>
                  handleUpdateActive({
                    tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="comma separated tags..."
                className="bg-transparent text-slate-200 text-xs outline-none border-b border-white/10 py-0.5"
              />
            </div>

            {/* Note Textarea Editor */}
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateActive({ content: e.target.value })}
                placeholder="Write in markdown..."
                className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-slate-200 placeholder:text-slate-600"
              />
            </div>
          </div>
        ) : (
          /* Synaptic Knowledge Graph View */
          <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden bg-slate-950">
            <div className="absolute top-4 left-6 text-xs text-slate-400 flex items-center space-x-2">
              <Network className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Synaptic Neural Nodes Graph</span>
            </div>

            {/* Interactive SVG Graph visualization */}
            <svg className="w-full h-full">
              {/* Draw connections from center to all nodes */}
              {notes.map((n, i) => {
                const angle = (i / notes.length) * Math.PI * 2;
                const cx = 350 + Math.cos(angle) * 140;
                const cy = 240 + Math.sin(angle) * 140;
                return (
                  <g key={n.id}>
                    <line
                      x1={350}
                      y1={240}
                      x2={cx}
                      y2={cy}
                      stroke="rgba(139, 92, 246, 0.35)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={24}
                      fill="rgba(15, 23, 42, 0.9)"
                      stroke={n.color || '#8b5cf6'}
                      strokeWidth="2"
                      className="cursor-pointer hover:r-7 transition-all"
                      onClick={() => {
                        soundEngine.playUiSound('click');
                        setActiveNoteId(n.id);
                        setViewMode('editor');
                      }}
                    />
                    <text
                      x={cx}
                      y={cy + 38}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="11"
                      className="font-medium pointer-events-none select-none"
                    >
                      {n.title.slice(0, 16)}
                    </text>
                  </g>
                );
              })}

              {/* Central Master Node */}
              <circle cx={350} cy={240} r={32} fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth="2" />
              <text x={350} y={244} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
                AETHER
              </text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
