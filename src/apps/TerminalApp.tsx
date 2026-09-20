import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Sparkles, Zap, Shield, Play } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CommandOutput {
  id: string;
  command?: string;
  output: string | React.ReactNode;
  isError?: boolean;
}

export const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      id: 'init-1',
      output: (
        <div className="text-slate-300 space-y-1">
          <div className="text-violet-400 font-bold">Aether.OS Quantum Shell v3.4.1 [x86_quantum-unknown-linux]</div>
          <div className="text-slate-400 text-xs">Type <span className="text-cyan-300 font-bold">help</span> or <span className="text-cyan-300 font-bold">neofetch</span> to inspect spatial kernel nodes.</div>
        </div>
      ),
    },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isMatrixMode]);

  const handleCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    soundEngine.playUiSound('key');
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newId = `cmd-${Date.now()}`;

    switch (command) {
      case 'help': {
        setHistory((prev) => [
          ...prev,
          {
            id: newId,
            command: trimmed,
            output: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs py-1 text-slate-300">
                <div><span className="text-cyan-400 font-bold">neofetch</span> - Display system architecture & specs</div>
                <div><span className="text-cyan-400 font-bold">matrix</span> - Engage quantum matrix stream</div>
                <div><span className="text-cyan-400 font-bold">ai &lt;query&gt;</span> - Query Aether Neural Core directly</div>
                <div><span className="text-cyan-400 font-bold">top</span> - View real-time quantum processes</div>
                <div><span className="text-cyan-400 font-bold">calc &lt;math&gt;</span> - Evaluate mathematical expressions</div>
                <div><span className="text-cyan-400 font-bold">audio &lt;drone|rain|pulsar|off&gt;</span> - Control sound synthesizer</div>
                <div><span className="text-cyan-400 font-bold">ls / cat</span> - Explore virtual file system</div>
                <div><span className="text-cyan-400 font-bold">clear</span> - Clear terminal buffer</div>
                <div><span className="text-cyan-400 font-bold">cowsay &lt;text&gt;</span> - Quantum spatial mascot message</div>
                <div><span className="text-cyan-400 font-bold">date / whoami</span> - System status & identity</div>
              </div>
            ),
          },
        ]);
        break;
      }

      case 'neofetch': {
        soundEngine.playUiSound('warp');
        setHistory((prev) => [
          ...prev,
          {
            id: newId,
            command: trimmed,
            output: (
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-6 py-2">
                <pre className="text-violet-400 text-xs font-mono font-bold leading-tight select-none">
{`   .---.
  /     \\     Aether.OS
 | () () |    ---------
  \\  _  /     OS: Aether Spatial v3.4.1
   \`---\`      Host: Quantum Node Rig 16-Core
  /     \\     Kernel: 3.4.1-quantum-lts
 | |   | |    Uptime: 4 days, 12 hours
 |_|___|_|    Shell: aether-zsh 5.9
  (   )       Resolution: 3840x2160 Spatial
   \`=\`        Audio: WebAudio DSP Procedural
              Memory: 8192MiB / 32768MiB (25%)`}
                </pre>
                <div className="text-xs space-y-1 text-slate-300">
                  <div><span className="text-violet-400 font-bold">aether</span>@<span className="text-cyan-400">quantum-node</span></div>
                  <div>---------------------------</div>
                  <div><span className="text-slate-400">Architecture:</span> x86_64 Quantum Entangled</div>
                  <div><span className="text-slate-400">Window Manager:</span> Aether Spatial Glass</div>
                  <div><span className="text-slate-400">Theme:</span> Celestial Violet Dark</div>
                  <div><span className="text-slate-400">Security:</span> Quantum Cryptographic Level 5</div>
                  <div className="flex space-x-1.5 pt-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />
                  </div>
                </div>
              </div>
            ),
          },
        ]);
        break;
      }

      case 'matrix': {
        soundEngine.playUiSound('warp');
        setIsMatrixMode(true);
        setTimeout(() => setIsMatrixMode(false), 5000);
        setHistory((prev) => [
          ...prev,
          {
            id: newId,
            command: trimmed,
            output: <span className="text-emerald-400">Quantum Matrix Rain Stream Synchronized [Active for 5s]...</span>,
          },
        ]);
        break;
      }

      case 'ai':
      case 'gemini': {
        const query = args.join(' ');
        if (!query) {
          setHistory((prev) => [
            ...prev,
            { id: newId, command: trimmed, output: 'Usage: ai <your prompt here>', isError: true },
          ]);
          return;
        }

        // Call backend API
        setHistory((prev) => [
          ...prev,
          { id: newId, command: trimmed, output: 'Querying Aether Neural Core...' },
        ]);

        try {
          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: query, mode: 'general' }),
          });
          const data = await res.json();
          soundEngine.playUiSound('chime');

          setHistory((prev) => [
            ...prev.slice(0, -1),
            {
              id: newId,
              command: trimmed,
              output: (
                <div className="text-cyan-200 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/20 whitespace-pre-wrap">
                  {data.response}
                </div>
              ),
            },
          ]);
        } catch {
          setHistory((prev) => [
            ...prev.slice(0, -1),
            {
              id: newId,
              command: trimmed,
              output: `[Neural Core Fallback]: Synthesizing response for "${query}" across quantum registers.`,
            },
          ]);
        }
        break;
      }

      case 'top': {
        setHistory((prev) => [
          ...prev,
          {
            id: newId,
            command: trimmed,
            output: (
              <pre className="text-xs text-slate-300 font-mono">
{`Tasks: 18 total, 1 running, 17 sleeping
%Cpu(s): 2.4 us, 0.8 sy, 0.0 ni, 96.8 id
MiB Mem : 32768.0 total, 24150.2 free, 8617.8 used

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
  101 aether    20   0  145020  32100  12040 S   4.2   0.8   0:14.22 aether-spatial-wm
  104 aether    20   0  584090  89120  24500 S   2.1   2.1   0:08.45 neural-core-daemon
  108 aether    20   0   89120  18400   9200 S   1.0   0.4   0:03.11 web-audio-dsp
  112 aether    20   0   45200   8200   4100 R   0.6   0.2   0:00.32 quantum-shell`}
              </pre>
            ),
          },
        ]);
        break;
      }

      case 'calc': {
        try {
          // eslint-disable-next-line no-eval
          const result = Function(`"use strict"; return (${args.join(' ').replace(/\^/g, '**')})`)();
          setHistory((prev) => [
            ...prev,
            { id: newId, command: trimmed, output: <span className="text-emerald-400 font-bold">{result}</span> },
          ]);
        } catch {
          setHistory((prev) => [
            ...prev,
            { id: newId, command: trimmed, output: 'Invalid arithmetic expression.', isError: true },
          ]);
        }
        break;
      }

      case 'audio': {
        const soundType = args[0] as any;
        if (['drone', 'rain', 'pulsar', 'binaural'].includes(soundType)) {
          soundEngine.toggleAmbientSound('terminal-sound', soundType, true, 0.5);
          setHistory((prev) => [
            ...prev,
            { id: newId, command: trimmed, output: `Ambient soundscape [${soundType}] engaged.` },
          ]);
        } else if (soundType === 'off' || soundType === 'stop') {
          soundEngine.stopAllAmbient();
          setHistory((prev) => [
            ...prev,
            { id: newId, command: trimmed, output: 'All ambient soundscapes halted.' },
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            { id: newId, command: trimmed, output: 'Usage: audio <drone|rain|pulsar|binaural|off>' },
          ]);
        }
        break;
      }

      case 'ls': {
        setHistory((prev) => [
          ...prev,
          {
            id: newId,
            command: trimmed,
            output: (
              <div className="flex space-x-4 text-xs">
                <span className="text-blue-400 font-bold">Documents/</span>
                <span className="text-blue-400 font-bold">Projects/</span>
                <span className="text-blue-400 font-bold">System/</span>
                <span className="text-emerald-400">manifest.json</span>
                <span className="text-pink-400">aether_core.bin</span>
              </div>
            ),
          },
        ]);
        break;
      }

      case 'cat': {
        const target = args[0];
        if (target === 'manifest.json') {
          setHistory((prev) => [
            ...prev,
            {
              id: newId,
              command: trimmed,
              output: `{\n  "system": "Aether.OS",\n  "version": "3.4.1",\n  "quantumEngine": true,\n  "encryption": "AES-GCM-256"\n}`,
            },
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            { id: newId, command: trimmed, output: `File ${target || ''} loaded. [Spatial content stream synchronized]` },
          ]);
        }
        break;
      }

      case 'clear': {
        setHistory([]);
        break;
      }

      case 'whoami': {
        setHistory((prev) => [
          ...prev,
          { id: newId, command: trimmed, output: 'aether-spatial-root (Quantum Node Operator)' },
        ]);
        break;
      }

      case 'date': {
        setHistory((prev) => [
          ...prev,
          { id: newId, command: trimmed, output: new Date().toUTCString() },
        ]);
        break;
      }

      case 'cowsay': {
        const text = args.join(' ') || 'Aether.OS breathes starlight.';
        setHistory((prev) => [
          ...prev,
          {
            id: newId,
            command: trimmed,
            output: (
              <pre className="text-violet-300 text-xs font-mono">
{`  < ${text} >
  -----------------------------------
         \\   ^__^
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||`}
              </pre>
            ),
          },
        ]);
        break;
      }

      default: {
        setHistory((prev) => [
          ...prev,
          {
            id: newId,
            command: trimmed,
            output: `aether-sh: command not found: ${command}. Type 'help' for valid quantum subroutines.`,
            isError: true,
          },
        ]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setCurrentInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= cmdHistory.length) {
          setHistoryIdx(-1);
          setCurrentInput('');
        } else {
          setHistoryIdx(nextIdx);
          setCurrentInput(cmdHistory[nextIdx]);
        }
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex-1 p-4 bg-slate-950/95 font-mono text-xs text-slate-200 overflow-y-auto flex flex-col justify-start relative select-text"
    >
      {/* Matrix Stream Animation Overlay */}
      {isMatrixMode && (
        <div className="absolute inset-0 bg-black/90 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
          <div className="text-emerald-400 text-center space-y-2 animate-pulse">
            <div className="text-lg font-bold">QUANTUM MATRIX FLOW ENGAGED</div>
            <div className="text-xs text-emerald-500 font-mono">
              01000001 01000101 01010100 01001000 01000101 01010010
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.command && (
              <div className="flex items-center space-x-2 text-slate-400">
                <span className="text-violet-400 font-bold">aether@quantum:~$</span>
                <span className="text-white">{item.command}</span>
              </div>
            )}
            <div className={`${item.isError ? 'text-red-400' : 'text-slate-300'}`}>
              {item.output}
            </div>
          </div>
        ))}
      </div>

      {/* Active prompt line */}
      <div className="flex items-center space-x-2 mt-3 text-slate-200">
        <span className="text-violet-400 font-bold shrink-0">aether@quantum:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs"
        />
      </div>
      <div ref={terminalEndRef} />
    </div>
  );
};
