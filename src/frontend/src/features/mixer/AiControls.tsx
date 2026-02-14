import { useState } from 'react';
import { Zap, Shuffle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { performAITransition } from '../../lib/mix/aiTransition';
import { calculateSyncRate } from '../../lib/mix/beatmatch';
import type { AudioEngine } from '../../lib/audio/AudioEngine';
import type { LoadedTrack } from './MixerScreen';

interface AiControlsProps {
  engine: AudioEngine;
  deckATrack: LoadedTrack | null;
  deckBTrack: LoadedTrack | null;
}

export default function AiControls({ engine, deckATrack, deckBTrack }: AiControlsProps) {
  const [transitioning, setTransitioning] = useState(false);

  const handleSync = () => {
    if (!deckATrack || !deckBTrack) {
      toast.error('Load tracks on both decks first');
      return;
    }

    const rate = calculateSyncRate(deckBTrack.analysis.bpm, deckATrack.analysis.bpm);
    engine.setPlaybackRate('B', rate);
    toast.success('Decks synced!');
  };

  const handleAITransition = async () => {
    if (!deckATrack || !deckBTrack) {
      toast.error('Load tracks on both decks first');
      return;
    }

    setTransitioning(true);
    toast.info('Starting AI transition...');

    try {
      await performAITransition(engine, 'A', 'B', {
        duration: 8,
        useFilter: true,
        useEcho: true,
      });
      toast.success('Transition complete!');
    } catch (error) {
      toast.error('Transition failed');
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <div className="flex gap-2 px-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={!deckATrack || !deckBTrack}
        className="flex-1 border-neon-cyan/50 hover:bg-neon-cyan/10"
      >
        <Shuffle className="w-4 h-4 mr-1" />
        Sync BPM
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAITransition}
        disabled={!deckATrack || !deckBTrack || transitioning}
        className="flex-1 border-neon-magenta/50 hover:bg-neon-magenta/10"
      >
        <Zap className="w-4 h-4 mr-1" />
        {transitioning ? 'Transitioning...' : 'AI Transition'}
      </Button>
    </div>
  );
}
