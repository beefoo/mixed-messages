import AudioLoader from './AudioLoader.js';
import AudioSelector from './AudioSelector.js';
import TextInterface from './TextInterface.js';

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
    this.ui = new TextInterface();
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
    console.log('Audio and data loaded');
  }
}
