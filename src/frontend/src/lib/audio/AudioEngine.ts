import { createEffectChain, type EffectChain } from './effects';

export interface DeckConfig {
  id: 'A' | 'B';
  audioBuffer: AudioBuffer | null;
  playing: boolean;
  position: number;
  playbackRate: number;
  volume: number;
  loop: boolean;
  loopStart: number;
  loopEnd: number;
  cuePoints: number[];
}

export class AudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private deckA: DeckState;
  private deckB: DeckState;
  private crossfaderPosition: number = 0.5;
  private analyserA: AnalyserNode;
  private analyserB: AnalyserNode;
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    this.analyserA = this.context.createAnalyser();
    this.analyserA.fftSize = 2048;
    this.analyserB = this.context.createAnalyser();
    this.analyserB.fftSize = 2048;

    this.deckA = this.createDeckState('A');
    this.deckB = this.createDeckState('B');
  }

  private createDeckState(id: 'A' | 'B'): DeckState {
    const gain = this.context.createGain();
    const analyser = id === 'A' ? this.analyserA : this.analyserB;
    
    const effects = createEffectChain(this.context);
    
    gain.connect(effects.input);
    effects.output.connect(analyser);
    analyser.connect(this.masterGain);

    return {
      id,
      gain,
      effects,
      analyser,
      source: null,
      audioBuffer: null,
      playing: false,
      position: 0,
      startTime: 0,
      pauseTime: 0,
      playbackRate: 1,
      loop: false,
      loopStart: 0,
      loopEnd: 0,
      cuePoints: [],
    };
  }

  loadTrack(deckId: 'A' | 'B', audioBuffer: AudioBuffer) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    this.stop(deckId);
    deck.audioBuffer = audioBuffer;
    deck.position = 0;
    deck.loopEnd = audioBuffer.duration;
  }

  play(deckId: 'A' | 'B') {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck.audioBuffer || deck.playing) return;

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    deck.source = this.context.createBufferSource();
    deck.source.buffer = deck.audioBuffer;
    deck.source.playbackRate.value = deck.playbackRate;
    deck.source.loop = deck.loop;
    
    if (deck.loop) {
      deck.source.loopStart = deck.loopStart;
      deck.source.loopEnd = deck.loopEnd;
    }

    deck.source.connect(deck.gain);
    
    deck.source.onended = () => {
      if (!deck.loop) {
        deck.playing = false;
        deck.position = 0;
      }
    };

    deck.source.start(0, deck.position);
    deck.startTime = this.context.currentTime - deck.position;
    deck.playing = true;
  }

  pause(deckId: 'A' | 'B') {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck.playing) return;

    deck.position = this.getCurrentPosition(deckId);
    this.stop(deckId);
  }

  stop(deckId: 'A' | 'B') {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (deck.source) {
      deck.source.stop();
      deck.source.disconnect();
      deck.source = null;
    }
    deck.playing = false;
  }

  getCurrentPosition(deckId: 'A' | 'B'): number {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck.playing || !deck.audioBuffer) return deck.position;
    
    const elapsed = (this.context.currentTime - deck.startTime) * deck.playbackRate;
    const position = elapsed % deck.audioBuffer.duration;
    return position;
  }

  seek(deckId: 'A' | 'B', position: number) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    const wasPlaying = deck.playing;
    
    if (wasPlaying) {
      this.stop(deckId);
    }
    
    deck.position = position;
    
    if (wasPlaying) {
      this.play(deckId);
    }
  }

  setPlaybackRate(deckId: 'A' | 'B', rate: number) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    deck.playbackRate = rate;
    if (deck.source) {
      deck.source.playbackRate.value = rate;
    }
  }

  setCrossfader(position: number) {
    this.crossfaderPosition = Math.max(0, Math.min(1, position));
    
    const gainA = Math.cos(this.crossfaderPosition * Math.PI / 2);
    const gainB = Math.sin(this.crossfaderPosition * Math.PI / 2);
    
    this.deckA.gain.gain.setValueAtTime(gainA, this.context.currentTime);
    this.deckB.gain.gain.setValueAtTime(gainB, this.context.currentTime);
  }

  setLoop(deckId: 'A' | 'B', enabled: boolean, start?: number, end?: number) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    deck.loop = enabled;
    
    if (start !== undefined) deck.loopStart = start;
    if (end !== undefined) deck.loopEnd = end;
    
    if (deck.source) {
      deck.source.loop = enabled;
      if (enabled) {
        deck.source.loopStart = deck.loopStart;
        deck.source.loopEnd = deck.loopEnd;
      }
    }
  }

  setFilter(deckId: 'A' | 'B', type: 'lowpass' | 'highpass', frequency: number) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    deck.effects.setFilter(type, frequency);
  }

  setEcho(deckId: 'A' | 'B', time: number, feedback: number, mix: number) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    deck.effects.setEcho(time, feedback, mix);
  }

  setReverb(deckId: 'A' | 'B', mix: number) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    deck.effects.setReverb(mix);
  }

  getAnalyserData(deckId: 'A' | 'B'): Uint8Array {
    const analyser = deckId === 'A' ? this.analyserA : this.analyserB;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    return data;
  }

  startRecording(): MediaStream {
    this.recordingDestination = this.context.createMediaStreamDestination();
    this.masterGain.connect(this.recordingDestination);
    return this.recordingDestination.stream;
  }

  stopRecording() {
    if (this.recordingDestination) {
      this.masterGain.disconnect(this.recordingDestination);
      this.recordingDestination = null;
    }
  }

  getDeckState(deckId: 'A' | 'B'): DeckConfig {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    return {
      id: deckId,
      audioBuffer: deck.audioBuffer,
      playing: deck.playing,
      position: this.getCurrentPosition(deckId),
      playbackRate: deck.playbackRate,
      volume: deck.gain.gain.value,
      loop: deck.loop,
      loopStart: deck.loopStart,
      loopEnd: deck.loopEnd,
      cuePoints: deck.cuePoints,
    };
  }

  dispose() {
    this.stop('A');
    this.stop('B');
    this.context.close();
  }
}

interface DeckState {
  id: 'A' | 'B';
  gain: GainNode;
  effects: EffectChain;
  analyser: AnalyserNode;
  source: AudioBufferSourceNode | null;
  audioBuffer: AudioBuffer | null;
  playing: boolean;
  position: number;
  startTime: number;
  pauseTime: number;
  playbackRate: number;
  loop: boolean;
  loopStart: number;
  loopEnd: number;
  cuePoints: number[];
}
