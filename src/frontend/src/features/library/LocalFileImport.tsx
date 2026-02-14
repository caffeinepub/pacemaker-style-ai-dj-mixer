import { useState } from 'react';
import { Upload, Music, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTrackAnalysis } from '../../hooks/useTrackAnalysis';
import { useTrackLibrary } from '../../hooks/useTrackLibrary';
import { useImportTrack } from '../../hooks/useQueries';
import type { LoadedTrack } from '../mixer/MixerScreen';
import type { TrackMetadata } from '../../backend';

interface LocalFileImportProps {
  targetDeck: 'A' | 'B' | null;
  onLoadTrack: (track: LoadedTrack, deck: 'A' | 'B') => void;
}

export default function LocalFileImport({ targetDeck, onLoadTrack }: LocalFileImportProps) {
  const { analyze, analyzing, progress } = useTrackAnalysis();
  const { tracks, addLocalTrack, isAuthenticated } = useTrackLibrary();
  const importTrackMutation = useImportTrack();
  const [selectedDeck, setSelectedDeck] = useState<'A' | 'B'>(targetDeck || 'A');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      toast.info('Analyzing track...');
      const analysis = await analyze(audioBuffer);

      const trackId = BigInt(Date.now());
      const trackMetadata: TrackMetadata = {
        id: trackId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        bpm: BigInt(analysis.bpm),
        key: analysis.key,
        energy: BigInt(analysis.energy),
        filePath: file.name,
        importedAt: BigInt(Date.now() * 1000000),
      };

      const loadedTrack: LoadedTrack = {
        ...trackMetadata,
        audioBuffer,
        file,
        analysis,
      };

      if (isAuthenticated) {
        await importTrackMutation.mutateAsync(trackMetadata);
      } else {
        addLocalTrack(loadedTrack);
      }

      toast.success('Track imported!');
      onLoadTrack(loadedTrack, selectedDeck);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import track');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={selectedDeck === 'A' ? 'default' : 'outline'}
          onClick={() => setSelectedDeck('A')}
          className="flex-1"
        >
          Load to Deck A
        </Button>
        <Button
          variant={selectedDeck === 'B' ? 'default' : 'outline'}
          onClick={() => setSelectedDeck('B')}
          className="flex-1"
        >
          Load to Deck B
        </Button>
      </div>

      <label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          disabled={analyzing}
          className="hidden"
        />
        <Card className="p-8 border-dashed border-2 cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="flex flex-col items-center gap-3 text-center">
            {analyzing ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-neon-cyan" />
                <p className="text-sm font-medium">Analyzing... {Math.round(progress * 100)}%</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div>
                  <p className="font-medium">Import Audio File</p>
                  <p className="text-sm text-muted-foreground">Click to select MP3, WAV, or other audio</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </label>

      {tracks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Your Tracks</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tracks.map((track) => (
              <Card
                key={track.id.toString()}
                className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => {
                  if ('audioBuffer' in track && track.audioBuffer) {
                    onLoadTrack(track as LoadedTrack, selectedDeck);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-neon-cyan" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  {track.bpm && (
                    <span className="text-xs font-mono text-neon-magenta">
                      {track.bpm.toString()} BPM
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
