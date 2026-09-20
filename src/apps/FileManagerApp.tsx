import React, { useState, useEffect, useRef } from 'react';
import {
  FolderKanban,
  Folder,
  FileText,
  FileCode,
  FileAudio,
  Search,
  Plus,
  Trash2,
  Download,
  ChevronRight,
  HardDrive,
  Eye,
  LayoutGrid,
  Network,
  Edit3,
  Info,
  FilePlus,
  FolderPlus,
  X,
  Check,
  Copy,
  Clock,
  Shield,
  File
} from 'lucide-react';
import { FileItem } from '../types';
import { INITIAL_FILE_SYSTEM } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import { FileGraph } from '../components/FileGraph';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  file: FileItem | null;
}

export const FileManagerApp: React.FC = () => {
  const [fs, setFs] = useState<FileItem[]>(INITIAL_FILE_SYSTEM);
  const [currentPath, setCurrentPath] = useState<string>('/Documents');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'graph'>('grid');

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    file: null,
  });

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Info modal state
  const [infoTarget, setInfoTarget] = useState<FileItem | null>(null);

  // New File/Folder modal state
  const [createType, setCreateType] = useState<'file' | 'folder' | null>(null);
  const [createName, setCreateName] = useState('');
  const createInputRef = useRef<HTMLInputElement>(null);

  // Clipboard copy state
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.isOpen) {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
        setRenameTarget(null);
        setInfoTarget(null);
        setCreateType(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen]);

  // Focus input when rename modal opens
  useEffect(() => {
    if (renameTarget && renameInputRef.current) {
      renameInputRef.current.focus();
      const dotIndex = renameTarget.name.lastIndexOf('.');
      if (dotIndex > 0 && renameTarget.type !== 'folder') {
        renameInputRef.current.setSelectionRange(0, dotIndex);
      } else {
        renameInputRef.current.select();
      }
    }
  }, [renameTarget]);

  // Focus input when create modal opens
  useEffect(() => {
    if (createType && createInputRef.current) {
      createInputRef.current.focus();
      createInputRef.current.select();
    }
  }, [createType]);

  // Find children of current path
  const findFolderByPath = (items: FileItem[], path: string): FileItem | null => {
    for (const item of items) {
      if (item.path === path) return item;
      if (item.children) {
        const found = findFolderByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const rootVault = fs[0];
  const currentFolder = findFolderByPath(fs, currentPath) || rootVault;
  const filesList = currentFolder.children || [];

  const handleSelectFolder = (path: string) => {
    soundEngine.playUiSound('click');
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const handleOpenFile = (file: FileItem) => {
    soundEngine.playUiSound('open');
    if (file.type === 'folder') {
      setCurrentPath(file.path);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const renderFileIcon = (type: string, className: string = 'w-5 h-5') => {
    switch (type) {
      case 'folder':
        return <Folder className={`${className} text-amber-400`} />;
      case 'code':
        return <FileCode className={`${className} text-blue-400`} />;
      case 'audio':
        return <FileAudio className={`${className} text-pink-400`} />;
      default:
        return <FileText className={`${className} text-slate-300`} />;
    }
  };

  // Right-click context menu trigger
  const handleContextMenu = (e: React.MouseEvent | MouseEvent, file: FileItem | null) => {
    e.preventDefault();
    e.stopPropagation();
    soundEngine.playUiSound('click');

    const menuWidth = 200;
    const menuHeight = file ? 190 : 140;
    const clientX = 'clientX' in e ? e.clientX : (e as any).pageX;
    const clientY = 'clientY' in e ? e.clientY : (e as any).pageY;

    const clampedX = Math.min(clientX, window.innerWidth - menuWidth - 12);
    const clampedY = Math.min(clientY, window.innerHeight - menuHeight - 12);

    setContextMenu({
      isOpen: true,
      x: Math.max(10, clampedX),
      y: Math.max(10, clampedY),
      file,
    });
  };

  // Download action
  const handleDownload = (file: FileItem) => {
    soundEngine.playUiSound('chime');
    let content = file.content || '';
    let mimeType = 'text/plain;charset=utf-8';
    let filename = file.name;

    if (file.type === 'folder') {
      // Export folder manifest as formatted JSON
      content = JSON.stringify(file, null, 2);
      filename = `${file.name}_manifest.json`;
      mimeType = 'application/json;charset=utf-8';
    } else if (file.name.endsWith('.html') || file.type === 'code') {
      mimeType = 'text/html;charset=utf-8';
    } else if (file.name.endsWith('.json')) {
      mimeType = 'application/json;charset=utf-8';
    } else if (file.name.endsWith('.md')) {
      mimeType = 'text/markdown;charset=utf-8';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  // Rename action starter
  const handleStartRename = (file: FileItem) => {
    soundEngine.playUiSound('click');
    setRenameTarget(file);
    setRenameValue(file.name);
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  // Submit rename
  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;

    const trimmedName = renameValue.trim();
    soundEngine.playUiSound('chime');

    const renameInTree = (items: FileItem[], id: string, newName: string): FileItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          const parentDir = item.path.substring(0, item.path.lastIndexOf('/'));
          const newPath = `${parentDir === '' ? '' : parentDir}/${newName}`;

          let newType = item.type;
          if (item.type !== 'folder') {
            if (/\.(js|ts|tsx|jsx|html|css|json|py|sh)$/i.test(newName)) newType = 'code';
            else if (/\.(mp3|wav|ogg|flac|aac)$/i.test(newName)) newType = 'audio';
            else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(newName)) newType = 'image';
            else newType = 'text';
          }

          const updateChildPaths = (children: FileItem[] | undefined, base: string): FileItem[] | undefined => {
            if (!children) return undefined;
            return children.map((c) => {
              const cPath = `${base}/${c.name}`;
              return {
                ...c,
                path: cPath,
                children: updateChildPaths(c.children, cPath),
              };
            });
          };

          return {
            ...item,
            name: newName,
            path: newPath,
            type: newType,
            updatedAt: new Date().toISOString(),
            children: updateChildPaths(item.children, newPath),
          };
        }
        if (item.children) {
          return {
            ...item,
            children: renameInTree(item.children, id, newName),
          };
        }
        return item;
      });
    };

    setFs((prevFs) => {
      const updated = renameInTree(prevFs, renameTarget.id, trimmedName);
      return updated;
    });

    if (selectedFile && selectedFile.id === renameTarget.id) {
      setSelectedFile((prev) => (prev ? { ...prev, name: trimmedName } : null));
    }

    setRenameTarget(null);
  };

  // Delete action
  const handleDelete = (file: FileItem) => {
    soundEngine.playUiSound('close');

    const deleteInTree = (items: FileItem[], id: string): FileItem[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => {
          if (item.children) {
            return {
              ...item,
              children: deleteInTree(item.children, id),
            };
          }
          return item;
        });
    };

    setFs((prevFs) => deleteInTree(prevFs, file.id));

    if (selectedFile && selectedFile.id === file.id) {
      setSelectedFile(null);
    }
    if (file.type === 'folder' && currentPath.startsWith(file.path)) {
      setCurrentPath('/Documents');
    }
    if (infoTarget && infoTarget.id === file.id) {
      setInfoTarget(null);
    }

    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  // Get Info action
  const handleGetInfo = (file: FileItem) => {
    soundEngine.playUiSound('open');
    setSelectedFile(file);
    setInfoTarget(file);
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  // Create new file or folder
  const handleSaveCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!createType || !createName.trim()) return;

    const trimmedName = createName.trim();
    soundEngine.playUiSound('chime');

    let inferredType: FileItem['type'] = createType === 'folder' ? 'folder' : 'text';
    if (createType === 'file') {
      if (/\.(js|ts|tsx|jsx|html|css|json|py|sh)$/i.test(trimmedName)) inferredType = 'code';
      else if (/\.(mp3|wav|ogg|flac|aac)$/i.test(trimmedName)) inferredType = 'audio';
      else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(trimmedName)) inferredType = 'image';
    }

    const newPath = `${currentPath === '/' ? '' : currentPath}/${trimmedName}`;
    const newItem: FileItem = {
      id: `file-${Date.now()}`,
      name: trimmedName,
      type: inferredType,
      path: newPath,
      size: createType === 'folder' ? undefined : '0.4 KB',
      content:
        createType === 'folder'
          ? undefined
          : inferredType === 'code'
          ? `// ${trimmedName}\n// Created in Aether Spatial Vault\n\nconsole.log("Aether.OS quantum node ready.");`
          : `New spatial note created in ${currentPath}.\nTimestamp: ${new Date().toLocaleString()}`,
      updatedAt: new Date().toISOString(),
      children: createType === 'folder' ? [] : undefined,
    };

    const addInTree = (items: FileItem[], targetFolder: string): FileItem[] => {
      return items.map((item) => {
        if (item.path === targetFolder && item.type === 'folder') {
          return {
            ...item,
            children: [...(item.children || []), newItem],
          };
        }
        if (item.children) {
          return {
            ...item,
            children: addInTree(item.children, targetFolder),
          };
        }
        return item;
      });
    };

    setFs((prevFs) => addInTree(prevFs, currentPath));
    setCreateType(null);
    setCreateName('');
  };

  const formatKindDescription = (file: FileItem) => {
    if (file.type === 'folder') return 'Spatial Directory (Folder)';
    if (file.name.endsWith('.md')) return 'Markdown Document (.md)';
    if (file.name.endsWith('.html')) return 'HTML5 / Canvas App (.html)';
    if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js')) return 'TypeScript / JavaScript Source';
    if (file.name.endsWith('.log')) return 'System Kernel Diagnostics Log';
    if (file.name.endsWith('.txt')) return 'Plain Text Document';
    if (file.type === 'audio') return 'Digital Audio Stream';
    if (file.type === 'code') return 'Executable Code Script';
    return 'Document';
  };

  const getStats = (content?: string) => {
    if (!content) return null;
    const lines = content.split('\n').length;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    return { lines, words, chars };
  };

  return (
    <div
      className="flex h-full bg-slate-950 text-slate-100 font-sans select-none relative"
      onContextMenu={(e) => handleContextMenu(e, null)}
    >
      {/* Left Directory Navigation Bar */}
      <div className="w-52 border-r border-white/10 bg-slate-900/60 p-3 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-white mb-3">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span>Aether Spatial Storage</span>
          </div>

          <div className="space-y-1 text-xs">
            <button
              onClick={() => handleSelectFolder('/Documents')}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center space-x-2 transition-all ${
                currentPath === '/Documents'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>Documents</span>
            </button>

            <button
              onClick={() => handleSelectFolder('/Projects')}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center space-x-2 transition-all ${
                currentPath === '/Projects'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => handleSelectFolder('/System')}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center space-x-2 transition-all ${
                currentPath === '/System'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-purple-400" />
              <span>System Logs</span>
            </button>
          </div>
        </div>

        {/* Storage status gauge */}
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-400">
          <div className="flex justify-between mb-1">
            <span>Spatial Vault</span>
            <span className="text-white font-mono">1.2 GB / 64 GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[12%] h-full bg-amber-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Files Grid & Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb Header & Action Bar */}
        <div className="px-4 py-2 bg-slate-900/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-slate-300 font-mono">
            <FolderKanban className="w-3.5 h-3.5 text-amber-400 mr-1" />
            <span>Vault</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className="text-white font-bold">{currentPath.replace('/', '') || 'Root'}</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* New File & New Folder action buttons */}
            <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setCreateType('file');
                  setCreateName('untitled.txt');
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 flex items-center space-x-1 text-xs transition-colors"
                title="Create New File"
              >
                <FilePlus className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline text-[11px]">New File</span>
              </button>
              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setCreateType('folder');
                  setCreateName('New Folder');
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 flex items-center space-x-1 text-xs transition-colors"
                title="Create New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">New Folder</span>
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setViewMode('grid');
                }}
                className={`p-1 rounded ${
                  viewMode === 'grid' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setViewMode('graph');
                }}
                className={`p-1 rounded ${
                  viewMode === 'graph' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
                title="D3.js Graph View"
              >
                <Network className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Input */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-xs">
              <Search className="w-3 h-3 text-slate-400 mr-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter files..."
                className="bg-transparent text-white placeholder:text-slate-500 outline-none text-xs w-28"
              />
            </div>
          </div>
        </div>

        {/* Files Grid / Graph View */}
        <div className="flex-1 flex overflow-hidden relative">
          {viewMode === 'grid' ? (
            <div
              className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 auto-rows-max overflow-y-auto"
              onContextMenu={(e) => handleContextMenu(e, null)}
            >
              {filesList
                .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((file) => {
                  const isSelected = selectedFile?.id === file.id;
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleOpenFile(file)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all group relative ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/50 shadow-md text-white'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white/5 mb-2 group-hover:scale-105 transition-transform">
                        {renderFileIcon(file.type)}
                      </div>
                      <span className="text-xs font-medium truncate w-full group-hover:text-white transition-colors">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{file.size || 'Folder'}</span>
                    </div>
                  );
                })}

              {filesList.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs">
                  Folder is empty. Right-click or use top buttons to create files.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              <FileGraph
                fs={fs}
                currentPath={currentPath}
                onSelectNode={handleOpenFile}
                onContextMenuNode={(e, file) => handleContextMenu(e, file)}
              />
            </div>
          )}

          {/* Right File Preview Pane (if selected) */}
          {selectedFile && (
            <div className="w-72 border-l border-white/10 bg-slate-900/60 p-4 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-xs text-white">File Inspector</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleStartRename(selectedFile)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                      title="Rename"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownload(selectedFile)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedFile)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">NAME</span>
                    <span className="font-medium text-white break-all">{selectedFile.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">KIND</span>
                    <span className="text-slate-300">{formatKindDescription(selectedFile)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">PATH</span>
                    <span className="font-mono text-slate-300 text-[11px] break-all">{selectedFile.path}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">SIZE</span>
                    <span className="text-slate-300">{selectedFile.size || 'Folder'}</span>
                  </div>
                </div>

                {/* Text Content Preview */}
                {selectedFile.content && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500 block text-[10px]">CONTENT PREVIEW</span>
                      <button
                        onClick={() => {
                          soundEngine.playUiSound('click');
                          navigator.clipboard.writeText(selectedFile.content || '');
                          setCopiedNotification(true);
                          setTimeout(() => setCopiedNotification(false), 1500);
                        }}
                        className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center space-x-1"
                      >
                        {copiedNotification ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto select-text">
                      {selectedFile.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT-CLICK CONTEXT MENU                                  */}
      {/* ========================================================= */}
      {contextMenu.isOpen && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-52 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.file ? (
            <>
              {/* File Title Bar in Context Menu */}
              <div className="px-2.5 py-1.5 border-b border-white/10 mb-1 flex items-center space-x-2">
                {renderFileIcon(contextMenu.file.type, 'w-3.5 h-3.5')}
                <span className="font-semibold text-white truncate text-[11px]">{contextMenu.file.name}</span>
              </div>

              {/* 1. Rename Option */}
              <button
                onClick={() => handleStartRename(contextMenu.file!)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Rename</span>
              </button>

              {/* 2. Download Option */}
              <button
                onClick={() => handleDownload(contextMenu.file!)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download</span>
              </button>

              {/* 3. Get Info Option */}
              <button
                onClick={() => handleGetInfo(contextMenu.file!)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Get Info</span>
              </button>

              <div className="my-1 border-t border-white/10" />

              {/* 4. Delete Option */}
              <button
                onClick={() => handleDelete(contextMenu.file!)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 flex items-center space-x-2.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            /* Context Menu when clicked on empty directory space */
            <>
              <div className="px-2.5 py-1.5 border-b border-white/10 mb-1 flex items-center space-x-2">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-white truncate text-[11px]">
                  {currentPath.replace('/', '') || 'Vault'}
                </span>
              </div>

              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setCreateType('file');
                  setCreateName('untitled.txt');
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
              >
                <FilePlus className="w-3.5 h-3.5 text-blue-400" />
                <span>New File</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setCreateType('folder');
                  setCreateName('New Folder');
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>New Folder</span>
              </button>

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={() => {
                  soundEngine.playUiSound('click');
                  setViewMode((prev) => (prev === 'grid' ? 'graph' : 'grid'));
                  setContextMenu((prev) => ({ ...prev, isOpen: false }));
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white flex items-center space-x-2.5 transition-colors"
              >
                <Network className="w-3.5 h-3.5 text-violet-400" />
                <span>Toggle Graph View</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* RENAME MODAL DIALOG                                       */}
      {/* ========================================================= */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-sm text-white">Rename Item</span>
              </div>
              <button
                onClick={() => setRenameTarget(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRename}>
              <label className="block text-xs text-slate-400 mb-2">New Name</label>
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400 transition-colors mb-4"
              />

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRenameTarget(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameValue.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium shadow-md transition-all"
                >
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATE FILE / FOLDER MODAL                                */}
      {/* ========================================================= */}
      {createType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                {createType === 'folder' ? (
                  <FolderPlus className="w-4 h-4 text-amber-400" />
                ) : (
                  <FilePlus className="w-4 h-4 text-blue-400" />
                )}
                <span className="font-semibold text-sm text-white">
                  {createType === 'folder' ? 'New Folder' : 'New File'}
                </span>
              </div>
              <button
                onClick={() => setCreateType(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate}>
              <label className="block text-xs text-slate-400 mb-2">
                {createType === 'folder' ? 'Folder Name' : 'File Name with extension'}
              </label>
              <input
                ref={createInputRef}
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={createType === 'folder' ? 'e.g. Archives' : 'e.g. script.js, note.md'}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors mb-4"
              />

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateType(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!createName.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-medium shadow-md transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GET INFO MODAL DIALOG                                     */}
      {/* ========================================================= */}
      {infoTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-sm text-white">Item Info</span>
              </div>
              <button
                onClick={() => setInfoTarget(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File Icon + Name Banner */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-xl mb-4">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
                {renderFileIcon(infoTarget.type, 'w-6 h-6')}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm text-white truncate">{infoTarget.name}</h4>
                <p className="text-xs text-cyan-400 font-mono">{formatKindDescription(infoTarget)}</p>
              </div>
            </div>

            {/* Metadata Rows */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500">Location:</span>
                <span className="font-mono text-slate-200 text-right max-w-[260px] truncate">{infoTarget.path}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500">File Size:</span>
                <span className="font-mono text-slate-200">{infoTarget.size || 'Folder'}</span>
              </div>

              {infoTarget.content && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-500">Text Metrics:</span>
                  <span className="font-mono text-slate-200">
                    {getStats(infoTarget.content)?.lines} lines, {getStats(infoTarget.content)?.words} words,{' '}
                    {getStats(infoTarget.content)?.chars} chars
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500">Last Modified:</span>
                <span className="font-mono text-slate-200">
                  {infoTarget.updatedAt ? new Date(infoTarget.updatedAt).toLocaleString() : 'Just now'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-500">Permissions:</span>
                <span className="font-mono text-emerald-400">POSIX 0644 (Read & Write)</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleDelete(infoTarget)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const target = infoTarget;
                    setInfoTarget(null);
                    handleStartRename(target);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => {
                    handleDownload(infoTarget);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

