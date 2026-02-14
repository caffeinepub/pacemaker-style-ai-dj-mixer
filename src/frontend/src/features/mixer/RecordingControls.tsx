import { Circle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { downloadBlob, generateMixFilename } from '../../utils/download';
import { useMixHistory } from '../../hooks/useMixHistory';
import type { LoadedTrack } from './MixerScreen';

interface RecordingControlsProps {
  isRecording: boolean;
  duration: number;
  onStart: () => void;
  onStop: () => Promise<Blob>;
  deckATrack: LoadedTrack | null;
  deckBTrack: LoadedTrack | null;
}

export default function RecordingControls({
  isRecording,
  duration,
  onStart,
  onStop,
  deckATrack,
  deckBTrack,
}: RecordingControlsProps) {
  const { saveLocalMix } = useMixHistory();

  const handleStart = () => {
    if (!deckATrack && !deckBTrack) {
      toast.error('Load at least one track first');
      return;
    }
    onStart();
    toast.success('Recording started');
  };

  const handleStop = async () => {
    try {
      const blob = await onStop();
      
      const tracks: bigint[] = [];
      if (deckATrack) tracks.push(deckATrack.id);
      if (deckBTrack) tracks.push(deckBTrack.id);

      const mixTitle = `Mix ${new Date().toLocaleDateString()}`;
      
      saveLocalMix({
        id: Date.now().toString(),
        title: mixTitle,
        tracks,
        duration,
        createdAt: Date.now(),
        audioBlob: blob,
      });

      downloadBlob(blob, generateMixFilename(mixTitle));
      toast.success('Mix saved and downloaded!');
    } catch (error) {
      toast.error('Failed to save recording');
    }
  };

  return (
    <div className="px-3 pb-2">
      <Button
        variant={isRecording ? 'destructive' : 'default'}
        size="lg"
        onClick={isRecording ? handleStop : handleStart}
        className="w-full"
      >
        {isRecording ? (
          <>
            <Square className="w-5 h-5 mr-2 fill-current" />
            Stop Recording ({formatDuration(duration)})
          </>
        ) : (
          <>
            <Circle className="w-5 h-5 mr-2" />
            Start Recording
          </>
        )}
      </Button>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
