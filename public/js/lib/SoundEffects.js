import AudioLoader from './AudioLoader.js';

export default class SoundEffects {
  constructor(options = {}) {
    const defaults = {
      debug: false,
      tapAudioURL: 'audio/sfx/tap.wav',
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  async init() {
    this.ctx = new AudioContext();
    const loader = new AudioLoader({
      audioContext: this.ctx,
    });
    const loaded = await loader.loadFromURL(this.options.tapAudioURL);
    this.buf = loader.buf;
    if (loaded) this.loadListeners();
  }

  loadListeners() {
    const $buttons = document.querySelectorAll(
      '.control-button, .tool-button, .source-select',
    );
    $buttons.forEach(($button) => {
      $button.addEventListener('click', (_event) => {
        this.onClick();
      });
    });
  }

  onClick() {
    const { buf, ctx } = this;
    ctx.resume();
    const audioSource = ctx.createBufferSource();
    audioSource.buffer = buf;
    audioSource.connect(ctx.destination);
    audioSource.start();
  }
}
