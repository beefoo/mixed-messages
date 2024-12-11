export default class Sequencer {
  constructor(options = {}) {
    const defaults = {
      audioContext: false,
      debug: false,
      duration: 2.0, // in seconds
      sequence: [],
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.$playButton = document.getElementById('play-button');
    this.iteration = -1;
    this.ctx = this.options.audioContext || new AudioContext();
    this.ctx.suspend();
    this.isPlaying = false;
    this.setDuration(this.options.duration);
    this.setSequence(this.options.sequence);
    this.loadListeners();
  }

  isReady() {
    return this.sequence.length > 0;
  }

  loadListeners() {
    this.$playButton.onclick = (ev) => this.togglePlay();
  }

  pause() {
    this.isPlaying = false;
    this.ctx.suspend();
  }

  play() {
    this.resetSequence();
    this.isPlaying = true;
    this.iteration = -1;
    this.ctx.resume();
    this.startedAt = this.ctx.currentTime;
  }

  resetSequence() {
    this.sequence.forEach((_step, i) => {
      this.sequence[i].lastIterationPlayed = -1;
    });
  }

  setDuration(duration) {
    this.duration = duration;
  }

  setSequence(sequence) {
    this.sequence = sequence;
    this.resetSequence();
  }

  step() {
    if (!this.isPlaying || !this.isReady()) return;
    const { duration } = this;
    const now = this.ctx.currentTime - this.startedAt;
    this.sequence.forEach((step, i) => {
      const { start, lastIterationPlayed, latency, task } = step;
      const later = now + latency;
      const iteration = Math.floor(later / duration);
      const progress = later % duration;

      if (lastIterationPlayed >= iteration) return;
      if (progress >= start) {
        task(this.startedAt + later);
        this.sequence[i].lastIterationPlayed = iteration;
      }
    });
  }

  togglePlay() {
    if (!this.isReady()) return;
    this.$playButton.classList.toggle('playing');
    const isPlaying = this.$playButton.classList.contains('playing');
    if (isPlaying) this.play();
    else this.pause();
  }
}
