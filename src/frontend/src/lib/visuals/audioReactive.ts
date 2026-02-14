export class AudioReactiveDriver {
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private smoothedIntensity: number = 0;
  private smoothedBass: number = 0;
  private smoothedMid: number = 0;
  private smoothedHigh: number = 0;

  constructor(analyser: AnalyserNode) {
    this.analyser = analyser;
    const buffer = new ArrayBuffer(analyser.frequencyBinCount);
    this.dataArray = new Uint8Array(buffer);
  }

  update() {
    // Type assertion needed due to TypeScript strict checking on ArrayBuffer vs ArrayBufferLike
    this.analyser.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>);
    
    // Calculate frequency bands
    const bass = this.getAverageBand(0, 0.1);
    const mid = this.getAverageBand(0.1, 0.4);
    const high = this.getAverageBand(0.4, 1);
    const overall = this.getAverageBand(0, 1);
    
    // Smooth values
    const smoothing = 0.7;
    this.smoothedIntensity = this.smoothedIntensity * smoothing + overall * (1 - smoothing);
    this.smoothedBass = this.smoothedBass * smoothing + bass * (1 - smoothing);
    this.smoothedMid = this.smoothedMid * smoothing + mid * (1 - smoothing);
    this.smoothedHigh = this.smoothedHigh * smoothing + high * (1 - smoothing);
  }

  private getAverageBand(startRatio: number, endRatio: number): number {
    const start = Math.floor(startRatio * this.dataArray.length);
    const end = Math.floor(endRatio * this.dataArray.length);
    
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += this.dataArray[i];
    }
    
    return sum / (end - start) / 255;
  }

  getIntensity(): number {
    return this.smoothedIntensity;
  }

  getBass(): number {
    return this.smoothedBass;
  }

  getMid(): number {
    return this.smoothedMid;
  }

  getHigh(): number {
    return this.smoothedHigh;
  }
}
