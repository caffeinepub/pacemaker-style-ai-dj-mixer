import type { LocalTrack } from '../../hooks/useTrackLibrary';
import type { AnalysisResult } from '../analysis/trackAnalysis';

export interface TrackScore {
  track: LocalTrack;
  score: number;
  reasons: string[];
}

export function recommendNextTrack(
  currentTrack: LocalTrack & { analysis?: AnalysisResult },
  availableTracks: (LocalTrack & { analysis?: AnalysisResult })[],
  count: number = 5
): TrackScore[] {
  if (!currentTrack.analysis) return [];
  
  const scored = availableTracks
    .filter(t => t.id !== currentTrack.id && t.analysis)
    .map(track => {
      const reasons: string[] = [];
      let score = 0;
      
      // BPM compatibility
      const bpmDiff = Math.abs((track.analysis?.bpm || 0) - currentTrack.analysis!.bpm);
      if (bpmDiff < 5) {
        score += 40;
        reasons.push('Perfect BPM match');
      } else if (bpmDiff < 10) {
        score += 25;
        reasons.push('Close BPM');
      } else if (bpmDiff < 20) {
        score += 10;
      }
      
      // Key compatibility (simplified)
      if (track.analysis?.key === currentTrack.analysis?.key) {
        score += 30;
        reasons.push('Same key');
      }
      
      // Energy progression
      const energyDiff = (track.analysis?.energy || 0) - currentTrack.analysis!.energy;
      if (energyDiff > 0 && energyDiff < 20) {
        score += 20;
        reasons.push('Energy builds');
      } else if (Math.abs(energyDiff) < 10) {
        score += 15;
        reasons.push('Similar energy');
      }
      
      // Random factor for variety
      score += Math.random() * 10;
      
      return { track, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
  
  return scored.slice(0, count);
}
