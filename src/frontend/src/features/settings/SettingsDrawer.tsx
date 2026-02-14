import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { useDjMode } from '../../hooks/useDjMode';

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
  const { mode, setMode } = useDjMode();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">DJ Mode</h3>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'beginner' | 'pro')}>
              <Card className="p-4 mb-3">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <div className="flex-1">
                    <Label htmlFor="beginner" className="font-semibold cursor-pointer">
                      Beginner Mode
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI assistance keeps everything in sync automatically. Perfect for getting started.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="pro" id="pro" />
                  <div className="flex-1">
                    <Label htmlFor="pro" className="font-semibold cursor-pointer">
                      Pro Mode
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Full manual control over sync, effects, and mixing parameters.
                    </p>
                  </div>
                </div>
              </Card>
            </RadioGroup>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Built with love using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
