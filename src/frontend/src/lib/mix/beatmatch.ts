export function calculateSyncRate(sourceBpm: number, targetBpm: number): number {
  if (sourceBpm === 0 || targetBpm === 0) return 1;
  return targetBpm / sourceBpm;
}

export function quantizePosition(position: number, bpm: number, subdivision: number = 4): number {
  const beatDuration = 60 / bpm;
  const subdivisionDuration = beatDuration / subdivision;
  return Math.round(position / subdivisionDuration) * subdivisionDuration;
}

export function calculateBeatGrid(duration: number, bpm: number): number[] {
  const beatDuration = 60 / bpm;
  const beats: number[] = [];
  
  for (let time = 0; time < duration; time += beatDuration) {
    beats.push(time);
  }
  
  return beats;
}
