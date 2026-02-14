import { useEffect, useRef } from 'react';
import type { AudioEngine } from '../../lib/audio/AudioEngine';

interface ReactiveBackdropProps {
  engine: AudioEngine;
}

export default function ReactiveBackdrop({ engine }: ReactiveBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dataA = engine.getAnalyserData('A');
      const dataB = engine.getAnalyserData('B');
      
      const avgA = dataA.reduce((a, b) => a + b, 0) / dataA.length / 255;
      const avgB = dataB.reduce((a, b) => a + b, 0) / dataB.length / 255;
      const intensity = (avgA + avgB) / 2;

      particles.forEach(particle => {
        particle.update(intensity);
        particle.draw(ctx, intensity);
      });

      requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2;
    this.maxSize = 2 + Math.random() * 3;
  }

  update(intensity: number) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
    if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;

    this.size = this.maxSize * (0.5 + intensity * 0.5);
  }

  draw(ctx: CanvasRenderingContext2D, intensity: number) {
    const hue = 180 + intensity * 60;
    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${0.6 + intensity * 0.4})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
