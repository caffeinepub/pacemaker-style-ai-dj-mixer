import { useState, useRef, useEffect } from 'react';
import { useGestures } from '../../hooks/useGestures';
import type { AudioEngine } from '../../lib/audio/AudioEngine';

interface CrossfaderProps {
  engine: AudioEngine;
}

export default function Crossfader({ engine }: CrossfaderProps) {
  const [position, setPosition] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newPos = x / rect.width;
    
    setPosition(newPos);
    engine.setCrossfader(newPos);
  };

  const gestures = useGestures({
    onSwipe: (deltaX) => {
      if (!containerRef.current || !isDraggingRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const delta = deltaX / rect.width;
      const newPos = Math.max(0, Math.min(1, position + delta));
      setPosition(newPos);
      engine.setCrossfader(newPos);
    },
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    updatePosition(e.clientX);
    gestures.onPointerDown(e.nativeEvent);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      updatePosition(e.clientX);
    }
    gestures.onPointerMove(e.nativeEvent);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    gestures.onPointerUp(e.nativeEvent);
  };

  return (
    <div className="py-4 px-3">
      <div className="flex items-center justify-between mb-2 text-xs font-semibold">
        <span className="text-neon-cyan">DECK A</span>
        <span className="text-muted-foreground">CROSSFADER</span>
        <span className="text-neon-magenta">DECK B</span>
      </div>
      
      <div
        ref={containerRef}
        className="relative h-16 bg-card/50 rounded-lg border border-border/50 cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        <div
          className="absolute top-1 bottom-1 w-12 bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-md shadow-lg transition-shadow"
          style={{
            left: `calc(${position * 100}% - 1.5rem)`,
            boxShadow: `0 0 20px rgba(${position < 0.5 ? '0, 255, 255' : '255, 0, 255'}, 0.6)`,
          }}
        >
          <div className="h-full flex items-center justify-center">
            <div className="w-1 h-8 bg-white/50 rounded-full" />
          </div>
        </div>

        <div
          className="absolute top-0 bottom-0 left-0 bg-neon-cyan/10 rounded-l-lg transition-all"
          style={{ width: `${(1 - position) * 100}%` }}
        />
        <div
          className="absolute top-0 bottom-0 right-0 bg-neon-magenta/10 rounded-r-lg transition-all"
          style={{ width: `${position * 100}%` }}
        />
      </div>
    </div>
  );
}
