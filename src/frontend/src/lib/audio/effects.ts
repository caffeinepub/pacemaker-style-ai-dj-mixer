export interface EffectChain {
  input: AudioNode;
  output: AudioNode;
  setFilter: (type: 'lowpass' | 'highpass', frequency: number) => void;
  setEcho: (time: number, feedback: number, mix: number) => void;
  setReverb: (mix: number) => void;
}

export function createEffectChain(context: AudioContext): EffectChain {
  const input = context.createGain();
  const filter = context.createBiquadFilter();
  const echoDelay = context.createDelay(2);
  const echoFeedback = context.createGain();
  const echoMix = context.createGain();
  const reverbConvolver = context.createConvolver();
  const reverbMix = context.createGain();
  const dryGain = context.createGain();
  const output = context.createGain();

  // Default filter settings
  filter.type = 'lowpass';
  filter.frequency.value = 20000;
  filter.Q.value = 1;

  // Echo chain
  echoDelay.delayTime.value = 0.375;
  echoFeedback.gain.value = 0;
  echoMix.gain.value = 0;

  // Reverb
  reverbMix.gain.value = 0;
  createReverbImpulse(context, reverbConvolver);

  // Connect filter
  input.connect(filter);

  // Echo routing
  filter.connect(echoDelay);
  echoDelay.connect(echoFeedback);
  echoFeedback.connect(echoDelay);
  echoDelay.connect(echoMix);

  // Reverb routing
  filter.connect(reverbConvolver);
  reverbConvolver.connect(reverbMix);

  // Dry signal
  filter.connect(dryGain);

  // Mix to output
  dryGain.connect(output);
  echoMix.connect(output);
  reverbMix.connect(output);

  return {
    input,
    output,
    setFilter: (type, frequency) => {
      filter.type = type;
      filter.frequency.setValueAtTime(frequency, context.currentTime);
    },
    setEcho: (time, feedback, mix) => {
      echoDelay.delayTime.setValueAtTime(time, context.currentTime);
      echoFeedback.gain.setValueAtTime(feedback, context.currentTime);
      echoMix.gain.setValueAtTime(mix, context.currentTime);
      dryGain.gain.setValueAtTime(1 - mix * 0.5, context.currentTime);
    },
    setReverb: (mix) => {
      reverbMix.gain.setValueAtTime(mix, context.currentTime);
      dryGain.gain.setValueAtTime(1 - mix * 0.3, context.currentTime);
    },
  };
}

function createReverbImpulse(context: AudioContext, convolver: ConvolverNode) {
  const sampleRate = context.sampleRate;
  const length = sampleRate * 2;
  const impulse = context.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
  }
  
  convolver.buffer = impulse;
}
