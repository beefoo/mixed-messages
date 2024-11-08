import AudioLoader from './AudioLoader.js';
import AudioSelector from './AudioSelector.js';

export default class App {
  constructor(options = {}) {
    const defaults = {
      audioPath: 'audio/',
      el: 'app',
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    const { options } = this;
    this.el = document.getElementById(options.el);
    this.selector = new AudioSelector({
      onSelect: (item) => this.onSelectAudio(item),
    });
    this.loader = new AudioLoader();
  }

  onSelectAudio(item) {
    const { audioPath } = this.options;
    const audioURL = `${audioPath}${item.id}.mp3`;
    this.loader.loadFromURL(audioURL);
  }
}
