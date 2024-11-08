import Alphabet from './Alphabet.js';

export default class TextInterface {
  constructor(options = {}) {
    const defaults = {
      el: 'text-ui',
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.data = false;
    this.alpha = new Alphabet();
    this.$el = document.getElementById(this.options.el);
  }

  async loadFromURL(url) {
    const response = await fetch(url);
    const data = await response.json();
    this.data = data;
    this.render(data);
    return true;
  }

  render(data) {
    const { words } = data;
    if (words.length < 1) return;
    const totalDur = words[words.length - 1].end + 1.0 / 16.0;
    let html = '';
    words.forEach((word) => {
      word.phones.forEach((phone) => {
        const { start, end, displayText } = phone;
        const dur = end - start;
        if (dur <= 0) return;
        const chars = displayText.split('');
        const durPerChar = dur / chars.length;
        const wordStart = (start / totalDur) * 100;
        const charWidth = (durPerChar / totalDur) * 100;
        chars.forEach((char, i) => {
          const letterData = this.alpha.get(char);
          if (!letterData) return;
          const charStart = wordStart + i * charWidth;
          html += `<div class="char" style="left: ${charStart}%; width: ${charWidth}%">${letterData.html}</div>`;
        });
      });
    });
    this.$el.innerHTML = html;
  }
}
