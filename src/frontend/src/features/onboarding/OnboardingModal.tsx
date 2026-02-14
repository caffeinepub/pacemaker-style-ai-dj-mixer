import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hand, Move, Repeat, Zap } from 'lucide-react';
import { useDjMode } from '../../hooks/useDjMode';

export default function OnboardingModal() {
  const { completeOnboarding, setMode } = useDjMode();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to AI DJ Mixer',
      description: 'A touch-first DJ experience that makes mixing feel like playing an instrument.',
      icon: <Zap className="w-16 h-16 text-neon-cyan" />,
    },
    {
      title: 'Gesture Controls',
      description: 'Swipe to crossfade, pinch to filter, tap for effects, and hold to loop.',
      icon: <Hand className="w-16 h-16 text-neon-magenta" />,
    },
    {
      title: 'AI Assistance',
      description: 'Let AI handle beatmatching and transitions, or take full manual control.',
      icon: <Repeat className="w-16 h-16 text-neon-cyan" />,
    },
  ];

  const handleModeSelect = (mode: 'beginner' | 'pro') => {
    setMode(mode);
    completeOnboarding();
  };

  if (step < steps.length) {
    const currentStep = steps[step];
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentStep.title}</DialogTitle>
            <DialogDescription>{currentStep.description}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-8">
            {currentStep.icon}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={() => setStep(step + 1)} className="flex-1">
              {step === steps.length - 1 ? 'Choose Mode' : 'Next'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Mode</DialogTitle>
          <DialogDescription>You can change this later in settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Card
            className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-neon-cyan/50"
            onClick={() => handleModeSelect('beginner')}
          >
            <h3 className="font-semibold mb-1">Beginner Mode</h3>
            <p className="text-sm text-muted-foreground">
              AI keeps everything in sync. Perfect for getting started.
            </p>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-neon-magenta/50"
            onClick={() => handleModeSelect('pro')}
          >
            <h3 className="font-semibold mb-1">Pro Mode</h3>
            <p className="text-sm text-muted-foreground">
              Full manual control over every parameter.
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
