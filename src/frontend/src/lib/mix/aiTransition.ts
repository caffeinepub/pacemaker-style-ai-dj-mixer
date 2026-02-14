import type { AudioEngine } from '../audio/AudioEngine';

export interface TransitionConfig {
  duration: number;
  useFilter: boolean;
  useEcho: boolean;
}

export async function performAITransition(
  engine: AudioEngine,
  fromDeck: 'A' | 'B',
  toDeck: 'A' | 'B',
  config: TransitionConfig
): Promise<void> {
  const steps = 60;
  const stepDuration = (config.duration * 1000) / steps;
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    
    // Crossfade
    const crossfaderPos = fromDeck === 'A' ? progress : 1 - progress;
    engine.setCrossfader(crossfaderPos);
    
    // Filter sweep
    if (config.useFilter) {
      const filterFreq = 20000 - (progress * 18000);
      engine.setFilter(fromDeck, 'lowpass', filterFreq);
      engine.setFilter(toDeck, 'highpass', 20 + (progress * 180));
    }
    
    // Echo tail
    if (config.useEcho && progress > 0.7) {
      const echoMix = (progress - 0.7) / 0.3;
      engine.setEcho(fromDeck, 0.375, 0.4, echoMix * 0.3);
    }
    
    await new Promise(resolve => setTimeout(resolve, stepDuration));
  }
  
  // Reset effects
  engine.setFilter(fromDeck, 'lowpass', 20000);
  engine.setFilter(toDeck, 'lowpass', 20000);
  engine.setEcho(fromDeck, 0.375, 0, 0);
  engine.setEcho(toDeck, 0.375, 0, 0);
}
