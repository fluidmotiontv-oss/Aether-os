import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, RotateCcw, Trophy, Sparkles, Zap, Shield, Cpu, Users, Volume2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

type GameMode = 'asteroids' | 'pong';
type PongDifficulty = 'easy' | 'normal' | 'neural' | '2player';

export const ArcadeApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeGame, setActiveGame] = useState<GameMode>('pong');
  
  // High scores
  const [asteroidHighScore, setAsteroidHighScore] = useState(() => {
    return parseInt(localStorage.getItem('aether_arcade_asteroids_high') || '0', 10);
  });
  const [pongRallyHigh, setPongRallyHigh] = useState(() => {
    return parseInt(localStorage.getItem('aether_arcade_pong_high') || '0', 10);
  });

  const [score, setScore] = useState(0);
  const [pongScore, setPongScore] = useState<{ player: number; ai: number }>({ player: 0, ai: 0 });
  const [currentRally, setCurrentRally] = useState(0);
  const [pongDifficulty, setPongDifficulty] = useState<PongDifficulty>('normal');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | 'player2' | null>(null);

  // Asteroids State Ref
  const asteroidStateRef = useRef({
    ship: { x: 300, y: 400, size: 16, vx: 0 },
    lasers: [] as { x: number; y: number; vy: number }[],
    asteroids: [] as { x: number; y: number; r: number; vy: number; vx: number; hp: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    score: 0,
    keys: { left: false, right: false, space: false },
    lastSpawn: 0,
  });

  // Neural Pong State Ref
  const pongStateRef = useRef({
    player: { x: 30, y: 200, width: 14, height: 75, vy: 0, targetY: 200, speed: 7 },
    ai: { x: 570, y: 200, width: 14, height: 75, vy: 0, targetY: 200, speed: 5.5, errorOffset: 0 },
    ball: {
      x: 300,
      y: 200,
      radius: 7,
      vx: 5,
      vy: 2.5,
      baseSpeed: 5.5,
      maxSpeed: 14,
      trail: [] as { x: number; y: number; alpha: number }[],
    },
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[],
    keys: { w: false, s: false, up: false, down: false },
    rally: 0,
    playerScore: 0,
    aiScore: 0,
    serving: 'player' as 'player' | 'ai',
    serveCountdown: 0,
    targetScore: 5,
  });

  // Reset & Start active game
  const startGame = () => {
    soundEngine.playUiSound('warp');
    setIsPlaying(true);
    setIsGameOver(false);
    setWinner(null);

    if (activeGame === 'asteroids') {
      setScore(0);
      asteroidStateRef.current = {
        ship: { x: 300, y: 400, size: 16, vx: 0 },
        lasers: [],
        asteroids: [],
        particles: [],
        score: 0,
        keys: { left: false, right: false, space: false },
        lastSpawn: Date.now(),
      };
    } else {
      setPongScore({ player: 0, ai: 0 });
      setCurrentRally(0);
      
      const pSpeed = pongDifficulty === 'neural' ? 6.5 : 5.5;
      const aiSpeed = pongDifficulty === 'easy' ? 4.0 : pongDifficulty === 'normal' ? 5.2 : 6.8;

      pongStateRef.current = {
        player: { x: 30, y: 200, width: 14, height: 75, vy: 0, targetY: 200, speed: 7 },
        ai: { x: 570, y: 200, width: 14, height: 75, vy: 0, targetY: 200, speed: aiSpeed, errorOffset: 0 },
        ball: {
          x: 300,
          y: 200,
          radius: 7,
          vx: Math.random() > 0.5 ? pSpeed : -pSpeed,
          vy: (Math.random() - 0.5) * 4,
          baseSpeed: pSpeed,
          maxSpeed: 14,
          trail: [],
        },
        particles: [],
        keys: { w: false, s: false, up: false, down: false },
        rally: 0,
        playerScore: 0,
        aiScore: 0,
        serving: 'player',
        serveCountdown: 30,
        targetScore: 5,
      };
    }
  };

  const switchGame = (mode: GameMode) => {
    soundEngine.playUiSound('click');
    setActiveGame(mode);
    setIsPlaying(false);
    setIsGameOver(false);
    setWinner(null);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeGame === 'asteroids') {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) asteroidStateRef.current.keys.left = true;
        if (['ArrowRight', 'KeyD'].includes(e.code)) asteroidStateRef.current.keys.right = true;
        if (['Space', 'KeyW', 'ArrowUp'].includes(e.code)) {
          if (!isPlaying) {
            startGame();
          } else {
            soundEngine.playSynthTone(880, 'square', 0.05);
            asteroidStateRef.current.lasers.push({
              x: asteroidStateRef.current.ship.x,
              y: asteroidStateRef.current.ship.y - 12,
              vy: -10,
            });
          }
        }
      } else {
        // Pong Keydown
        if (['KeyW'].includes(e.code)) pongStateRef.current.keys.w = true;
        if (['KeyS'].includes(e.code)) pongStateRef.current.keys.s = true;
        if (['ArrowUp'].includes(e.code)) {
          e.preventDefault();
          pongStateRef.current.keys.up = true;
        }
        if (['ArrowDown'].includes(e.code)) {
          e.preventDefault();
          pongStateRef.current.keys.down = true;
        }
        if (['Space'].includes(e.code) && !isPlaying) {
          e.preventDefault();
          startGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (activeGame === 'asteroids') {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) asteroidStateRef.current.keys.left = false;
        if (['ArrowRight', 'KeyD'].includes(e.code)) asteroidStateRef.current.keys.right = false;
      } else {
        if (['KeyW'].includes(e.code)) pongStateRef.current.keys.w = false;
        if (['KeyS'].includes(e.code)) pongStateRef.current.keys.s = false;
        if (['ArrowUp'].includes(e.code)) pongStateRef.current.keys.up = false;
        if (['ArrowDown'].includes(e.code)) pongStateRef.current.keys.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeGame, isPlaying, pongDifficulty]);

  // Mouse / Touch paddle tracking for Pong
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeGame !== 'pong' || !isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    pongStateRef.current.player.targetY = mouseY;
  };

  // Main Game Loop for both Games
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);

      if (activeGame === 'asteroids') {
        // === ASTEROIDS ENGINE ===
        const state = asteroidStateRef.current;
        ctx.fillStyle = '#050713';
        ctx.fillRect(0, 0, w, h);

        if (isPlaying && !isGameOver) {
          // Ship movement
          if (state.keys.left) state.ship.vx = -6;
          else if (state.keys.right) state.ship.vx = 6;
          else state.ship.vx *= 0.85;

          state.ship.x = Math.max(state.ship.size, Math.min(w - state.ship.size, state.ship.x + state.ship.vx));

          // Draw Ship
          ctx.save();
          ctx.translate(state.ship.x, state.ship.y);
          ctx.beginPath();
          ctx.moveTo(0, -state.ship.size);
          ctx.lineTo(state.ship.size, state.ship.size);
          ctx.lineTo(0, state.ship.size * 0.6);
          ctx.lineTo(-state.ship.size, state.ship.size);
          ctx.closePath();
          ctx.fillStyle = '#06b6d4';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#06b6d4';
          ctx.fill();
          ctx.restore();

          // Spawn Asteroids
          if (Date.now() - state.lastSpawn > 800) {
            state.lastSpawn = Date.now();
            state.asteroids.push({
              x: Math.random() * (w - 40) + 20,
              y: -20,
              r: Math.random() * 14 + 12,
              vy: Math.random() * 2 + 2.5,
              vx: (Math.random() - 0.5) * 1.5,
              hp: 1,
            });
          }

          // Update Lasers
          state.lasers.forEach((l, lIdx) => {
            l.y += l.vy;
            ctx.beginPath();
            ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#f43f5e';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#f43f5e';
            ctx.fill();

            // Laser-Asteroid collision
            state.asteroids.forEach((a, aIdx) => {
              const dist = Math.hypot(l.x - a.x, l.y - a.y);
              if (dist < a.r + 4) {
                soundEngine.playSynthTone(220, 'sawtooth', 0.08);
                state.lasers.splice(lIdx, 1);
                state.asteroids.splice(aIdx, 1);
                state.score += 100;
                setScore(state.score);

                for (let p = 0; p < 8; p++) {
                  state.particles.push({
                    x: a.x,
                    y: a.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    life: 1,
                    color: '#a855f7',
                  });
                }
              }
            });
          });

          // Update Asteroids
          state.asteroids.forEach((a) => {
            a.y += a.vy;
            a.x += a.vx;

            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fillStyle = '#8b5cf6';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#8b5cf6';
            ctx.fill();

            const shipDist = Math.hypot(state.ship.x - a.x, state.ship.y - a.y);
            if (shipDist < a.r + state.ship.size * 0.8) {
              soundEngine.playUiSound('close');
              setIsGameOver(true);
              setIsPlaying(false);
              if (state.score > asteroidHighScore) {
                setAsteroidHighScore(state.score);
                localStorage.setItem('aether_arcade_asteroids_high', state.score.toString());
              }
            }
          });

          state.lasers = state.lasers.filter((l) => l.y > -20);
          state.asteroids = state.asteroids.filter((a) => a.y < h + 30);

          // Update particles
          state.particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fill();
            ctx.globalAlpha = 1;
          });
          state.particles = state.particles.filter((p) => p.life > 0);
        }
      } else {
        // === NEURAL PONG ENGINE ===
        const pState = pongStateRef.current;
        pState.player.x = 24;
        pState.ai.x = w - 24 - pState.ai.width;

        // Background CRT Grid / Dark Space
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, w, h);

        // Grid lines (subtle retro phosphor)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < w; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Center Net (Dashed Hologram)
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Center Circular Quantum Field
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2);
        ctx.stroke();

        if (isPlaying && !isGameOver) {
          // 1. Player 1 Movement (Keyboard W/S or Up/Down, or Mouse Target)
          if (pState.keys.w || (pongDifficulty !== '2player' && pState.keys.up)) {
            pState.player.y -= pState.player.speed;
          } else if (pState.keys.s || (pongDifficulty !== '2player' && pState.keys.down)) {
            pState.player.y += pState.player.speed;
          } else {
            // Smooth mouse follow if keys not active
            const dy = pState.player.targetY - (pState.player.y + pState.player.height / 2);
            pState.player.y += dy * 0.15;
          }
          // Clamp player 1
          pState.player.y = Math.max(10, Math.min(h - pState.player.height - 10, pState.player.y));

          // 2. Player 2 / Neural AI Movement
          if (pongDifficulty === '2player') {
            if (pState.keys.up) pState.ai.y -= pState.ai.speed;
            if (pState.keys.down) pState.ai.y += pState.ai.speed;
          } else {
            // Neural AI with predictive trajectory + reactive jitter
            const aiCenter = pState.ai.y + pState.ai.height / 2;
            let targetY = h / 2;

            if (pState.ball.vx > 0) {
              // Ball approaching AI
              targetY = pState.ball.y;
              if (pongDifficulty === 'easy') {
                targetY += Math.sin(Date.now() * 0.003) * 35;
              } else if (pongDifficulty === 'normal') {
                targetY += Math.sin(Date.now() * 0.005) * 15;
              }
            } else {
              // Ball retreating, return to center-guard
              targetY = h / 2 + Math.sin(Date.now() * 0.002) * 20;
            }

            const aiDelta = targetY - aiCenter;
            pState.ai.y += Math.sign(aiDelta) * Math.min(Math.abs(aiDelta), pState.ai.speed);
          }
          // Clamp Player 2 / AI
          pState.ai.y = Math.max(10, Math.min(h - pState.ai.height - 10, pState.ai.y));

          // 3. Ball Movement & Trail
          if (pState.serveCountdown > 0) {
            pState.serveCountdown--;
            pState.ball.x = w / 2;
            pState.ball.y = h / 2;
          } else {
            pState.ball.x += pState.ball.vx;
            pState.ball.y += pState.ball.vy;

            // Add trail
            pState.ball.trail.push({ x: pState.ball.x, y: pState.ball.y, alpha: 1 });
            if (pState.ball.trail.length > 8) pState.ball.trail.shift();
          }

          // 4. Wall Bounce (Top & Bottom)
          if (pState.ball.y - pState.ball.radius <= 0) {
            pState.ball.y = pState.ball.radius;
            pState.ball.vy = Math.abs(pState.ball.vy);
            soundEngine.playSynthTone(540, 'triangle', 0.04);
            for (let i = 0; i < 4; i++) {
              pState.particles.push({
                x: pState.ball.x,
                y: pState.ball.y,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3,
                life: 1,
                color: '#38bdf8',
                size: 2,
              });
            }
          } else if (pState.ball.y + pState.ball.radius >= h) {
            pState.ball.y = h - pState.ball.radius;
            pState.ball.vy = -Math.abs(pState.ball.vy);
            soundEngine.playSynthTone(540, 'triangle', 0.04);
            for (let i = 0; i < 4; i++) {
              pState.particles.push({
                x: pState.ball.x,
                y: pState.ball.y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3,
                life: 1,
                color: '#38bdf8',
                size: 2,
              });
            }
          }

          // 5. Paddle Collisions
          // Player 1 (Left)
          const p1 = pState.player;
          if (
            pState.ball.vx < 0 &&
            pState.ball.x - pState.ball.radius <= p1.x + p1.width &&
            pState.ball.x + pState.ball.radius >= p1.x &&
            pState.ball.y >= p1.y - 4 &&
            pState.ball.y <= p1.y + p1.height + 4
          ) {
            // Hit left paddle
            const hitOffset = (pState.ball.y - (p1.y + p1.height / 2)) / (p1.height / 2);
            const speed = Math.min(pState.ball.maxSpeed, Math.hypot(pState.ball.vx, pState.ball.vy) * 1.05 + 0.3);
            const maxAngle = (Math.PI / 4) * 1.1;
            const angle = hitOffset * maxAngle;

            pState.ball.vx = speed * Math.cos(angle);
            pState.ball.vy = speed * Math.sin(angle);
            pState.ball.x = p1.x + p1.width + pState.ball.radius;

            pState.rally++;
            setCurrentRally(pState.rally);
            if (pState.rally > pongRallyHigh) {
              setPongRallyHigh(pState.rally);
              localStorage.setItem('aether_arcade_pong_high', pState.rally.toString());
            }

            soundEngine.playSynthTone(700 + pState.rally * 30, 'square', 0.06);

            // Particles
            for (let i = 0; i < 8; i++) {
              pState.particles.push({
                x: p1.x + p1.width,
                y: pState.ball.y,
                vx: Math.random() * 5 + 2,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color: '#06b6d4',
                size: 3,
              });
            }
          }

          // Player 2 / AI (Right)
          const p2 = pState.ai;
          if (
            pState.ball.vx > 0 &&
            pState.ball.x + pState.ball.radius >= p2.x &&
            pState.ball.x - pState.ball.radius <= p2.x + p2.width &&
            pState.ball.y >= p2.y - 4 &&
            pState.ball.y <= p2.y + p2.height + 4
          ) {
            // Hit right paddle
            const hitOffset = (pState.ball.y - (p2.y + p2.height / 2)) / (p2.height / 2);
            const speed = Math.min(pState.ball.maxSpeed, Math.hypot(pState.ball.vx, pState.ball.vy) * 1.05 + 0.3);
            const maxAngle = (Math.PI / 4) * 1.1;
            const angle = hitOffset * maxAngle;

            pState.ball.vx = -speed * Math.cos(angle);
            pState.ball.vy = speed * Math.sin(angle);
            pState.ball.x = p2.x - pState.ball.radius;

            pState.rally++;
            setCurrentRally(pState.rally);
            if (pState.rally > pongRallyHigh) {
              setPongRallyHigh(pState.rally);
              localStorage.setItem('aether_arcade_pong_high', pState.rally.toString());
            }

            soundEngine.playSynthTone(600 + pState.rally * 30, 'square', 0.06);

            // Particles
            for (let i = 0; i < 8; i++) {
              pState.particles.push({
                x: p2.x,
                y: pState.ball.y,
                vx: -(Math.random() * 5 + 2),
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color: '#a855f7',
                size: 3,
              });
            }
          }

          // 6. Scoring (Left or Right Goal)
          if (pState.ball.x < -20) {
            // AI Scores
            soundEngine.playUiSound('close');
            pState.aiScore++;
            setPongScore({ player: pState.playerScore, ai: pState.aiScore });
            pState.rally = 0;
            setCurrentRally(0);

            if (pState.aiScore >= pState.targetScore) {
              setIsGameOver(true);
              setIsPlaying(false);
              setWinner(pongDifficulty === '2player' ? 'player2' : 'ai');
            } else {
              pState.serveCountdown = 45;
              pState.ball.x = w / 2;
              pState.ball.y = h / 2;
              pState.ball.vx = pState.ball.baseSpeed;
              pState.ball.vy = (Math.random() - 0.5) * 4;
            }
          } else if (pState.ball.x > w + 20) {
            // Player 1 Scores
            soundEngine.playUiSound('chime');
            pState.playerScore++;
            setPongScore({ player: pState.playerScore, ai: pState.aiScore });
            pState.rally = 0;
            setCurrentRally(0);

            if (pState.playerScore >= pState.targetScore) {
              setIsGameOver(true);
              setIsPlaying(false);
              setWinner('player');
            } else {
              pState.serveCountdown = 45;
              pState.ball.x = w / 2;
              pState.ball.y = h / 2;
              pState.ball.vx = -pState.ball.baseSpeed;
              pState.ball.vy = (Math.random() - 0.5) * 4;
            }
          }
        }

        // Draw Ball Trail
        pState.ball.trail.forEach((t, i) => {
          const ratio = (i + 1) / pState.ball.trail.length;
          ctx.beginPath();
          ctx.arc(t.x, t.y, pState.ball.radius * ratio, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 72, 153, ${0.4 * ratio})`;
          ctx.fill();
        });

        // Draw Ball
        ctx.save();
        ctx.beginPath();
        ctx.arc(pState.ball.x, pState.ball.y, pState.ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f43f5e';
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#f43f5e';
        ctx.fill();
        ctx.restore();

        // Draw Player 1 Paddle (Cyan Neon)
        ctx.save();
        ctx.fillStyle = '#06b6d4';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();
        ctx.roundRect(pState.player.x, pState.player.y, pState.player.width, pState.player.height, 6);
        ctx.fill();
        ctx.restore();

        // Draw Player 2 / AI Paddle (Purple / Pink Neon)
        ctx.save();
        ctx.fillStyle = '#c084fc';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#c084fc';
        ctx.beginPath();
        ctx.roundRect(pState.ai.x, pState.ai.y, pState.ai.width, pState.ai.height, 6);
        ctx.fill();
        ctx.restore();

        // Draw Sparks / Particles
        pState.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        pState.particles = pState.particles.filter((p) => p.life > 0);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeGame, isPlaying, isGameOver, asteroidHighScore, pongRallyHigh, pongDifficulty]);

  return (
    <div id="arcade-app" className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none relative">
      {/* Top Banner with Game Selector & Stats */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-white/10 flex items-center justify-between z-10 shrink-0">
        {/* Game Mode Tabs */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white/5 p-0.5 rounded-xl border border-white/10">
            <button
              onClick={() => switchGame('pong')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeGame === 'pong'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Neural Pong</span>
            </button>

            <button
              onClick={() => switchGame('asteroids')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeGame === 'asteroids'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Asteroids</span>
            </button>
          </div>
        </div>

        {/* Dynamic Game Stats */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          {activeGame === 'pong' ? (
            <>
              {/* Pong Score Board */}
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                <span className="text-cyan-300 font-bold">P1: {pongScore.player}</span>
                <span className="text-slate-500">|</span>
                <span className="text-fuchsia-300 font-bold">
                  {pongDifficulty === '2player' ? 'P2' : 'AI'}: {pongScore.ai}
                </span>
              </div>

              <span className="text-amber-400 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>RALLY: {currentRally}</span>
              </span>

              <span className="text-purple-300 hidden sm:flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>BEST: {pongRallyHigh}</span>
              </span>
            </>
          ) : (
            <>
              <span className="text-cyan-300">SCORE: {score}</span>
              <span className="text-amber-400 flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>HI: {asteroidHighScore}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          className="w-full h-full cursor-crosshair"
        />

        {/* Start / Game Over Overlay for Neural Pong */}
        {activeGame === 'pong' && !isPlaying && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-purple-400">
                {isGameOver
                  ? winner === 'player'
                    ? '🏆 YOU DEFEATED THE NEURAL MATRIX!'
                    : winner === 'player2'
                    ? '🏆 PLAYER 2 VICTORIOUS!'
                    : '💀 NEURAL INTELLIGENCE WINS'
                  : 'NEURAL PONG 2099'}
              </h2>
              <p className="text-xs text-slate-400 max-w-sm">
                Retro-futuristic quantum table tennis with real-time velocity physics, dynamic paddle spin, and neural tracking.
              </p>
            </div>

            {/* Pong Mode / Difficulty Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md pt-2">
              <button
                onClick={() => setPongDifficulty('easy')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  pongDifficulty === 'easy'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Novice AI
              </button>

              <button
                onClick={() => setPongDifficulty('normal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  pongDifficulty === 'normal'
                    ? 'bg-violet-500/20 border-violet-400 text-violet-200 shadow-md shadow-violet-500/20'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Neural Core
              </button>

              <button
                onClick={() => setPongDifficulty('neural')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  pongDifficulty === 'neural'
                    ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200 shadow-md shadow-fuchsia-500/20'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Overclocked AI
              </button>

              <button
                onClick={() => setPongDifficulty('2player')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center space-x-1 ${
                  pongDifficulty === '2player'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>2-Player Versus</span>
              </button>
            </div>

            {/* Controls guide */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300 space-y-1">
              <div>
                <span className="text-cyan-400 font-mono">P1:</span> Move mouse or press <kbd className="bg-white/10 px-1 py-0.5 rounded font-mono">W / S</kbd>
              </div>
              {pongDifficulty === '2player' && (
                <div>
                  <span className="text-fuchsia-400 font-mono">P2:</span> Press <kbd className="bg-white/10 px-1 py-0.5 rounded font-mono">↑ / ↓</kbd>
                </div>
              )}
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:brightness-110 text-white font-bold text-sm flex items-center space-x-2 transition-all shadow-xl shadow-fuchsia-600/30"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isGameOver ? 'Play Rematch' : 'Launch Neural Match'}</span>
            </button>
          </div>
        )}

        {/* Start / Game Over Overlay for Asteroids */}
        {activeGame === 'asteroids' && !isPlaying && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in">
            <h2 className="text-3xl font-bold font-mono tracking-wider text-white">
              {isGameOver ? 'QUANTUM SHIP DESTROYED' : 'ASTEROID DEFENDER'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs">
              Use <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">A / D</kbd> or{' '}
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">← / →</kbd> to steer, and{' '}
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">SPACE</kbd> to fire photon beams.
            </p>

            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm flex items-center space-x-2 transition-all shadow-lg shadow-red-600/30"
            >
              <Play className="w-4 h-4" />
              <span>{isGameOver ? 'Retry Mission' : 'Engage Interceptor'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

