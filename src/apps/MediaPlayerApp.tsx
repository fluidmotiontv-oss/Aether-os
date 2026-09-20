import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
  Upload,
  Sparkles,
  Layers,
  Radio,
  Sliders,
  Disc,
  ListMusic,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  coverGradient: string;
  type: 'synth-drone' | 'synth-pulse' | 'synth-wave' | 'uploaded';
  audioUrl?: string;
}

const DEFAULT_PLAYLIST: Track[] = [
  {
    id: 'track-1',
    title: 'Quantum Resonance',
    artist: 'Aether Neural Collective',
    duration: 184,
    coverGradient: 'from-violet-600 via-indigo-700 to-slate-900',
    type: 'synth-drone',
  },
  {
    id: 'track-2',
    title: 'Neon Synthwave Pulse',
    artist: 'Cyber Horizon',
    duration: 210,
    coverGradient: 'from-pink-600 via-purple-800 to-slate-950',
    type: 'synth-pulse',
  },
  {
    id: 'track-3',
    title: 'Deep Cosmos Theta Waves',
    artist: 'Voyager Sub-Core',
    duration: 320,
    coverGradient: 'from-cyan-600 via-blue-900 to-slate-950',
    type: 'synth-wave',
  },
  {
    id: 'track-4',
    title: 'Bioluminescent Dawn',
    artist: 'Solaris 9',
    duration: 195,
    coverGradient: 'from-emerald-600 via-teal-800 to-slate-950',
    type: 'synth-drone',
  },
  {
    id: 'track-5',
    title: 'Starlight Cybernetics',
    artist: 'Antigravity Ensemble',
    duration: 245,
    coverGradient: 'from-amber-600 via-rose-800 to-slate-950',
    type: 'synth-pulse',
  },
];

type VisualizerMode = 'radial' | 'waveform' | 'particles' | 'bars';

export const MediaPlayerApp: React.FC = () => {
  const [playlist, setPlaylist] = useState<Track[]>(DEFAULT_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('radial');
  const [eqPreset, setEqPreset] = useState<'cyber-bass' | 'ethereal-space' | 'vocal-crisp' | 'flat'>('cyber-bass');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const synthIntervalRef = useRef<any>(null);

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  // Procedural audio generation loop for synthetic tracks
  useEffect(() => {
    if (!isPlaying) {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      return;
    }

    // Set up timer ticker
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= currentTrack.duration) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    // Procedural musical synth pulses based on current track
    const synthLoop = setInterval(() => {
      const baseFreqs = currentTrack.type === 'synth-pulse'
        ? [130.81, 164.81, 196.0, 246.94, 293.66, 329.63] // C maj / E min
        : currentTrack.type === 'synth-wave'
        ? [110.0, 146.83, 164.81, 220.0, 329.63]
        : [73.42, 110.0, 146.83, 220.0, 293.66]; // D minor drone

      const randFreq = baseFreqs[Math.floor(Math.random() * baseFreqs.length)];
      soundEngine.playSynthTone(
        randFreq * (Math.random() > 0.6 ? 2 : 1),
        currentTrack.type === 'synth-pulse' ? 'sawtooth' : 'sine',
        0.8,
        Math.random() * 10 - 5
      );
    }, currentTrack.type === 'synth-pulse' ? 400 : 900);

    synthIntervalRef.current = synthLoop;

    return () => {
      clearInterval(timer);
      clearInterval(synthLoop);
    };
  }, [isPlaying, currentTrack]);

  const togglePlay = () => {
    soundEngine.playUiSound('click');
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    soundEngine.playUiSound('open');
    setCurrentTime(0);
    if (isShuffling) {
      const nextIdx = Math.floor(Math.random() * playlist.length);
      setCurrentTrackIndex(nextIdx);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handlePrev = () => {
    soundEngine.playUiSound('open');
    setCurrentTime(0);
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const newTrack: Track = {
      id: `uploaded-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Import',
      duration: 180,
      coverGradient: 'from-violet-500 via-fuchsia-700 to-slate-900',
      type: 'uploaded',
      audioUrl: URL.createObjectURL(file),
    };

    setPlaylist((prev) => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
    soundEngine.playUiSound('chime');
  };

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const particleCount = 40;
    const particles: { x: number; y: number; speed: number; size: number; color: string }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        speed: 0.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 3,
        color: ['#a855f7', '#06b6d4', '#ec4899', '#38bdf8'][Math.floor(Math.random() * 4)],
      });
    }

    const render = () => {
      phase += 0.04;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 400);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 300);

      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;

      if (visualizerMode === 'radial') {
        const radius = Math.min(centerX, centerY) * 0.45;
        const bars = 48;

        ctx.save();
        ctx.translate(centerX, centerY);

        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2 + phase * 0.2;
          const energy = isPlaying
            ? Math.sin(phase * 3 + i * 0.5) * 0.5 + 0.5
            : 0.1;
          const barHeight = 10 + energy * 45;

          const x1 = Math.cos(angle) * radius;
          const y1 = Math.sin(angle) * radius;
          const x2 = Math.cos(angle) * (radius + barHeight);
          const y2 = Math.sin(angle) * (radius + barHeight);

          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, '#8b5cf6');
          grad.addColorStop(1, '#06b6d4');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Center Pulsing Core
        const corePulse = Math.max(0, radius * 0.7 + (isPlaying ? Math.sin(phase * 4) * 8 : 0));
        ctx.beginPath();
        ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      } else if (visualizerMode === 'waveform') {
        ctx.beginPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;

        for (let x = 0; x < w; x += 3) {
          const norm = x / w;
          const wave1 = Math.sin(norm * 14 + phase * 3) * (isPlaying ? 35 : 5);
          const wave2 = Math.cos(norm * 8 - phase * 2) * (isPlaying ? 20 : 3);
          const y = centerY + wave1 + wave2;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (visualizerMode === 'particles') {
        particles.forEach((p) => {
          if (isPlaying) {
            p.y -= p.speed * 1.5;
            p.x += Math.sin(phase + p.y * 0.05) * 0.8;
            if (p.y < 0) {
              p.y = h;
              p.x = Math.random() * w;
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (isPlaying ? 1.4 : 0.8), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      } else if (visualizerMode === 'bars') {
        const barCount = 28;
        const barW = (w - 60) / barCount;

        for (let i = 0; i < barCount; i++) {
          const energy = isPlaying
            ? Math.abs(Math.sin(phase * 2 + i * 0.35) * Math.cos(i * 0.2)) * (h * 0.6)
            : 8;
          const x = 30 + i * barW;
          const y = h - 20 - energy;

          const grad = ctx.createLinearGradient(0, y, 0, h - 20);
          grad.addColorStop(0, '#ec4899');
          grad.addColorStop(0.5, '#a855f7');
          grad.addColorStop(1, '#06b6d4');

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barW - 4, energy);

          // Peak dot
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y - 4, barW - 4, 2);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, visualizerMode]);

  // Cover Hover & 3D Tilt State
  const [coverTilt, setCoverTilt] = useState<{ rotateX: number; rotateY: number; glareX: number; glareY: number }>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
  });
  const [isCoverHovered, setIsCoverHovered] = useState(false);

  const handleCoverMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // tilt up to 12 deg
    const rotateY = ((x - centerX) / centerX) * 12; // tilt up to 12 deg
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setCoverTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleCoverMouseLeave = () => {
    setIsCoverHovered(false);
    setCoverTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="aether-waves-app" className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-2">
          <Disc className="w-4 h-4 text-violet-400 animate-spin-slow" />
          <span className="font-semibold text-xs tracking-wide text-white">Aether Waves</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">Spatial Audio</span>
        </div>

        {/* Visualizer Modes */}
        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {(['radial', 'waveform', 'particles', 'bars'] as VisualizerMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { soundEngine.playUiSound('click'); setVisualizerMode(mode); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all ${
                visualizerMode === mode ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Upload Button */}
        <label className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload Audio</span>
          <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Main Area: Visualizer Stage + Playlist */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Interactive Visualizer & Album Art */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-radial from-slate-900/60 to-slate-950">
          {/* Canvas Spectrum */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />

          {/* Track Holographic Center Badge with 3D Tilt & Breathing Animation */}
          <div
            className="relative z-10 perspective-[1000px] cursor-pointer group select-none"
            onMouseEnter={() => setIsCoverHovered(true)}
            onMouseMove={handleCoverMouseMove}
            onMouseLeave={handleCoverMouseLeave}
            onClick={() => togglePlay()}
          >
            {/* Ambient Breathing Glow Aura behind the cover */}
            <div
              className={`absolute -inset-4 rounded-[36px] bg-gradient-to-tr ${currentTrack.coverGradient} opacity-40 blur-2xl transition-all duration-700 pointer-events-none ${
                isPlaying ? 'animate-pulse scale-110 opacity-70' : 'opacity-25 scale-95'
              }`}
            />

            {/* Main 3D Card */}
            <div
              style={{
                transform: isCoverHovered
                  ? `rotateX(${coverTilt.rotateX}deg) rotateY(${coverTilt.rotateY}deg) scale3d(1.06, 1.06, 1.06)`
                  : undefined,
                transition: isCoverHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s ease',
                transformStyle: 'preserve-3d',
              }}
              className={`relative p-6 rounded-3xl bg-gradient-to-br ${currentTrack.coverGradient} shadow-2xl border border-white/25 flex flex-col items-center justify-center text-center w-56 h-56 overflow-hidden ${
                isPlaying && !isCoverHovered ? 'animate-breathe' : ''
              } ${isPlaying ? 'shadow-[0_15px_35px_rgba(139,92,246,0.35)]' : 'shadow-black/60'}`}
            >
              {/* Vinyl / Hologram Texture Rings */}
              <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
              <div className="absolute -inset-10 rounded-full border border-white/10 opacity-20 pointer-events-none animate-spin-slow" />
              <div className="absolute -inset-20 rounded-full border border-white/5 opacity-15 pointer-events-none animate-spin-slow" />

              {/* Dynamic Specular Sheen Glare following cursor */}
              {isCoverHovered && (
                <div
                  style={{
                    background: `radial-gradient(circle at ${coverTilt.glareX}% ${coverTilt.glareY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 50%, transparent 80%)`,
                  }}
                  className="absolute inset-0 rounded-3xl pointer-events-none z-20 mix-blend-overlay transition-opacity duration-200"
                />
              )}

              {/* Holographic Subtle Top-Edge Light Accent */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-3xl" />

              {/* Center Floating Icon with 3D Depth */}
              <div
                style={{ transform: isCoverHovered ? 'translateZ(30px)' : undefined }}
                className="relative z-10 transition-transform duration-200"
              >
                <div className="w-16 h-16 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Music className={`w-8 h-8 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)] ${isPlaying ? 'animate-bounce' : ''}`} />
                </div>
              </div>

              {/* Track Info with 3D Layering */}
              <div
                style={{ transform: isCoverHovered ? 'translateZ(20px)' : undefined }}
                className="mt-3 relative z-10 max-w-full px-2 transition-transform duration-200"
              >
                <div className="font-bold text-sm text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] truncate">
                  {currentTrack.title}
                </div>
                <div className="text-xs text-white/80 font-medium truncate drop-shadow">
                  {currentTrack.artist}
                </div>
              </div>

              {/* Playing Pulsing Indicator Badge */}
              <div
                style={{ transform: isCoverHovered ? 'translateZ(25px)' : undefined }}
                className="mt-2 flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-sm transition-transform duration-200"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/90">
                  {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Playlist Queue */}
        <div className="w-full md:w-72 bg-slate-900/70 border-t md:border-t-0 md:border-l border-white/10 p-4 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-slate-300">
            <span className="flex items-center space-x-1.5">
              <ListMusic className="w-4 h-4 text-violet-400" />
              <span>Queue ({playlist.length})</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">24-bit Flac</span>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1">
            {playlist.map((track, idx) => {
              const isSelected = idx === currentTrackIndex;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    soundEngine.playUiSound('click');
                    setCurrentTrackIndex(idx);
                    setCurrentTime(0);
                    setIsPlaying(true);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-violet-600/30 border-violet-500/50 text-white'
                      : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${track.coverGradient} flex items-center justify-center shrink-0`}>
                      {isSelected && isPlaying ? (
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                      ) : (
                        <Music className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">{track.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{track.artist}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* EQ Preset Selector */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">Audio Profile:</span>
            <select
              value={eqPreset}
              onChange={(e) => setEqPreset(e.target.value as any)}
              className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-violet-300 focus:outline-none"
            >
              <option value="cyber-bass">Cyber Bass</option>
              <option value="ethereal-space">Ethereal Space</option>
              <option value="vocal-crisp">Vocal Crisp</option>
              <option value="flat">Reference Flat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-white/10 shrink-0 flex flex-col space-y-2">
        {/* Scrub Bar */}
        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
          <span>{formatDuration(currentTime)}</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setCurrentTime(pos * currentTrack.duration);
            }}
            className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
          >
            <div
              style={{ width: `${(currentTime / currentTrack.duration) * 100}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
            />
          </div>
          <span>{formatDuration(currentTrack.duration)}</span>
        </div>

        {/* Buttons & Volume */}
        <div className="flex items-center justify-between">
          {/* Left: Loop & Shuffle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsShuffling(!isShuffling)}
              className={`p-1.5 rounded-lg transition-colors ${
                isShuffling ? 'text-violet-400 bg-violet-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg transition-colors ${
                isLooping ? 'text-violet-400 bg-violet-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30 transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Volume Slider */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 h-1 accent-violet-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
