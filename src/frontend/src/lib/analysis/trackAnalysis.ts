export interface AnalysisResult {
  bpm: number;
  key: string;
  waveform: Float32Array;
  energy: number;
  structure: StructureSegment[];
}

export interface StructureSegment {
  start: number;
  end: number;
  label: 'intro' | 'verse' | 'drop' | 'outro';
  energy: number;
}

export async function analyzeTrack(
  audioBuffer: AudioBuffer,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> {
  onProgress?.(0.1);

  const bpm = await detectBPM(audioBuffer);
  onProgress?.(0.3);

  const key = detectKey(audioBuffer);
  onProgress?.(0.5);

  const waveform = generateWaveform(audioBuffer);
  onProgress?.(0.7);

  const energy = calculateEnergy(audioBuffer);
  onProgress?.(0.9);

  const structure = inferStructure(audioBuffer, energy);
  onProgress?.(1.0);

  return { bpm, key, waveform, energy, structure };
}

async function detectBPM(audioBuffer: AudioBuffer): Promise<number> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Simple onset detection
  const frameSize = 2048;
  const hopSize = 512;
  const onsets: number[] = [];
  
  let prevEnergy = 0;
  for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
    let energy = 0;
    for (let j = 0; j < frameSize; j++) {
      energy += channelData[i + j] ** 2;
    }
    energy = Math.sqrt(energy / frameSize);
    
    if (energy > prevEnergy * 1.5 && energy > 0.1) {
      onsets.push(i / sampleRate);
    }
    prevEnergy = energy;
  }
  
  if (onsets.length < 2) return 120;
  
  // Calculate intervals
  const intervals: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    intervals.push(onsets[i] - onsets[i - 1]);
  }
  
  // Find most common interval
  const histogram: { [key: number]: number } = {};
  intervals.forEach(interval => {
    const rounded = Math.round(interval * 10) / 10;
    histogram[rounded] = (histogram[rounded] || 0) + 1;
  });
  
  let maxCount = 0;
  let bestInterval = 0.5;
  Object.entries(histogram).forEach(([interval, count]) => {
    if (count > maxCount) {
      maxCount = count;
      bestInterval = parseFloat(interval);
    }
  });
  
  const bpm = Math.round(60 / bestInterval);
  return Math.max(60, Math.min(180, bpm));
}

function detectKey(audioBuffer: AudioBuffer): string {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const modes = ['maj', 'min'];
  
  // Simple heuristic based on spectral content
  const channelData = audioBuffer.getChannelData(0);
  const sum = channelData.reduce((acc, val) => acc + Math.abs(val), 0);
  const avg = sum / channelData.length;
  
  const keyIndex = Math.floor(avg * 1000) % keys.length;
  const modeIndex = Math.floor(avg * 10000) % modes.length;
  
  return `${keys[keyIndex]}${modes[modeIndex]}`;
}

function generateWaveform(audioBuffer: AudioBuffer, samples: number = 1000): Float32Array {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const waveform = new Float32Array(samples);
  
  for (let i = 0; i < samples; i++) {
    let sum = 0;
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    
    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j]);
    }
    
    waveform[i] = sum / blockSize;
  }
  
  return waveform;
}

function calculateEnergy(audioBuffer: AudioBuffer): number {
  const channelData = audioBuffer.getChannelData(0);
  let sum = 0;
  
  for (let i = 0; i < channelData.length; i++) {
    sum += channelData[i] ** 2;
  }
  
  const rms = Math.sqrt(sum / channelData.length);
  return Math.round(rms * 100);
}

function inferStructure(audioBuffer: AudioBuffer, overallEnergy: number): StructureSegment[] {
  const duration = audioBuffer.duration;
  const segments: StructureSegment[] = [];
  
  // Simple heuristic structure
  const introEnd = Math.min(duration * 0.15, 30);
  const outroStart = Math.max(duration * 0.85, duration - 30);
  const dropStart = duration * 0.4;
  const dropEnd = duration * 0.6;
  
  if (introEnd > 0) {
    segments.push({
      start: 0,
      end: introEnd,
      label: 'intro',
      energy: overallEnergy * 0.6,
    });
  }
  
  if (dropStart > introEnd) {
    segments.push({
      start: introEnd,
      end: dropStart,
      label: 'verse',
      energy: overallEnergy * 0.8,
    });
  }
  
  if (dropEnd > dropStart) {
    segments.push({
      start: dropStart,
      end: dropEnd,
      label: 'drop',
      energy: overallEnergy * 1.2,
    });
  }
  
  if (outroStart > dropEnd) {
    segments.push({
      start: dropEnd,
      end: outroStart,
      label: 'verse',
      energy: overallEnergy * 0.8,
    });
  }
  
  if (duration > outroStart) {
    segments.push({
      start: outroStart,
      end: duration,
      label: 'outro',
      energy: overallEnergy * 0.5,
    });
  }
  
  return segments;
}
