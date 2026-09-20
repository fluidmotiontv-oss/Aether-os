/**
 * Procedural Web Audio API sound synthesizer for Aether.OS
 * Provides rich ethereal ambient soundscapes, 8-step polyphonic synth, and snappy UI sound FX.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private activeGenerators: Map<string, { stop: () => void; setVolume: (v: number) => void }> = new Map();
  public isMuted: boolean = false;
  public masterVolume: number = 0.5;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // UI Sound Effects
  public playUiSound(type: 'click' | 'open' | 'close' | 'minimize' | 'key' | 'chime' | 'warp') {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      gain.connect(this.sfxGain);
      osc.connect(gain);

      switch (type) {
        case 'click': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }
        case 'key': {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520 + Math.random() * 80, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }
        case 'open': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }
        case 'close': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(540, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.start(now);
          osc.stop(now + 0.14);
          break;
        }
        case 'minimize': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }
        case 'chime': {
          // Play a harmonious chord
          const freqs = [523.25, 659.25, 783.99, 1046.5]; // C E G C
          freqs.forEach((freq, idx) => {
            const o = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, now + idx * 0.04);
            g.connect(this.sfxGain!);
            o.connect(g);

            g.gain.setValueAtTime(0.12, now + idx * 0.04);
            g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.6);
            o.start(now + idx * 0.04);
            o.stop(now + idx * 0.04 + 0.6);
          });
          break;
        }
        case 'warp': {
          osc.type = 'sawtooth';
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(200, now);
          filter.frequency.exponentialRampToValueAtTime(3200, now + 0.25);
          osc.connect(filter);
          filter.connect(gain);
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
          break;
        }
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Synthesizer Note
  public playSynthTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.4, detune: number = 0) {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Ambient Soundscapes
  public toggleAmbientSound(id: string, soundType: 'drone' | 'rain' | 'pulsar' | 'binaural' | 'wind', enable: boolean, volume = 0.5) {
    this.init();
    if (!this.ctx || !this.ambientGain) return;

    if (!enable) {
      if (this.activeGenerators.has(id)) {
        this.activeGenerators.get(id)?.stop();
        this.activeGenerators.delete(id);
      }
      return;
    }

    if (this.activeGenerators.has(id)) return;

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
    trackGain.connect(this.ambientGain);

    let stopFn = () => {};

    if (soundType === 'drone') {
      // Warm ethereal tri-oscillator chord (D minor9 ambient drone)
      const freqs = [73.42, 110.0, 146.83, 220.0, 293.66];
      const oscs = freqs.map((f, i) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
        g.gain.setValueAtTime(0.12 / freqs.length, this.ctx!.currentTime);
        osc.connect(g);
        g.connect(trackGain);
        osc.start();
        return osc;
      });

      stopFn = () => {
        oscs.forEach((o) => {
          try { o.stop(); o.disconnect(); } catch {}
        });
        trackGain.disconnect();
      };
    } else if (soundType === 'binaural') {
      // 432 Hz Left / 438 Hz Right (6Hz Theta wave for focus)
      const merger = this.ctx.createChannelMerger(2);
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      oscL.frequency.setValueAtTime(216, this.ctx.currentTime);
      oscR.frequency.setValueAtTime(222, this.ctx.currentTime);
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(trackGain);
      oscL.start();
      oscR.start();

      stopFn = () => {
        try { oscL.stop(); oscR.stop(); merger.disconnect(); } catch {}
      };
    } else if (soundType === 'rain' || soundType === 'wind') {
      // Filtered Pink/Brown noise generator
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = soundType === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(soundType === 'rain' ? 800 : 380, this.ctx.currentTime);
      filter.Q.setValueAtTime(soundType === 'rain' ? 1.0 : 3.0, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(trackGain);
      whiteNoise.start();

      stopFn = () => {
        try { whiteNoise.stop(); whiteNoise.disconnect(); } catch {}
      };
    } else if (soundType === 'pulsar') {
      // Rhythmic subtle pulse
      const osc = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.5, this.ctx.currentTime); // 0.5 Hz pulse
      lfoGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(pGain.gain);

      osc.connect(pGain);
      pGain.connect(trackGain);
      osc.start();
      lfo.start();

      stopFn = () => {
        try { osc.stop(); lfo.stop(); } catch {}
      };
    }

    this.activeGenerators.set(id, {
      stop: stopFn,
      setVolume: (v: number) => {
        if (this.ctx) {
          trackGain.gain.setValueAtTime(v * 0.4, this.ctx.currentTime);
        }
      },
    });
  }

  public setSoundEffectVolume(v: number) {
    this.masterVolume = v;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(v * 0.3, this.ctx.currentTime);
    }
  }

  public setAmbientVolume(v: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(v * 0.4, this.ctx.currentTime);
    }
  }

  public stopAllAmbient() {
    this.activeGenerators.forEach((gen) => gen.stop());
    this.activeGenerators.clear();
  }

  public getAudioContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }
}

export const soundEngine = new SoundEngine();
