import TranscriptAligner from './TranscriptAligner.js';

export default class Analyzer {
  constructor(options = {}) {
    const defaults = {
      el: 'app',
      audio: 'audio/and_say_children_what_does_it_all_mean_la_guardia.wav',
      text: 'And say children, what does it all mean?',
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  async init() {
    const { audio, text } = this.options;
    this.aligner = new TranscriptAligner(this.options);
    const result = await this.aligner.align(audio, text);
    if (!result) return;
    this.renderSyllables();
    this.renderWaveform();
  }

  renderSyllables() {
    const syllables = this.aligner.getSyllables();
    const el = document.getElementById('textviz');
    let html = '';
    syllables.forEach((s) => {
      html += `<div class="syllable">${s}</div>`;
    });
    el.insertAdjacentHTML('beforeend', html);
  }

  renderWaveform() {
    const canvas = document.getElementById('waveform');
    const { width, height } = canvas.getBoundingClientRect();
    const halfHeight = Math.round(height * 0.5);
    const waveform = this.aligner.getWaveform(halfHeight);
    const ctx = canvas.getContext('2d');
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';

    for (let x = 0; x < width; x += 1) {
      const n = parseFloat(x) / (width - 1);
      const i = Math.round(n * (waveform.length - 1));
      const value = waveform[i];
      const y0 = halfHeight - value;
      const y1 = halfHeight + value;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
      ctx.stroke();
    }
  }
}
