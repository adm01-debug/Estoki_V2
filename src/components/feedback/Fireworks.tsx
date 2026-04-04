import React, { useEffect, useRef } from 'react';

interface FireworksProps {
  active: boolean;
  duration?: number;
}

export function Fireworks({ active, duration = 4000 }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fireworks: Array<{ x: number; y: number; targetY: number; speed: number; exploded: boolean; color: string }> = [];
    const particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }> = [];
    const colors = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f'];

    const createFirework = () => {
      fireworks.push({
        x: Math.random() * canvas.width,
        y: canvas.height,
        targetY: Math.random() * canvas.height * 0.5,
        vy: -10 - Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const explode = (x: number, y: number, color: string) => {
      for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 * i) / 50;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          life: 100,
        });
      }
    };

    let animationId: number;
    const startTime = Date.now();
    let lastFirework = 0;

    const animate = () => {
      const now = Date.now();
      if (now - startTime > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (now - lastFirework > 300) {
        createFirework();
        lastFirework = now;
      }

      fireworks.forEach((fw, i) => {
        fw.y += fw.vy;
        ctx.fillStyle = fw.color;
        ctx.fillRect(fw.x - 2, fw.y - 2, 4, 4);
        if (fw.y <= fw.targetY) {
          explode(fw.x, fw.y, fw.color);
          fireworks.splice(i, 1);
        }
      });

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 2;
        ctx.globalAlpha = p.life / 100;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        if (p.life <= 0) particles.splice(i, 1);
      });
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [active, duration]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}
