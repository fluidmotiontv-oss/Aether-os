import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  Sliders,
  Sparkles,
  Waves,
  Music,
  Activity,
  Disc,
} from 'lucide-react';
import { SoundTrack } from '../types';
import { soundEngine } from '../utils/audio';

export const SoundLabApp: React.FC = () => {
  const [tracks, setTracks] = useState<SoundTrack[]>([
    { id: 'track-drone', name: '432Hz Celestial Drone', type: 'drone', volume: 0.6, isPlaying: false },
    { id: 'track-binaural', name: 'Theta Wave (6Hz Beat)', type: 'binaural', volume: 0.5, isPlaying: false },
    { id: 'track-rain', name: 'Canopy Stellar Rain', type: 'rain', volume: 0.4, isPlaying: false },
    { id: 'track-pulsar', name: 'Deep Space Pulsar', type: 'pulsar', volume: 0.3, isPlaying: false },
    { id: 'track-wind', name: 'Solar Cosmic Breeze', type: 'wind', volume: 0.4, isPlaying: false },
  ]);

  // Step Sequencer State (8 Steps, 4 Notes: C4, D4, F4, G4)
  const notes = [
    { name: 'C5', freq: 523.25 },
    { name: 'A4', freq: 440.0 },
    { name: 'G4', freq: 392.0 },
    { name: 'E4', freq: 329.63 },
    { name: 'D4', freq: 293.66 },
    { name: 'C4', freq: 261.63 },
  ];

  const [sequence, setSequence] = useState<boolean[][]>(() =>
    Array(6).fill(null).map(() => Array(8).fill(false))
  );

  const [isSeqPlaying, setIsSeqPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(110);
  const [waveform, setWaveform] = useState<OscillatorType>('sine');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Toggle ambient track
  const toggleTrack = (id: string) => {
    soundEngine.playUiSound('click');
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.isPlaying;
          soundEngine.toggleAmbientSound(t.id, t.type, nextState, t.volume);
          return { ...t, isPlaying: nextState };
        }
        return t;
      })
    );
  };

  const updateTrackVolume = (id: string, vol: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (t.isPlaying) {
            soundEngine.toggleAmbientSound(t.id, t.type, true, vol);
          }
          return { ...t, volume: vol };
        }
        return t;
      })
    );
  };

  // Step Sequencer Timer
  useEffect(() => {
    if (!isSeqPlaying) return;
    const intervalTime = (60 / bpm / 2) * 1000;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % 8;
        // Trigger active notes on nextStep
        notes.forEach((note, noteIdx) => {
          if (sequence[noteIdx]?.[nextStep]) {
            soundEngine.playSynthTone(note.freq, waveform, 0.25);
          }
        });
        return nextStep;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSeqPlaying, bpm, sequence, waveform]);

  // Audio Canvas Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.04;
      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, w, h);

      // Draw responsive waveform bars
      const isAnyActive = tracks.some((t) => t.isPlaying) || isSeqPlaying;
      const barCount = 36;
      const barWidth = w / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const amp = isAnyActive
          ? Math.sin(time + i * 0.3) * Math.cos(time * 0.5 + i * 0.2) * (h * 0.35) + h * 0.4
          : Math.sin(time + i * 0.1) * 3 + 6;

        const grad = ctx.createLinearGradient(0, h, 0, h - amp);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(0.5, '#06b6d4');
        grad.addColorStop(1, '#ec4899');

        ctx.fillStyle = grad;
        ctx.fillRect(x, h - amp, barWidth, amp);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [tracks, isSeqPlaying]);

  const toggleSequenceCell = (noteIdx: number, stepIdx: number) => {
    soundEngine.playUiSound('key');
    setSequence((prev) => {
      const next = prev.map((row) => [...row]);
      next[noteIdx][stepIdx] = !next[noteIdx][stepIdx];
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-y-auto">
      {/* Top Visualizer Banner */}
      <div className="h-28 bg-slate-900/80 border-b border-white/10 relative overflow-hidden flex flex-col justify-between p-4 shrink-0">
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-violet-400 animate-pulse" />
            <div>
              <span className="font-semibold text-sm text-white">Nebula Sound Lab</span>
              <span className="text-[11px] text-slate-400 block">
                Harmonic Web Audio Synthesizer & Ambiance
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
              DSP 48kHz
            </span>
          </div>
        </div>

        {/* Real-time spectrum canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />
      </div>

      {/* Main Grid: Ambient Mixer (Left) + 8-Step Sequencer (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Ambient Mixer Column */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Procedural Soundscapes</span>
            </span>
            <button
              onClick={() => {
                soundEngine.stopAllAmbient();
                setTracks(tracks.map((t) => ({ ...t, isPlaying: false })));
              }}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5"
            >
              Mute All
            </button>
          </div>

          <div className="space-y-3">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between space-x-3 ${
                  track.isPlaying
                    ? 'bg-violet-600/20 border-violet-500/40 text-white'
                    : 'bg-white/5 border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleTrack(track.id)}
                    className={`p-2 rounded-xl transition-all ${
                      track.isPlaying
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    {track.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <div>
                    <div className="text-xs font-medium text-white">{track.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{track.type} stream</div>
                  </div>
                </div>

                {/* Volume slider */}
                <div className="w-24">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={track.volume}
                    onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8-Step Polyphonic Synthesizer Column */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
              <Music className="w-4 h-4 text-pink-400" />
              <span>Spatial 8-Step Poly Synth</span>
            </span>

            <div className="flex items-center space-x-2">
              {/* Waveform Selector */}
              {(['sine', 'triangle', 'square', 'sawtooth'] as OscillatorType[]).map((wf) => (
                <button
                  key={wf}
                  onClick={() => {
                    soundEngine.playUiSound('click');
                    setWaveform(wf);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded capitalize transition-all ${
                    waveform === wf
                      ? 'bg-pink-600 text-white font-bold'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {wf}
                </button>
              ))}
            </div>
          </div>

          {/* Sequencer Grid */}
          <div className="space-y-1.5">
            {notes.map((note, noteIdx) => (
              <div key={note.name} className="flex items-center space-x-2">
                <span className="w-7 text-[11px] font-mono text-slate-400 font-bold text-right">
                  {note.name}
                </span>
                <div className="grid grid-cols-8 gap-1.5 flex-1">
                  {Array.from({ length: 8 }).map((_, stepIdx) => {
                    const isActive = sequence[noteIdx]?.[stepIdx];
                    const isCurrent = currentStep === stepIdx && isSeqPlaying;
                    return (
                      <button
                        key={stepIdx}
                        onClick={() => toggleSequenceCell(noteIdx, stepIdx)}
                        className={`h-7 rounded-lg transition-all border ${
                          isActive
                            ? 'bg-gradient-to-tr from-pink-600 to-violet-500 border-pink-400 text-white shadow-sm shadow-pink-500/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        } ${isCurrent ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950' : ''}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sequencer Controls Bar */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                soundEngine.playUiSound('click');
                setIsSeqPlaying(!isSeqPlaying);
              }}
              className={`px-4 py-1.5 rounded-xl font-medium flex items-center space-x-2 transition-all ${
                isSeqPlaying
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isSeqPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSeqPlaying ? 'Stop Pattern' : 'Play Pattern'}</span>
            </button>

            {/* Tempo BPM */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-[11px]">BPM:</span>
              <span className="font-mono text-white text-xs font-bold w-7">{bpm}</span>
              <input
                type="range"
                min="60"
                max="180"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
