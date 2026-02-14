import { Music2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function StreamingPlaceholder() {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Streaming library integration is coming soon. For now, use local files to import your music.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-3">
        {['Spotify', 'Apple Music', 'SoundCloud', 'YouTube Music'].map((service) => (
          <Card key={service} className="p-4 opacity-50">
            <div className="flex flex-col items-center gap-2 text-center">
              <Music2 className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium">{service}</p>
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
