import Meyda from '../vendor/meyda/main.js';
import nlp from '../vendor/compromise/one/compromise-one.mjs';
import plg from '../vendor/compromise-speech/compromise-speech.mjs';

export default class Analyzer {
  constructor(options = {}) {
    const defaults = {
      el: 'app',
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    const { options } = this;
    this.el = document.getElementById(options.el);
    nlp.extend(plg);
    const doc = nlp('seventh millenium. white collar');
    console.log(doc.syllables());
    this.ctx = new AudioContext();
  }

  async loadFromURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const audioData = await response.arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(audioData);
    } catch (error) {
      console.error(error.message);
    }
  }
}
