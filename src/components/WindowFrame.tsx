import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, Maximize2, LayoutGrid, Columns, Sparkles } from 'lucide-react';
import { WindowState, SnapTarget } from '../types';
import { soundEngine } from '../utils/audio';

interface WindowFrameProps {
  window: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSnap?: (target: SnapTarget) => void;
  onUpdateBounds: (bounds: { x: number; y: number; width: number; height: number }) => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onSnap,
  onUpdateBounds,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeSnapPreview, setActiveSnapPreview] = useState<SnapTarget>(null);
  const [isSnapMenuOpen, setIsSnapMenuOpen] = useState(false);
  const snapMenuTimerRef = useRef<any>(null);

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });

  // Handle Dragging
  const handleMouseDownHeader = (e: React.MouseEvent | React.TouchEvent) => {
    if (window.isMaximized) return;
    if ((e.target as HTMLElement).closest('button')) return;

    onFocus();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      winX: window.position.x,
      winY: window.position.y,
    };
  };

  // Handle Resizing
  const handleMouseDownResize = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (window.isMaximized) return;

    onFocus();
    setIsResizing(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    resizeStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      width: window.size.width,
      height: window.size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        const dx = clientX - dragStartRef.current.mouseX;
        const dy = clientY - dragStartRef.current.mouseY;
        const newX = Math.max(0, Math.min(window.innerWidth - 60, dragStartRef.current.winX + dx));
        const newY = Math.max(36, Math.min(window.innerHeight - 80, dragStartRef.current.winY + dy));
        
        onUpdateBounds({
          x: newX,
          y: newY,
          width: window.size.width,
          height: window.size.height,
        });

        // Magnetic Edge & Corner Snapping Detection
        const mouseX = clientX;
        const mouseY = clientY;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        if (mouseY < 42) {
          setActiveSnapPreview('top');
        } else if (mouseX < 25 && mouseY < screenH * 0.35) {
          setActiveSnapPreview('top-left');
        } else if (mouseX < 25 && mouseY > screenH * 0.65) {
          setActiveSnapPreview('bottom-left');
        } else if (mouseX < 25) {
          setActiveSnapPreview('left');
        } else if (mouseX > screenW - 25 && mouseY < screenH * 0.35) {
          setActiveSnapPreview('top-right');
        } else if (mouseX > screenW - 25 && mouseY > screenH * 0.65) {
          setActiveSnapPreview('bottom-right');
        } else if (mouseX > screenW - 25) {
          setActiveSnapPreview('right');
        } else {
          setActiveSnapPreview(null);
        }
      } else if (isResizing) {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        const dx = clientX - resizeStartRef.current.mouseX;
        const dy = clientY - resizeStartRef.current.mouseY;
        const newW = Math.max(280, resizeStartRef.current.width + dx);
        const newH = Math.max(200, resizeStartRef.current.height + dy);
        onUpdateBounds({
          x: window.position.x,
          y: window.position.y,
          width: newW,
          height: newH,
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging && activeSnapPreview && onSnap) {
        soundEngine.playUiSound('warp');
        onSnap(activeSnapPreview);
      }
      setIsDragging(false);
      setIsResizing(false);
      setActiveSnapPreview(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isResizing, window.position, window.size, onUpdateBounds, activeSnapPreview, onSnap]);

  if (window.isMinimized) return null;

  const style: React.CSSProperties = window.isMaximized
    ? {
        top: '36px',
        left: '0px',
        width: '100vw',
        height: 'calc(100vh - 36px - 72px)',
        zIndex: window.zIndex,
      }
    : {
        top: `${window.position.y}px`,
        left: `${window.position.x}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`,
        zIndex: window.zIndex,
      };

  return (
    <>
      {/* Magnetic Snapping Ghost Zone Overlay */}
      {isDragging && activeSnapPreview && (
        <div
          className={`fixed pointer-events-none z-30 transition-all duration-150 rounded-2xl bg-violet-600/20 border-2 border-violet-400/60 backdrop-blur-xs shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-pulse ${
            activeSnapPreview === 'left'
              ? 'top-9 left-2 bottom-20 w-[calc(50vw-12px)]'
              : activeSnapPreview === 'right'
              ? 'top-9 right-2 bottom-20 w-[calc(50vw-12px)]'
              : activeSnapPreview === 'top'
              ? 'top-9 left-2 right-2 bottom-20'
              : activeSnapPreview === 'top-left'
              ? 'top-9 left-2 w-[calc(50vw-12px)] h-[calc(50vh-45px)]'
              : activeSnapPreview === 'top-right'
              ? 'top-9 right-2 w-[calc(50vw-12px)] h-[calc(50vh-45px)]'
              : activeSnapPreview === 'bottom-left'
              ? 'top-[calc(50vh+5px)] left-2 w-[calc(50vw-12px)] h-[calc(50vh-85px)]'
              : activeSnapPreview === 'bottom-right'
              ? 'top-[calc(50vh+5px)] right-2 w-[calc(50vw-12px)] h-[calc(50vh-85px)]'
              : ''
          }`}
        />
      )}

      {/* Main Window Frame */}
      <div
        id={`window-${window.id}`}
        style={style}
        onMouseDown={onFocus}
        className={`fixed rounded-2xl flex flex-col overflow-hidden transition-shadow duration-150 backdrop-blur-2xl select-none ${
          isActive
            ? 'bg-slate-900/90 border border-violet-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_20px_rgba(139,92,246,0.2)]'
            : 'bg-slate-950/80 border border-white/15 shadow-xl opacity-95'
        }`}
      >
        {/* Titlebar Header */}
        <div
          onMouseDown={handleMouseDownHeader}
          onTouchStart={handleMouseDownHeader}
          onDoubleClick={onMaximize}
          className={`h-10 px-3.5 flex items-center justify-between border-b border-white/10 cursor-default select-none shrink-0 ${
            isActive ? 'bg-white/5' : 'bg-transparent'
          }`}
        >
          {/* Left: Traffic light control buttons */}
          <div className="flex items-center space-x-2 group relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playUiSound('close');
                onClose();
              }}
              className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-rose-950 opacity-90 transition-all"
              title="Close Window"
            >
              <X className="w-2 h-2 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playUiSound('minimize');
                onMinimize();
              }}
              className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-amber-950 opacity-90 transition-all"
              title="Minimize Window"
            >
              <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100" />
            </button>

            {/* Maximize & Snap Layouts Trigger */}
            <div
              className="relative"
              onMouseEnter={() => {
                snapMenuTimerRef.current = setTimeout(() => setIsSnapMenuOpen(true), 350);
              }}
              onMouseLeave={() => {
                if (snapMenuTimerRef.current) clearTimeout(snapMenuTimerRef.current);
                setIsSnapMenuOpen(false);
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playUiSound('click');
                  onMaximize();
                }}
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-emerald-950 opacity-90 transition-all"
                title={window.isMaximized ? 'Restore' : 'Maximize (Hover for Snap Layouts)'}
              >
                <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100" />
              </button>

              {/* Snap Layouts Flyout Menu */}
              {isSnapMenuOpen && onSnap && (
                <div
                  className="absolute top-5 left-0 w-44 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5 px-1">
                    Snap Layout
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Left Half */}
                    <button
                      onClick={() => {
                        soundEngine.playUiSound('warp');
                        onSnap('left');
                        setIsSnapMenuOpen(false);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-violet-600/30 border border-white/10 flex items-center space-x-1.5 text-[11px] text-slate-200"
                    >
                      <div className="w-3.5 h-3 bg-violet-400/80 rounded-xs" />
                      <span>Left</span>
                    </button>

                    {/* Right Half */}
                    <button
                      onClick={() => {
                        soundEngine.playUiSound('warp');
                        onSnap('right');
                        setIsSnapMenuOpen(false);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-violet-600/30 border border-white/10 flex items-center space-x-1.5 text-[11px] text-slate-200"
                    >
                      <div className="w-3.5 h-3 bg-cyan-400/80 rounded-xs ml-auto" />
                      <span>Right</span>
                    </button>

                    {/* Maximize */}
                    <button
                      onClick={() => {
                        soundEngine.playUiSound('warp');
                        onSnap('top');
                        setIsSnapMenuOpen(false);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-violet-600/30 border border-white/10 flex items-center space-x-1.5 text-[11px] text-slate-200 col-span-2 justify-center"
                    >
                      <div className="w-6 h-3 bg-emerald-400/80 rounded-xs" />
                      <span>Full Screen</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Window Title */}
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-200">
            <span className="truncate max-w-xs">{window.title}</span>
          </div>

          {/* Right: Subtle indicator */}
          <div className="w-12 flex justify-end items-center">
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
          </div>
        </div>

        {/* Window Body Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-950/40 select-text">
          {children}
        </div>

        {/* Resize Handle (Bottom-Right) */}
        {!window.isMaximized && (
          <div
            onMouseDown={handleMouseDownResize}
            onTouchStart={handleMouseDownResize}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-slate-500 hover:text-violet-400 z-30"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="5" cy="5" r="0.8" />
              <circle cx="5" cy="2" r="0.8" />
              <circle cx="2" cy="5" r="0.8" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
};

