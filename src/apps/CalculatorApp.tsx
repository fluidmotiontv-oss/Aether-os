import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  RotateCcw,
  History,
  Sparkles,
  ArrowRightLeft,
  LineChart,
  Atom,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

type CalcMode = 'scientific' | 'converter' | 'grapher' | 'constants';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

const QUANTUM_CONSTANTS = [
  { name: "Planck's Constant (h)", symbol: 'h', value: '6.62607015e-34', unit: 'J·s', desc: 'Quantum action quantum ratio' },
  { name: 'Speed of Light (c)', symbol: 'c', value: '299792458', unit: 'm/s', desc: 'Universal cosmic speed limit' },
  { name: 'Gravitational Constant (G)', symbol: 'G', value: '6.67430e-11', unit: 'm³·kg⁻¹·s⁻²', desc: 'Universal Newtonian gravitational constant' },
  { name: 'Boltzmann Constant (k)', symbol: 'k_B', value: '1.380649e-23', unit: 'J/K', desc: 'Microscopic kinetic energy per temperature' },
  { name: 'Elementary Charge (e)', symbol: 'e', value: '1.602176634e-19', unit: 'C', desc: 'Electric charge carried by single proton' },
  { name: 'Fine Structure Constant (α)', symbol: 'α', value: '0.0072973525693', unit: 'dimensionless', desc: 'Electromagnetic interaction strength' },
  { name: 'Avogadro Constant (N_A)', symbol: 'N_A', value: '6.02214076e23', unit: 'mol⁻¹', desc: 'Number of constituent particles in 1 mole' },
  { name: 'Hubble Constant (H₀)', symbol: 'H_0', value: '70.4', unit: '(km/s)/Mpc', desc: 'Universal cosmic expansion rate' },
];

const UNIT_CATEGORIES = {
  Astrophysics: [
    { name: 'Meters (m)', factor: 1 },
    { name: 'Kilometers (km)', factor: 1000 },
    { name: 'Miles (mi)', factor: 1609.34 },
    { name: 'Astronomical Unit (AU)', factor: 1.496e11 },
    { name: 'Light Year (ly)', factor: 9.461e15 },
    { name: 'Parsec (pc)', factor: 3.086e16 },
  ],
  DataStorage: [
    { name: 'Bytes (B)', factor: 1 },
    { name: 'Kilobytes (KB)', factor: 1024 },
    { name: 'Megabytes (MB)', factor: 1024 ** 2 },
    { name: 'Gigabytes (GB)', factor: 1024 ** 3 },
    { name: 'Terabytes (TB)', factor: 1024 ** 4 },
    { name: 'Petabytes (PB)', factor: 1024 ** 5 },
  ],
  Speed: [
    { name: 'Meters/sec (m/s)', factor: 1 },
    { name: 'Kilometers/hr (km/h)', factor: 0.277778 },
    { name: 'Miles/hr (mph)', factor: 0.44704 },
    { name: 'Mach (Sound)', factor: 343 },
    { name: 'Speed of Light (c)', factor: 299792458 },
  ],
  Energy: [
    { name: 'Joules (J)', factor: 1 },
    { name: 'Electronvolts (eV)', factor: 1.60218e-19 },
    { name: 'Megaelectronvolts (MeV)', factor: 1.60218e-13 },
    { name: 'Kilocalories (kcal)', factor: 4184 },
    { name: 'Kilowatt-hour (kWh)', factor: 3.6e6 },
  ],
};

export const CalculatorApp: React.FC = () => {
  const [mode, setMode] = useState<CalcMode>('scientific');
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isRad, setIsRad] = useState(true);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState<keyof typeof UNIT_CATEGORIES>('Astrophysics');
  const [fromUnitIdx, setFromUnitIdx] = useState(0);
  const [toUnitIdx, setToUnitIdx] = useState(3);
  const [convertInputValue, setConvertInputValue] = useState('1');

  // Grapher State
  const [graphFunc, setGraphFunc] = useState('sin(x) * cos(x/2)');
  const [graphRange, setGraphRange] = useState(10);
  const [isGraphAnimated, setIsGraphAnimated] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphAnimRef = useRef<number | null>(null);

  const handleButtonClick = (val: string) => {
    soundEngine.playUiSound('key');

    if (val === 'C') {
      setDisplay('0');
      setExpression('');
      return;
    }

    if (val === 'CE') {
      setDisplay('0');
      return;
    }

    if (val === 'DEL') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
      return;
    }

    if (val === '=') {
      try {
        let sanitized = (expression + display)
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e(?![a-z])/g, 'Math.E')
          .replace(/sin\(/g, isRad ? 'Math.sin(' : 'Math.sin(Math.PI/180*')
          .replace(/cos\(/g, isRad ? 'Math.cos(' : 'Math.cos(Math.PI/180*')
          .replace(/tan\(/g, isRad ? 'Math.tan(' : 'Math.tan(Math.PI/180*')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**');

        // Safe eval
        // eslint-disable-next-line no-eval
        const rawRes = Function(`'use strict'; return (${sanitized})`)();
        const formatted = Number.isInteger(rawRes)
          ? rawRes.toString()
          : Number(rawRes.toFixed(8)).toString();

        const newItem: HistoryItem = {
          id: Date.now().toString(),
          expression: expression + display,
          result: formatted,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        setHistory((prev) => [newItem, ...prev.slice(0, 20)]);
        setDisplay(formatted);
        setExpression('');
        soundEngine.playUiSound('chime');
      } catch {
        setDisplay('Error');
        soundEngine.playUiSound('close');
      }
      return;
    }

    if (['+', '-', '×', '÷', '^'].includes(val)) {
      setExpression((prev) => `${prev} ${display} ${val} `);
      setDisplay('0');
      return;
    }

    if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt('].includes(val)) {
      setDisplay(val);
      return;
    }

    if (val === 'π') {
      setDisplay(Math.PI.toString());
      return;
    }

    if (val === 'e') {
      setDisplay(Math.E.toString());
      return;
    }

    if (val === '±') {
      if (display.startsWith('-')) {
        setDisplay(display.slice(1));
      } else if (display !== '0') {
        setDisplay('-' + display);
      }
      return;
    }

    if (val === '1/x') {
      const num = parseFloat(display);
      if (num !== 0) setDisplay((1 / num).toString());
      return;
    }

    if (val === 'x²') {
      const num = parseFloat(display);
      setDisplay((num ** 2).toString());
      return;
    }

    if (val === '.') {
      if (!display.includes('.')) {
        setDisplay(display + '.');
      }
      return;
    }

    // Numbers
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  // Unit Converter Calculation
  const units = UNIT_CATEGORIES[unitCategory];
  const fromFactor = units[fromUnitIdx]?.factor || 1;
  const toFactor = units[toUnitIdx]?.factor || 1;
  const numInput = parseFloat(convertInputValue) || 0;
  const convertedResult = (numInput * fromFactor) / toFactor;
  const formattedConverted = convertedResult < 0.0001 || convertedResult > 10000000
    ? convertedResult.toExponential(6)
    : Number(convertedResult.toFixed(6)).toString();

  // Graph Canvas Renderer
  useEffect(() => {
    if (mode !== 'grapher') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const render = () => {
      time += 0.03;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 500);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 350);

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Draw Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;

      const centerX = w / 2;
      const centerY = h / 2;
      const scale = (w / 2) / graphRange;

      for (let x = -graphRange; x <= graphRange; x += 2) {
        const px = centerX + x * scale;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
        ctx.stroke();
      }

      for (let y = -graphRange; y <= graphRange; y += 2) {
        const py = centerY - y * scale;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();
      }

      // Draw Main Axes
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, h);
      ctx.stroke();

      // Plot Function
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;
      ctx.beginPath();

      let isFirst = true;
      for (let px = 0; px < w; px += 2) {
        const x = (px - centerX) / scale;
        try {
          // Eval function
          const t = isGraphAnimated ? time : 0;
          const parsed = graphFunc
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/abs\(/g, 'Math.abs(')
            .replace(/exp\(/g, 'Math.exp(')
            .replace(/log\(/g, 'Math.log(')
            .replace(/x/g, `(${x} + ${t * 0.5})`);

          // eslint-disable-next-line no-eval
          const y = Function(`'use strict'; return (${parsed})`)();
          if (!isNaN(y) && isFinite(y)) {
            const py = centerY - y * scale;
            if (isFirst) {
              ctx.moveTo(px, py);
              isFirst = false;
            } else {
              ctx.lineTo(px, py);
            }
          }
        } catch {
          // Skip invalid points
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (isGraphAnimated) {
        graphAnimRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (graphAnimRef.current) cancelAnimationFrame(graphAnimRef.current);
    };
  }, [mode, graphFunc, graphRange, isGraphAnimated]);

  const copyToClipboard = (text: string, id: string) => {
    soundEngine.playUiSound('click');
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div id="quantum-calculator-app" className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Mode Navigation */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-1.5 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { soundEngine.playUiSound('click'); setMode('scientific'); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              mode === 'scientific' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Scientific</span>
          </button>

          <button
            onClick={() => { soundEngine.playUiSound('click'); setMode('converter'); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              mode === 'converter' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Cosmic Converter</span>
          </button>

          <button
            onClick={() => { soundEngine.playUiSound('click'); setMode('grapher'); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              mode === 'grapher' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Wave Plotter</span>
          </button>

          <button
            onClick={() => { soundEngine.playUiSound('click'); setMode('constants'); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              mode === 'constants' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Constants</span>
          </button>
        </div>

        {mode === 'scientific' && (
          <button
            onClick={() => setIsRad(!isRad)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-violet-300 font-semibold"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
        )}
      </div>

      {/* Mode 1: Scientific Calculator */}
      {mode === 'scientific' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Keypad & Display */}
          <div className="flex-1 flex flex-col p-4 space-y-3 justify-between overflow-y-auto">
            {/* Display Screen */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-end shadow-inner relative group">
              <div className="text-right text-xs font-mono text-slate-400 h-5 overflow-x-auto whitespace-nowrap">
                {expression || ' '}
              </div>
              <div className="text-right text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight overflow-x-auto whitespace-nowrap scrollbar-none mt-1">
                {display}
              </div>
            </div>

            {/* Scientific Grid */}
            <div className="grid grid-cols-5 gap-2 text-xs">
              {/* Row 1 */}
              <button onClick={() => handleButtonClick('sin(')} className="calc-fn-btn">sin</button>
              <button onClick={() => handleButtonClick('cos(')} className="calc-fn-btn">cos</button>
              <button onClick={() => handleButtonClick('tan(')} className="calc-fn-btn">tan</button>
              <button onClick={() => handleButtonClick('π')} className="calc-fn-btn">π</button>
              <button onClick={() => handleButtonClick('e')} className="calc-fn-btn">e</button>

              {/* Row 2 */}
              <button onClick={() => handleButtonClick('ln(')} className="calc-fn-btn">ln</button>
              <button onClick={() => handleButtonClick('log(')} className="calc-fn-btn">log</button>
              <button onClick={() => handleButtonClick('sqrt(')} className="calc-fn-btn">√</button>
              <button onClick={() => handleButtonClick('^')} className="calc-fn-btn">xʸ</button>
              <button onClick={() => handleButtonClick('x²')} className="calc-fn-btn">x²</button>

              {/* Row 3 */}
              <button onClick={() => handleButtonClick('CE')} className="calc-act-btn">CE</button>
              <button onClick={() => handleButtonClick('C')} className="calc-act-btn text-rose-300">C</button>
              <button onClick={() => handleButtonClick('DEL')} className="calc-act-btn">⌫</button>
              <button onClick={() => handleButtonClick('1/x')} className="calc-fn-btn">1/x</button>
              <button onClick={() => handleButtonClick('÷')} className="calc-op-btn">÷</button>

              {/* Row 4 */}
              <button onClick={() => handleButtonClick('7')} className="calc-num-btn">7</button>
              <button onClick={() => handleButtonClick('8')} className="calc-num-btn">8</button>
              <button onClick={() => handleButtonClick('9')} className="calc-num-btn">9</button>
              <button onClick={() => handleButtonClick('(')} className="calc-fn-btn">(</button>
              <button onClick={() => handleButtonClick('×')} className="calc-op-btn">×</button>

              {/* Row 5 */}
              <button onClick={() => handleButtonClick('4')} className="calc-num-btn">4</button>
              <button onClick={() => handleButtonClick('5')} className="calc-num-btn">5</button>
              <button onClick={() => handleButtonClick('6')} className="calc-num-btn">6</button>
              <button onClick={() => handleButtonClick(')')} className="calc-fn-btn">)</button>
              <button onClick={() => handleButtonClick('-')} className="calc-op-btn">-</button>

              {/* Row 6 */}
              <button onClick={() => handleButtonClick('1')} className="calc-num-btn">1</button>
              <button onClick={() => handleButtonClick('2')} className="calc-num-btn">2</button>
              <button onClick={() => handleButtonClick('3')} className="calc-num-btn">3</button>
              <button onClick={() => handleButtonClick('±')} className="calc-num-btn">±</button>
              <button onClick={() => handleButtonClick('+')} className="calc-op-btn">+</button>

              {/* Row 7 */}
              <button onClick={() => handleButtonClick('0')} className="calc-num-btn col-span-2">0</button>
              <button onClick={() => handleButtonClick('.')} className="calc-num-btn">.</button>
              <button onClick={() => handleButtonClick('=')} className="calc-eq-btn col-span-2">=</button>
            </div>
          </div>

            {/* Calculation History Sidebar */}
          <div className="w-full md:w-60 bg-slate-900/60 border-t md:border-t-0 md:border-l border-white/10 p-3 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-medium text-slate-300">
              <span className="flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-violet-400" />
                <span>Quantum Log</span>
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => { soundEngine.playUiSound('click'); setHistory([]); }}
                  className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No calculations yet
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      soundEngine.playUiSound('click');
                      setDisplay(item.result);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all text-right"
                  >
                    <div className="text-[10px] font-mono text-slate-400 truncate">{item.expression} =</div>
                    <div className="text-sm font-mono font-bold text-violet-300">{item.result}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Cosmic Unit Converter */}
      {mode === 'converter' && (
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="max-w-xl mx-auto w-full space-y-6">
            {/* Category Selector */}
            <div className="flex items-center justify-center space-x-2">
              {(Object.keys(UNIT_CATEGORIES) as (keyof typeof UNIT_CATEGORIES)[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundEngine.playUiSound('click');
                    setUnitCategory(cat);
                    setFromUnitIdx(0);
                    setToUnitIdx(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    unitCategory === cat ? 'bg-cyan-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Conversion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* FROM CARD */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <label className="text-xs text-slate-400 uppercase font-mono">From</label>
                <input
                  type="number"
                  value={convertInputValue}
                  onChange={(e) => setConvertInputValue(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xl font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={fromUnitIdx}
                  onChange={(e) => setFromUnitIdx(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  {units.map((u, i) => (
                    <option key={u.name} value={i}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* TO CARD */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-3 relative">
                <label className="text-xs text-cyan-400 uppercase font-mono">Converted To</label>
                <div className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-xl px-3 py-2 text-xl font-mono font-bold text-cyan-200 truncate">
                  {formattedConverted}
                </div>
                <select
                  value={toUnitIdx}
                  onChange={(e) => setToUnitIdx(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  {units.map((u, i) => (
                    <option key={u.name} value={i}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>Ratio: 1 {units[fromUnitIdx]?.name} = {(fromFactor / toFactor).toPrecision(6)} {units[toUnitIdx]?.name}</span>
              <button
                onClick={() => copyToClipboard(formattedConverted, 'conv')}
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
              >
                {copiedIndex === 'conv' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Wave / Function Plotter */}
      {mode === 'grapher' && (
        <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
          <div className="flex items-center space-x-3 bg-slate-900/80 p-2.5 rounded-2xl border border-white/10">
            <span className="text-xs font-mono text-emerald-400">f(x) =</span>
            <input
              type="text"
              value={graphFunc}
              onChange={(e) => setGraphFunc(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. sin(x) * cos(x/2)"
            />
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setIsGraphAnimated(!isGraphAnimated)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                  isGraphAnimated
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}
              >
                {isGraphAnimated ? 'Anim ON' : 'Anim OFF'}
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>
      )}

      {/* Mode 4: Quantum Constants */}
      {mode === 'constants' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUANTUM_CONSTANTS.map((c) => (
              <div
                key={c.symbol}
                className="p-3 bg-slate-900/70 border border-white/10 rounded-2xl flex flex-col justify-between hover:border-amber-500/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{c.name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                      {c.symbol}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{c.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-200">{c.value} <span className="text-slate-500">{c.unit}</span></span>
                  <button
                    onClick={() => {
                      copyToClipboard(c.value, c.symbol);
                      setDisplay(c.value);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-amber-400 transition-colors"
                    title="Copy & Insert"
                  >
                    {copiedIndex === c.symbol ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tailwind Helpers */}
      <style>{`
        .calc-num-btn {
          padding: 0.65rem 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 600;
          color: #f8fafc;
          transition: all 0.15s;
        }
        .calc-num-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.25);
        }
        .calc-num-btn:active {
          transform: scale(0.96);
        }
        .calc-fn-btn {
          padding: 0.65rem 0.5rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 0.75rem;
          font-family: ui-monospace, monospace;
          color: #c4b5fd;
          transition: all 0.15s;
        }
        .calc-fn-btn:hover {
          background: rgba(139, 92, 246, 0.25);
        }
        .calc-act-btn {
          padding: 0.65rem 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.75rem;
          font-weight: 600;
          color: #fca5a5;
          transition: all 0.15s;
        }
        .calc-act-btn:hover {
          background: rgba(239, 68, 68, 0.25);
        }
        .calc-op-btn {
          padding: 0.65rem 0.5rem;
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 0.75rem;
          font-family: ui-monospace, monospace;
          font-weight: bold;
          color: #7dd3fc;
          transition: all 0.15s;
        }
        .calc-op-btn:hover {
          background: rgba(56, 189, 248, 0.3);
        }
        .calc-eq-btn {
          padding: 0.65rem 0.5rem;
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.75rem;
          font-family: ui-monospace, monospace;
          font-weight: bold;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
          transition: all 0.15s;
        }
        .calc-eq-btn:hover {
          filter: brightness(1.15);
        }
      `}</style>
    </div>
  );
};
