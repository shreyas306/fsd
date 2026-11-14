class SoundSynthesizer {
  ctx = null;
  ambientGain = null;
  isAmbientPlaying = false;
  getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }
  // Play a shimmering celestial unlock chime
  playUnlockChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const frequencies = [261.63, 329.63, 392, 493.88, 587.33];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(1e-3, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(1e-4, now + idx * 0.12 + 3.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 3.6);
      });
    } catch (err) {
      console.warn("Audio playback not permitted yet by user gesture:", err);
    }
  }
  // Play a mechanical pneumatic seal sound
  playSealSound() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch (err) {
      console.warn("Seal sound prevented:", err);
    }
  }
  // Toggle ethereal ambient background drone
  toggleAmbientMusic(enable) {
    try {
      const ctx = this.getContext();
      if (!enable) {
        if (this.ambientGain) {
          this.ambientGain.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + 1);
          this.isAmbientPlaying = false;
        }
        return;
      }
      if (this.isAmbientPlaying) return;
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(1e-3, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.08, now + 2);
      this.ambientGain.connect(ctx.destination);
      [110, 164.81, 220, 329.63].forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, now);
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.2 + i * 0.05, now);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(2, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);
        osc.connect(this.ambientGain);
        osc.start(now);
      });
      this.isAmbientPlaying = true;
    } catch (err) {
      console.warn("Ambient drone prevented:", err);
    }
  }
}
const soundFx = new SoundSynthesizer();
export {
  soundFx
};
