import { useRef, useEffect } from 'react';
import { AudioReactiveDriver } from '../../lib/visuals/audioReactive';
import type { AudioEngine } from '../../lib/audio/AudioEngine';
import type { StructureSegment } from '../../lib/analysis/trackAnalysis';

interface WaveformCanvasProps {
  waveform: Float32Array;
  structure: StructureSegment[];
  duration: number;
  position: number;
  engine: AudioEngine;
  deck: 'A' | 'B';
}

export default function WaveformCanvas({
  waveform,
  structure,
  duration,
  position,
  engine,
  deck,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reactiveDriverRef = useRef<AudioReactiveDriver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize reactive driver
    const state = engine.getDeckState(deck);
    if (state.playing) {
      const analyserData = engine.getAnalyserData(deck);
      if (!reactiveDriverRef.current) {
        const analyser = (engine as any)[`analyser${deck}`];
        reactiveDriverRef.current = new AudioReactiveDriver(analyser);
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw structure segments
      structure.forEach(segment => {
        const startX = (segment.start / duration) * rect.width;
        const endX = (segment.end / duration) * rect.width;
        
        const colors = {
          intro: 'rgba(100, 200, 255, 0.1)',
          verse: 'rgba(150, 150, 255, 0.1)',
          drop: 'rgba(255, 100, 200, 0.15)',
          outro: 'rgba(100, 255, 200, 0.1)',
        };
        
        ctx.fillStyle = colors[segment.label];
        ctx.fillRect(startX, 0, endX - startX, rect.height);
      });

      // Update reactive driver
      if (reactiveDriverRef.current) {
        reactiveDriverRef.current.update();
      }

      const intensity = reactiveDriverRef.current?.getIntensity() || 0;
      const glowAmount = intensity * 20;

      // Draw waveform
      const barWidth = rect.width / waveform.length;
      
      for (let i = 0; i < waveform.length; i++) {
        const x = i * barWidth;
        const barHeight = waveform[i] * rect.height * 0.8;
        const y = (rect.height - barHeight) / 2;
        
        const isPast = (i / waveform.length) * duration < position;
        
        if (isPast) {
          ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + intensity * 0.4})`;
          ctx.shadowBlur = glowAmount;
          ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        } else {
          ctx.fillStyle = 'rgba(100, 100, 150, 0.4)';
          ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
      }

      // Draw playhead
      const playheadX = (position / duration) * rect.width;
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 0, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, rect.height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      requestAnimationFrame(draw);
    };

    draw();
  }, [waveform, structure, duration, position, engine, deck]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
