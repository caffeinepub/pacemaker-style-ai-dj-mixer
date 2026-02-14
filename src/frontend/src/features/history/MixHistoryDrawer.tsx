import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Music, Clock } from 'lucide-react';
import { useMixHistory } from '../../hooks/useMixHistory';
import { downloadBlob, generateMixFilename } from '../../utils/download';

interface MixHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MixHistoryDrawer({ open, onOpenChange }: MixHistoryDrawerProps) {
  const { localMixes, backendMixes, isAuthenticated } = useMixHistory();

  const allMixes = [
    ...localMixes.map(m => ({ ...m, source: 'local' as const })),
    ...backendMixes.map(m => ({
      id: m.id.toString(),
      title: m.title,
      tracks: m.tracks,
      duration: Number(m.duration),
      createdAt: Number(m.createdAt) / 1000000,
      source: 'backend' as const,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  const handleDownload = (mix: typeof allMixes[0]) => {
    if (mix.source === 'local') {
      const localMix = localMixes.find(m => m.id === mix.id);
      if (localMix?.audioBlob) {
        downloadBlob(localMix.audioBlob, generateMixFilename(mix.title));
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Mix History</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(80vh-8rem)]">
          {allMixes.length === 0 ? (
            <Card className="p-8 text-center">
              <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recorded mixes yet</p>
            </Card>
          ) : (
            allMixes.map((mix) => (
              <Card key={mix.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{mix.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(mix.duration)}
                      </span>
                      <span>{new Date(mix.createdAt).toLocaleDateString()}</span>
                      <span className="text-neon-cyan">{mix.tracks.length} tracks</span>
                    </div>
                  </div>
                  {mix.source === 'local' && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDownload(mix)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
