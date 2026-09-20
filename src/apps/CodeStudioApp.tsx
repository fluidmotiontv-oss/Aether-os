import React, { useState, useRef } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Copy,
  Check,
  Maximize2,
  Eye,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

const TEMPLATES: Record<string, { name: string; code: string }> = {
  cube: {
    name: '3D Holographic Cube',
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; background: #070913; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; perspective: 1000px; font-family: sans-serif; }
  .scene { width: 140px; height: 140px; transform-style: preserve-3d; animation: spin 8s linear infinite; }
  @keyframes spin { 0% { transform: rotateX(0deg) rotateY(0deg); } 100% { transform: rotateX(360deg) rotateY(360deg); } }
  .face { position: absolute; width: 140px; height: 140px; border: 2px solid #8b5cf6; background: rgba(139, 92, 246, 0.15); box-shadow: inset 0 0 20px rgba(6, 182, 212, 0.4); display: flex; justify-content: center; align-items: center; color: #a5f3fc; font-weight: bold; font-size: 14px; letter-spacing: 2px; }
  .front { transform: translateZ(70px); }
  .back { transform: rotateY(180deg) translateZ(70px); }
  .right { transform: rotateY(90deg) translateZ(70px); }
  .left { transform: rotateY(-90deg) translateZ(70px); }
  .top { transform: rotateX(90deg) translateZ(70px); }
  .bottom { transform: rotateX(-90deg) translateZ(70px); }
</style>
</head>
<body>
  <div class="scene">
    <div class="face front">AETHER</div>
    <div class="face back">SPATIAL</div>
    <div class="face right">QUANTUM</div>
    <div class="face left">SYNAPSE</div>
    <div class="face top">LIGHT</div>
    <div class="face bottom">CORE</div>
  </div>
</body>
</html>`,
  },
  particles: {
    name: 'Neon Particle Vortex',
    code: `<!DOCTYPE html>
<html>
<body style="margin:0;background:#050711;overflow:hidden;">
<canvas id="c"></canvas>
<script>
const c = document.getElementById('c'), ctx = c.getContext('2d');
let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
window.onresize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
const P = Array.from({length: 120}, () => ({
  angle: Math.random() * Math.PI * 2,
  radius: Math.random() * (w * 0.35),
  speed: Math.random() * 0.02 + 0.005,
  size: Math.random() * 2 + 1,
  color: \`hsl(\${Math.random() * 60 + 260}, 90%, 65%)\`
}));
function loop() {
  ctx.fillStyle = 'rgba(5, 7, 17, 0.15)';
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  P.forEach(p => {
    p.angle += p.speed;
    p.radius -= 0.3;
    if(p.radius < 5) p.radius = w * 0.35;
    const x = cx + Math.cos(p.angle) * p.radius;
    const y = cy + Math.sin(p.angle) * p.radius;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color;
    ctx.fill();
  });
  requestAnimationFrame(loop);
}
loop();
</script>
</body>
</html>`,
  },
  plasma: {
    name: 'Quantum Plasma Wave',
    code: `<!DOCTYPE html>
<html>
<body style="margin:0;background:#070714;overflow:hidden;display:flex;justify-content:center;align-items:center;height:100vh;">
<canvas id="c"></canvas>
<script>
const c = document.getElementById('c'), ctx = c.getContext('2d');
let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
let t = 0;
function draw() {
  t += 0.03;
  ctx.fillStyle = '#060714';
  ctx.fillRect(0, 0, w, h);
  for(let x = 0; x < w; x += 12) {
    const y = h/2 + Math.sin(x * 0.01 + t) * 60 + Math.cos(x * 0.02 + t * 0.5) * 40;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI*2);
    ctx.fillStyle = \`hsl(\${(x + t * 50) % 360}, 85%, 60%)\`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>`,
  },
};

export const CodeStudioApp: React.FC = () => {
  const [code, setCode] = useState(TEMPLATES.cube.code);
  const [activeTemplate, setActiveTemplate] = useState('cube');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRun = () => {
    soundEngine.playUiSound('warp');
  };

  const handleSelectTemplate = (key: string) => {
    soundEngine.playUiSound('click');
    setActiveTemplate(key);
    setCode(TEMPLATES[key].code);
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim() || isGenerating) return;
    soundEngine.playUiSound('key');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/code-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, currentCode: code }),
      });
      const data = await res.json();
      if (data.code) {
        soundEngine.playUiSound('chime');
        setCode(data.code);
        setAiPrompt('');
      }
    } catch {
      soundEngine.playUiSound('click');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    soundEngine.playUiSound('click');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-text">
      {/* Top Controls Toolbar */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-xs text-white">Cosmic Code Studio</span>

          {/* Template Selectors */}
          <div className="hidden sm:flex items-center space-x-1 ml-4">
            {Object.entries(TEMPLATES).map(([k, t]) => (
              <button
                key={k}
                onClick={() => handleSelectTemplate(k)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-all ${
                  activeTemplate === k
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center space-x-1"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleRun}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-md shadow-blue-600/30"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live Sandbox</span>
          </button>
        </div>
      </div>

      {/* AI Code Generator Bar */}
      <div className="px-4 py-1.5 bg-slate-900/50 border-b border-white/5 flex items-center space-x-2 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse shrink-0" />
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerateAI()}
          placeholder="Ask AI to generate or tweak canvas / HTML animation (e.g. 'Create a glowing orbital solar ring')..."
          className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
        />
        <button
          onClick={handleGenerateAI}
          disabled={!aiPrompt.trim() || isGenerating}
          className="px-3 py-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-all"
        >
          {isGenerating ? 'Synthesizing...' : 'Generate with AI'}
        </button>
      </div>

      {/* Dual Pane: Code Editor (Left) + Sandbox Preview (Right) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left: Code Editor Textarea */}
        <div className="flex flex-col border-r border-white/10 bg-slate-950/80 p-3">
          <div className="text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center justify-between">
            <span>HTML / CSS / JS Source</span>
            <span className="text-blue-400">Live Auto-Reload</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-xs text-blue-200 leading-relaxed placeholder:text-slate-600 selection:bg-blue-600/40"
            spellCheck={false}
          />
        </div>

        {/* Right: Live Sandbox iframe */}
        <div className="flex flex-col bg-slate-950 p-3">
          <div className="text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center justify-between">
            <span className="flex items-center space-x-1 text-emerald-400">
              <Eye className="w-3 h-3" />
              <span>Interactive Sandbox Canvas</span>
            </span>
            <span className="text-slate-400">60 FPS</span>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border border-white/15 bg-black relative">
            <iframe
              title="Aether Live Sandbox"
              srcDoc={code}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
