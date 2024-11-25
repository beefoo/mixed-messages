import AudioLoader from './AudioLoader.js';
import AudioPlayer from './AudioPlayer.js';
import AudioSelector from './AudioSelector.js';
import Sequencer from './Sequencer.js';
import TextInterface from './TextInterface.js';

export default class App {
  constructor(options = {}) {
    const defaults = {
      audioPath: 'audio/',
      el: 'app',
      debug: false,
      latency: 0.1, // schedule audio this far in advance (in seconds)
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    const { options } = this;
    this.el = document.getElementById(options.el);
    this.ctx = new AudioContext();
    this.selector = new AudioSelector({
      onSelect: (item) => this.onSelectAudio(item),
    });
    this.loader = new AudioLoader({
      audioContext: this.ctx,
    });
    this.ui = new TextInterface();
    this.player = new AudioPlayer({
      audioContext: this.ctx,
    });
    this.sequencer = new Sequencer({
      audioContext: this.ctx,
    });
    this.update();
  }

  async onSelectAudio(item) {
    const { audioPath } = this.options;
    const audioURL = `${audioPath}${item.id}.mp3`;
    const dataURL = `${audioPath}${item.id}.json`;
    const [audioResp, dataResp] = await Promise.all([
      this.loader.loadFromURL(audioURL),
      this.ui.loadFromURL(dataURL),
    ]);
    if (!audioResp || !dataResp) return;
    // set the audio buffer
    this.player.setBuffer(this.loader.buf);
    this.updateSequence();
    console.log(`Audio and data loaded for ${item.id}`);
  }

  update() {
    window.requestAnimationFrame(() => this.update());
    this.sequencer.update();
  }

  updateSequence() {
    const { duration } = this.loader;
    const { latency } = this.options;
    const { words } = this.ui.data;
    // set the sequence
    this.sequencer.setDuration(duration);
    const sequence = [];
    words.forEach((word) => {
      word.syllables.forEach((syll) => {
        const { start, end, $els } = syll;
        const playerItem = {
          start,
          latency,
          task: (when) => {
            this.player.play(start, end, when);
          },
        };
        const uiItem = {
          start,
          latency: 0,
          task: (_when) => {
            $els.forEach(($el) => {
              $el.classList.remove('playing');
              setTimeout(() => $el.classList.add('playing'), 1);
            });
          },
        };
        sequence.push(playerItem, uiItem);
      });
    });
    this.sequencer.setSequence(sequence);
  }
}
