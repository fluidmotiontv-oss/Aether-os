import React, { useEffect, useRef } from 'react';
import { WallpaperStyle } from '../types';

interface WallpaperCanvasProps {
  style: WallpaperStyle;
  speed: number;
  particleDensity: number;
  theme: string;
}

export const WallpaperCanvas: React.FC<WallpaperCanvasProps> = ({
  style,
  speed = 1,
  particleDensity = 60,
  theme = 'violet',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / width - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle setup
    const particleCount = Math.floor((particleDensity / 100) * 120);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4 * speed,
      speedY: (Math.random() - 0.5) * 0.4 * speed,
      alpha: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      hueOffset: Math.random() * 60,
    }));

    let time = 0;

    const render = () => {
      time += 0.015 * speed;
      // Smooth mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, width, height);

      // Base background gradient based on style & theme
      if (style === 'aurora') {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#060714');
        bgGrad.addColorStop(0.5, '#0b0f24');
        bgGrad.addColorStop(1, '#04050d');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Draw multiple glowing aurora ribbons
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          const ribbonY = height * (0.3 + r * 0.2) + my * 40;
          ctx.moveTo(0, ribbonY);

          for (let x = 0; x <= width; x += 20) {
            const angle = (x * 0.003) + time * (0.8 + r * 0.3) + r * 1.5;
            const y = ribbonY + Math.sin(angle) * 70 + Math.cos(angle * 0.6) * 40;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();

          const auroraGrad = ctx.createLinearGradient(0, ribbonY - 60, 0, ribbonY + 200);
          if (r === 0) {
            auroraGrad.addColorStop(0, 'rgba(139, 92, 246, 0.25)'); // Violet
            auroraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)'); // Cyan
            auroraGrad.addColorStop(1, 'rgba(6, 7, 20, 0)');
          } else if (r === 1) {
            auroraGrad.addColorStop(0, 'rgba(16, 185, 129, 0.2)'); // Emerald
            auroraGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.12)'); // Indigo
            auroraGrad.addColorStop(1, 'rgba(6, 7, 20, 0)');
          } else {
            auroraGrad.addColorStop(0, 'rgba(236, 72, 153, 0.18)'); // Pink
            auroraGrad.addColorStop(0.7, 'rgba(124, 58, 237, 0.08)');
            auroraGrad.addColorStop(1, 'rgba(6, 7, 20, 0)');
          }

          ctx.fillStyle = auroraGrad;
          ctx.fill();
        }
      } else if (style === 'nebula') {
        const bgGrad = ctx.createRadialGradient(
          width * 0.5 + mx * 80,
          height * 0.45 + my * 80,
          20,
          width * 0.5,
          height * 0.5,
          width * 0.8
        );
        bgGrad.addColorStop(0, '#1c1038');
        bgGrad.addColorStop(0.4, '#0f0c22');
        bgGrad.addColorStop(1, '#05040d');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Nebula clouds
        for (let i = 0; i < 4; i++) {
          const cx = width * (0.3 + 0.4 * Math.sin(time * 0.2 + i * 1.5)) + mx * 50;
          const cy = height * (0.4 + 0.3 * Math.cos(time * 0.15 + i * 1.2)) + my * 50;
          const rad = Math.max(0, Math.min(width, height) * 0.45);

          const nGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
          const colors = [
            'rgba(168, 85, 247, 0.18)',
            'rgba(59, 130, 246, 0.15)',
            'rgba(244, 63, 94, 0.12)',
            'rgba(6, 182, 212, 0.14)',
          ];
          nGrad.addColorStop(0, colors[i % colors.length]);
          nGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = nGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (style === 'cyber-grid') {
        ctx.fillStyle = '#060812';
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.55 + my * 40;
        const fov = 320;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 1;

        // Perspective vertical grid lines
        const vanishingX = width * 0.5 + mx * 100;
        for (let x = -width; x <= width * 2; x += 70) {
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizonY);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Horizontal perspective lines
        const gridOffset = (time * 40) % 50;
        for (let i = 1; i <= 14; i++) {
          const depth = (i * 28 + gridOffset) / fov;
          const y = horizonY + depth * (height - horizonY) * 0.5;
          if (y > height || y < horizonY) continue;

          const alpha = Math.min(1, (y - horizonY) / (height - horizonY));
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Horizon glow
        const glowGrad = ctx.createLinearGradient(0, horizonY - 100, 0, horizonY + 50);
        glowGrad.addColorStop(0, 'rgba(0,0,0,0)');
        glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.25)');
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, horizonY - 80, width, 160);
      } else if (style === 'solar-flare') {
        const bgGrad = ctx.createRadialGradient(
          width * 0.5 + mx * 50,
          height * 0.4 + my * 50,
          10,
          width * 0.5,
          height * 0.5,
          width * 0.8
        );
        bgGrad.addColorStop(0, '#2d130a');
        bgGrad.addColorStop(0.5, '#120808');
        bgGrad.addColorStop(1, '#050204');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Pulsating golden solar core
        const coreX = width * 0.5 + mx * 40;
        const coreY = height * 0.45 + my * 40;
        const pulse = 1 + Math.sin(time * 2) * 0.08;
        const coreRad = 160 * pulse;

        const solarGrad = ctx.createRadialGradient(coreX, coreY, 20, coreX, coreY, coreRad * 2.5);
        solarGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
        solarGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.25)');
        solarGrad.addColorStop(0.8, 'rgba(225, 29, 72, 0.1)');
        solarGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = solarGrad;
        ctx.beginPath();
        ctx.arc(coreX, coreY, coreRad * 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Void Ethereal (Deep minimal luxury)
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#090a10');
        bgGrad.addColorStop(0.5, '#05060a');
        bgGrad.addColorStop(1, '#030406');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Subtle soft ambient glow in the top-right and bottom-left
        const topGlow = ctx.createRadialGradient(width * 0.8 + mx * 30, height * 0.2 + my * 30, 0, width * 0.8, height * 0.2, 400);
        topGlow.addColorStop(0, 'rgba(129, 140, 248, 0.12)');
        topGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGlow;
        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.2, 400, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw stardust / quantum particles
      particles.forEach((p) => {
        p.x += p.speedX + mx * 0.1;
        p.y += p.speedY + my * 0.1;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 3 + p.pulseSpeed * 100));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (style === 'solar-flare') {
          ctx.fillStyle = `rgba(253, 224, 71, ${currentAlpha})`;
        } else if (style === 'cyber-grid') {
          ctx.fillStyle = `rgba(56, 189, 248, ${currentAlpha})`;
        } else {
          ctx.fillStyle = `rgba(224, 231, 255, ${currentAlpha})`;
        }
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [style, speed, particleDensity, theme]);

  return (
    <canvas
      ref={canvasRef}
      id="aether-wallpaper-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 select-none"
    />
  );
};
