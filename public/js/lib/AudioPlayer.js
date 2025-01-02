export default class AudioPlayer {
  constructor(options = {}) {
    const defaults = {
      audioContext: false,
      buffer: false,
      debug: false,
      fadeIn: 0.025,
      fadeOut: 0.025,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.buf = false;
    this.ctx = this.options.audioContext || new AudioContext();
  }

  static getReversedAudioBuffer(audioBuffer, audioContext) {
    const { numberOfChannels } = audioBuffer;

    // create the new AudioBuffer
    const newBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate,
    );

    // copy the cloned arrays to the new AudioBuffer
    for (let i = 0; i < numberOfChannels; i += 1) {
      const newChannel = new Float32Array(audioBuffer.getChannelData(i));
      Array.prototype.reverse.call(newChannel);
      newBuffer.getChannelData(i).set(newChannel);
    }

    return newBuffer;
  }

  isReady() {
    return this.buf !== false;
  }

  isRunning() {
    return this.ctx.state === 'running';
  }

  play(start, end, when = 0, options = {}) {
    if (!this.isReady()) return false;
    const { fadeIn, fadeOut } = this.options;
    const { ctx, buf, rbuf } = this;
    const volume = 'volume' in options ? options.volume : 1;
    const gain = this.constructor.volumeToGain(volume);
    const reverse = 'reverse' in options ? options.reverse : false;
    const playbackRate = 'playbackRate' in options ? options.playbackRate : 1;
    const trim = 'trim' in options ? options.trim : 0;
    const dur = end - start + fadeIn + fadeOut - trim;
    let offsetStart = Math.max(0, start - fadeIn);
    if (reverse) {
      offsetStart = rbuf.duration - offsetStart - dur;
    }
    const audioSource = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    // set audio buffer
    if (reverse) audioSource.buffer = rbuf;
    else audioSource.buffer = buf;

    // set playback rate
    audioSource.playbackRate.value = playbackRate;

    // fade in
    gainNode.gain.setValueAtTime(Number.EPSILON, when);
    gainNode.gain.exponentialRampToValueAtTime(gain, when + fadeIn);
    // fade out
    gainNode.gain.setValueAtTime(gain, when + dur - fadeOut);
    gainNode.gain.exponentialRampToValueAtTime(Number.EPSILON, when + dur);

    // connect and play
    audioSource.connect(gainNode);
    gainNode.connect(ctx.destination);
    audioSource.start(when, offsetStart, dur);
    return audioSource;
  }

  resume() {
    this.ctx.resume();
  }

  setBuffer(audioBuffer) {
    this.buf = audioBuffer;
    this.rbuf = this.constructor.getReversedAudioBuffer(this.buf, this.ctx);
  }

  static volumeToGain(volume = 1) {
    let gain = volume;
    if (volume > 1) gain = 10.0 * Math.log(Math.pow(volume, 2));
    else if (volume < 1) gain = Math.pow(volume, 2);
    return gain;
  }
}
