// Web Audio API ambient sound generator and timer chimes
// Completely self-contained, no external asset dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientSourceNode: AudioNode | null = null;
  private ambientGainNode: GainNode | null = null;
  private currentAmbient: 'rain' | 'whitenoise' | 'library' | 'none' = 'none';

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play peaceful completion chime
  playCompletionChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major chord

      freqs.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 2.0);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Play subtle tick / button feedback
  playSoftClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  // Ambient sound synthesizer
  setAmbient(type: 'rain' | 'whitenoise' | 'library' | 'none', volume = 0.15) {
    this.stopAmbient();
    if (type === 'none') {
      this.currentAmbient = 'none';
      return;
    }

    try {
      this.initCtx();
      if (!this.ctx) return;

      this.currentAmbient = type;
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate brown/pink/white noise tailored to ambiance
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Brown noise with low-pass filtering feels like soothing rain on a window
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else if (type === 'library') {
          // Soft pink filtered murmur
          output[i] = (lastOut + (0.05 * white)) / 1.05;
          lastOut = output[i];
          output[i] *= 1.8;
        } else {
          // White noise
          output[i] = white * 0.4;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter
      const filter = this.ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      } else if (type === 'library') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.2, this.ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();

      this.ambientSourceNode = whiteNoise;
      this.ambientGainNode = gain;
    } catch (e) {
      console.warn('Ambient sound failed:', e);
    }
  }

  stopAmbient() {
    if (this.ambientSourceNode) {
      try {
        (this.ambientSourceNode as AudioScheduledSourceNode).stop();
        this.ambientSourceNode.disconnect();
      } catch {
        // Ignore
      }
      this.ambientSourceNode = null;
    }
    if (this.ambientGainNode) {
      this.ambientGainNode.disconnect();
      this.ambientGainNode = null;
    }
    this.currentAmbient = 'none';
  }

  getCurrentAmbient(): string {
    return this.currentAmbient;
  }
}

export const soundManager = new SoundManager();
