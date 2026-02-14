import { Menu, Library, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from '../auth/LoginButton';

interface MixerHeaderProps {
  onOpenLibrary: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export default function MixerHeader({ onOpenLibrary, onOpenHistory, onOpenSettings }: MixerHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <img 
          src="/assets/generated/app-icon.dim_1024x1024.png" 
          alt="DJ Mixer" 
          className="w-8 h-8 rounded-lg"
        />
        <h1 className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
          AI DJ Mixer
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onOpenLibrary}>
          <Library className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenHistory}>
          <History className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenSettings}>
          <Settings className="w-5 h-5" />
        </Button>
        <LoginButton />
      </div>
    </header>
  );
}
