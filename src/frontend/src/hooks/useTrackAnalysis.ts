import { useState, useCallback } from 'react';
import { analyzeTrack, type AnalysisResult } from '../lib/analysis/trackAnalysis';

export function useTrackAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const analyze = useCallback(async (audioBuffer: AudioBuffer): Promise<AnalysisResult> => {
    setAnalyzing(true);
    setProgress(0);

    try {
      const result = await analyzeTrack(audioBuffer, (p) => setProgress(p));
      return result;
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  }, []);

  return {
    analyze,
    analyzing,
    progress,
  };
}
