import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Type,
  StickyNote,
  Download,
  RotateCcw,
  RotateCw,
  Trash2,
  Plus,
  Move,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

type Tool = 'pen' | 'highlighter' | 'eraser' | 'rect' | 'circle' | 'arrow' | 'note';

interface ThoughtNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string;
  color: string;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface DrawingStroke {
  tool: Tool;
  color: string;
  width: number;
  points: StrokePoint[];
}

const PALETTE = [
  '#a855f7', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#ffffff', // White
];

export const WhiteboardApp: React.FC = () => {
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<string>('#a855f7');
  const [brushSize, setBrushSize] = useState<number>(3);
  const [nodes, setNodes] = useState<ThoughtNode[]>([
    {
      id: 'node-1',
      x: 80,
      y: 80,
      width: 200,
      height: 140,
      title: 'Neural Kernel Architecture',
      content: 'Multi-modal LLM orchestration layer with zero-latency synaptic graph memory.',
      color: '#a855f7',
    },
    {
      id: 'node-2',
      x: 340,
      y: 120,
      width: 210,
      height: 130,
      title: 'Quantum Shaders',
      content: 'Dynamic WebGL particle systems synchronized with celestial time pulses.',
      color: '#06b6d4',
    },
  ]);

  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<DrawingStroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);

  // Redraw canvas whenever strokes change
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((st) => {
      if (st.points.length === 0) return;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(st.points[0].x, st.points[0].y);

      if (st.tool === 'highlighter') {
        ctx.strokeStyle = st.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = st.width * 4;
        ctx.lineCap = 'square';
      } else if (st.tool === 'eraser') {
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = st.width * 5;
        ctx.lineCap = 'round';
      } else {
        ctx.strokeStyle = st.color;
        ctx.lineWidth = st.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = st.color;
        ctx.shadowBlur = 8;
      }

      if (st.tool === 'rect' && st.points.length >= 2) {
        const start = st.points[0];
        const end = st.points[st.points.length - 1];
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (st.tool === 'circle' && st.points.length >= 2) {
        const start = st.points[0];
        const end = st.points[st.points.length - 1];
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        const cx = Math.min(start.x, end.x) + rx;
        const cy = Math.min(start.y, end.y) + ry;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        for (let i = 1; i < st.points.length; i++) {
          ctx.lineTo(st.points[i].x, st.points[i].y);
        }
        ctx.stroke();
      }

      ctx.restore();
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      redrawCanvas();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [strokes]);

  // Canvas Mouse Handlers
  const handleMouseDownCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'note') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addNote(x, y);
      setTool('pen');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    currentStrokeRef.current = {
      tool,
      color,
      width: brushSize,
      points: [{ x, y }],
    };

    soundEngine.playUiSound('click');
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStrokeRef.current.points.push({ x, y });

    // Live intermediate stroke render
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawCanvas();

    // Draw current active stroke
    const st = currentStrokeRef.current;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(st.points[0].x, st.points[0].y);
    if (st.tool === 'highlighter') {
      ctx.strokeStyle = st.color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = st.width * 4;
      ctx.lineCap = 'square';
    } else if (st.tool === 'eraser') {
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = st.width * 5;
    } else {
      ctx.strokeStyle = st.color;
      ctx.lineWidth = st.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = st.color;
      ctx.shadowBlur = 6;
    }

    if (st.tool === 'rect' && st.points.length >= 2) {
      const start = st.points[0];
      const end = st.points[st.points.length - 1];
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (st.tool === 'circle' && st.points.length >= 2) {
      const start = st.points[0];
      const end = st.points[st.points.length - 1];
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      const cx = Math.min(start.x, end.x) + rx;
      const cy = Math.min(start.y, end.y) + ry;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      for (let i = 1; i < st.points.length; i++) {
        ctx.lineTo(st.points[i].x, st.points[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  const handleMouseUpCanvas = () => {
    if (isDrawingRef.current && currentStrokeRef.current) {
      setStrokes((prev) => [...prev, currentStrokeRef.current!]);
      setUndoneStrokes([]);
      currentStrokeRef.current = null;
    }
    isDrawingRef.current = false;
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    soundEngine.playUiSound('click');
    const last = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, -1));
    setUndoneStrokes((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (undoneStrokes.length === 0) return;
    soundEngine.playUiSound('click');
    const last = undoneStrokes[undoneStrokes.length - 1];
    setUndoneStrokes((prev) => prev.slice(0, -1));
    setStrokes((prev) => [...prev, last]);
  };

  const handleClear = () => {
    soundEngine.playUiSound('close');
    setStrokes([]);
    setUndoneStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Sticky Nodes Management
  const addNote = (x = 100, y = 100) => {
    soundEngine.playUiSound('open');
    const newNode: ThoughtNode = {
      id: `node-${Date.now()}`,
      x,
      y,
      width: 200,
      height: 130,
      title: 'New Thought Node',
      content: 'Capture spatial insights or architecture logic here...',
      color: color || '#a855f7',
    };
    setNodes((prev) => [...prev, newNode]);
    setActiveNodeId(newNode.id);
  };

  const updateNode = (id: string, patch: Partial<ThoughtNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const deleteNode = (id: string) => {
    soundEngine.playUiSound('close');
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (activeNodeId === id) setActiveNodeId(null);
  };

  // Node Dragging Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') return;
    e.stopPropagation();
    setActiveNodeId(id);
    setDraggingNodeId(id);
    const node = nodes.find((n) => n.id === id);
    if (node) {
      dragOffsetRef.current = {
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      };
    }
  };

  useEffect(() => {
    const handleMouseMoveWindow = (e: MouseEvent) => {
      if (draggingNodeId) {
        const newX = Math.max(10, e.clientX - dragOffsetRef.current.x);
        const newY = Math.max(10, e.clientY - dragOffsetRef.current.y);
        updateNode(draggingNodeId, { x: newX, y: newY });
      }
    };
    const handleMouseUpWindow = () => {
      setDraggingNodeId(null);
    };

    if (draggingNodeId) {
      window.addEventListener('mousemove', handleMouseMoveWindow);
      window.addEventListener('mouseup', handleMouseUpWindow);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWindow);
      window.removeEventListener('mouseup', handleMouseUpWindow);
    };
  }, [draggingNodeId]);

  // Export Canvas
  const exportCanvasAsImage = () => {
    soundEngine.playUiSound('chime');
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas with dark background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `synaptic-canvas-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div id="synaptic-whiteboard-app" className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-white/10 shrink-0 z-20">
        {/* Left: Tools */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => { soundEngine.playUiSound('click'); setTool('pen'); }}
            className={`p-1.5 rounded-lg transition-all ${
              tool === 'pen' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Neon Pen"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => { soundEngine.playUiSound('click'); setTool('highlighter'); }}
            className={`p-1.5 rounded-lg transition-all ${
              tool === 'highlighter' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Glow Highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            onClick={() => { soundEngine.playUiSound('click'); setTool('rect'); }}
            className={`p-1.5 rounded-lg transition-all ${
              tool === 'rect' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => { soundEngine.playUiSound('click'); setTool('circle'); }}
            className={`p-1.5 rounded-lg transition-all ${
              tool === 'circle' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            onClick={() => { soundEngine.playUiSound('click'); setTool('eraser'); }}
            className={`p-1.5 rounded-lg transition-all ${
              tool === 'eraser' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-white/10 mx-1" />

          {/* Add Sticky Node Button */}
          <button
            onClick={() => addNote(150, 150)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/40 transition-all text-xs font-medium"
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>
        </div>

        {/* Center: Color Palette */}
        <div className="flex items-center space-x-1.5 bg-white/5 px-2 py-1 rounded-xl border border-white/10">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => { soundEngine.playUiSound('click'); setColor(c); }}
              style={{ backgroundColor: c }}
              className={`w-4 h-4 rounded-full transition-transform ${
                color === c ? 'scale-125 ring-2 ring-white shadow-[0_0_8px_currentColor]' : 'hover:scale-110 opacity-80'
              }`}
            />
          ))}
          <div className="h-4 w-[1px] bg-white/10 mx-1" />
          {/* Size slider */}
          <input
            type="range"
            min={1}
            max={12}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-16 h-1 accent-violet-400 cursor-pointer"
            title={`Size: ${brushSize}px`}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={undoneStrokes.length === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-white/10 mx-1" />

          <button
            onClick={exportCanvasAsImage}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/40 transition-all text-xs font-medium"
            title="Export PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Infinite Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Drawing HTML Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDownCanvas}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
          onMouseLeave={handleMouseUpCanvas}
          className="absolute inset-0 w-full h-full cursor-crosshair z-0"
        />

        {/* Floating Spatial Sticky Nodes */}
        {nodes.map((node) => {
          const isActive = activeNodeId === node.id;
          return (
            <div
              key={node.id}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                borderColor: `${node.color}50`,
                boxShadow: isActive ? `0 12px 30px ${node.color}30` : '0 8px 24px rgba(0,0,0,0.5)',
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              className={`absolute rounded-2xl bg-slate-900/90 backdrop-blur-xl border p-3 flex flex-col justify-between transition-shadow z-10 select-none group cursor-move ${
                isActive ? 'ring-2 ring-violet-400' : ''
              }`}
            >
              {/* Node Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <input
                  type="text"
                  value={node.title}
                  onChange={(e) => updateNode(node.id, { title: e.target.value })}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none focus:border-b focus:border-white/40 w-36 truncate"
                />
                <button
                  onClick={() => deleteNode(node.id)}
                  className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Node Body */}
              <textarea
                value={node.content}
                onChange={(e) => updateNode(node.id, { content: e.target.value })}
                className="w-full h-20 mt-2 bg-transparent text-[11px] text-slate-300 resize-none focus:outline-none scrollbar-none font-sans leading-relaxed"
                placeholder="Type thoughts..."
              />

              {/* Node Color Swatch Bar */}
              <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[10px] text-slate-500">
                <div className="flex space-x-1">
                  {PALETTE.slice(0, 4).map((c) => (
                    <button
                      key={c}
                      onClick={() => updateNode(node.id, { color: c })}
                      style={{ backgroundColor: c }}
                      className="w-2.5 h-2.5 rounded-full hover:scale-125 transition-transform"
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] uppercase">Node</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
