import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LocalFileImport from './LocalFileImport';
import StreamingPlaceholder from './StreamingPlaceholder';
import type { LoadedTrack } from '../mixer/MixerScreen';

interface LibraryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetDeck: 'A' | 'B' | null;
  onLoadTrack: (track: LoadedTrack, deck: 'A' | 'B') => void;
}

export default function LibraryDrawer({ open, onOpenChange, targetDeck, onLoadTrack }: LibraryDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Music Library</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="local" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Local Files</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="mt-4">
            <LocalFileImport
              targetDeck={targetDeck}
              onLoadTrack={(track, deck) => {
                onLoadTrack(track, deck);
                onOpenChange(false);
              }}
            />
          </TabsContent>

          <TabsContent value="streaming" className="mt-4">
            <StreamingPlaceholder />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
