import TranscriptAligner from './TranscriptAligner.js';

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
    this.aligner = new TranscriptAligner(this.options);
    this.renderSyllables(this.aligner.getSyllables());
  }

  renderSyllables(syllables) {
    const el = document.getElementById('textviz');
    let html = '';
    syllables.forEach((s) => {
      html += `<div class="syllable">${s}</div>`;
    });
    el.insertAdjacentHTML('beforeend', html);
  }
}
