import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import WaveformCanvas from './WaveformCanvas';
import PerformanceTools from './PerformanceTools';
import type { AudioEngine } from '../../lib/audio/AudioEngine';
import type { LoadedTrack } from './MixerScreen';

interface DeckPanelProps {
  deck: 'A' | 'B';
  track: LoadedTrack | null;
  engine: AudioEngine;
  onLoadTrack: () => void;
}

export default function DeckPanel({ deck, track, engine, onLoadTrack }: DeckPanelProps) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (track?.audioBuffer) {
        const pos = engine.getCurrentPosition(deck);
        setPosition(pos);
        const state = engine.getDeckState(deck);
        setPlaying(state.playing);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [deck, engine, track]);

  const handlePlayPause = () => {
    if (playing) {
      engine.pause(deck);
    } else {
      engine.play(deck);
    }
  };

  const handleStop = () => {
    engine.stop(deck);
    engine.seek(deck, 0);
  };

  if (!track) {
    return (
      <Card className="flex-1 flex items-center justify-center bg-card/50 backdrop-blur-sm border-neon-cyan/20">
        <Button
          onClick={onLoadTrack}
          variant="outline"
          size="lg"
          className="border-neon-cyan/50 hover:bg-neon-cyan/10"
        >
          <Music className="w-5 h-5 mr-2" />
          Load Track to Deck {deck}
        </Button>
      </Card>
    );
  }

  const progress = track.audioBuffer ? (position / track.audioBuffer.duration) * 100 : 0;

  return (
    <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-neon-cyan/20 overflow-hidden">
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-neon-cyan">{track.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-neon-magenta font-mono">{track.analysis.bpm} BPM</span>
            <span className="text-neon-cyan font-mono">{track.analysis.key}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleStop}
            className="h-8 w-8"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={handlePlayPause}
            className="h-10 w-10 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/50"
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <div className="flex-1 text-xs text-muted-foreground font-mono">
            {formatTime(position)} / {formatTime(track.audioBuffer?.duration || 0)}
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <WaveformCanvas
          waveform={track.analysis.waveform}
          structure={track.analysis.structure}
          duration={track.audioBuffer?.duration || 0}
          position={position}
          engine={engine}
          deck={deck}
        />
      </div>

      <PerformanceTools deck={deck} engine={engine} track={track} />
    </Card>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
