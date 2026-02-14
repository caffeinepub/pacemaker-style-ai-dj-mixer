import { useState } from 'react';
import { Filter, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useGestures } from '../../hooks/useGestures';
import type { AudioEngine } from '../../lib/audio/AudioEngine';
import type { LoadedTrack } from './MixerScreen';

interface PerformanceToolsProps {
  deck: 'A' | 'B';
  engine: AudioEngine;
  track: LoadedTrack;
}

export default function PerformanceTools({ deck, engine, track }: PerformanceToolsProps) {
  const [filterFreq, setFilterFreq] = useState(20000);
  const [filterType, setFilterType] = useState<'lowpass' | 'highpass'>('lowpass');
  const [loopEnabled, setLoopEnabled] = useState(false);

  const handleFilterChange = (value: number[]) => {
    const freq = value[0];
    setFilterFreq(freq);
    engine.setFilter(deck, filterType, freq);
  };

  const toggleFilterType = () => {
    const newType = filterType === 'lowpass' ? 'highpass' : 'lowpass';
    setFilterType(newType);
    engine.setFilter(deck, newType, filterFreq);
  };

  const toggleLoop = () => {
    const newState = !loopEnabled;
    setLoopEnabled(newState);
    
    if (newState && track.audioBuffer) {
      const pos = engine.getCurrentPosition(deck);
      const beatDuration = 60 / track.analysis.bpm;
      const loopLength = beatDuration * 4; // 4-beat loop
      
      engine.setLoop(deck, true, pos, pos + loopLength);
    } else {
      engine.setLoop(deck, false);
    }
  };

  const pinchGestures = useGestures({
    onPinch: (scale) => {
      const newFreq = Math.max(20, Math.min(20000, filterFreq * scale));
      setFilterFreq(newFreq);
      engine.setFilter(deck, filterType, newFreq);
    },
  });

  return (
    <div className="p-3 border-t border-border/50 bg-card/30">
      <div className="flex items-center gap-2 mb-2">
        <Button
          size="sm"
          variant={filterFreq < 20000 ? 'default' : 'outline'}
          onClick={toggleFilterType}
          className="flex-1"
        >
          <Filter className="w-4 h-4 mr-1" />
          {filterType === 'lowpass' ? 'LPF' : 'HPF'}
        </Button>
        
        <Button
          size="sm"
          variant={loopEnabled ? 'default' : 'outline'}
          onClick={toggleLoop}
          className="flex-1"
        >
          <Repeat className="w-4 h-4 mr-1" />
          Loop
        </Button>
      </div>

      <div
        className="touch-none"
        onTouchStart={(e) => pinchGestures.onTouchStart(e.nativeEvent)}
        onTouchMove={(e) => pinchGestures.onTouchMove(e.nativeEvent)}
        onTouchEnd={(e) => pinchGestures.onTouchEnd(e.nativeEvent)}
        onPointerDown={(e) => pinchGestures.onPointerDown(e.nativeEvent)}
        onPointerMove={(e) => pinchGestures.onPointerMove(e.nativeEvent)}
        onPointerUp={(e) => pinchGestures.onPointerUp(e.nativeEvent)}
      >
        <Slider
          value={[filterFreq]}
          onValueChange={handleFilterChange}
          min={20}
          max={20000}
          step={10}
          className="w-full"
        />
        <div className="text-xs text-center text-muted-foreground mt-1">
          {Math.round(filterFreq)} Hz
        </div>
      </div>
    </div>
  );
}
