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
    const charLookup = {};
    this.render(data);
    // keep track of HTML element list
    data.words.forEach((word, i) => {
      word.syllables.forEach((syll, j) => {
        const { displayText } = syll;
        const chars = displayText.split('');
        const $els = chars.map((char, k) => {
          const id = `char-${i}-${j}-${k}`;
          charLookup[id] = [i, j, k];
          return document.getElementById(`char-${i}-${j}-${k}`);
        });
        data.words[i].syllables[j].$els = $els;
      });
    });
    this.data = data;
    this.charLookup = charLookup;
    return true;
  }

  render(data) {
    const { words } = data;
    if (words.length < 1) return;
    const totalDur = words[words.length - 1].end;
    let html = '';
    words.forEach((word, i) => {
      word.syllables.forEach((syll, j) => {
        const { start, end, displayText } = syll;
        const dur = end - start;
        if (dur <= 0) return;
        const chars = displayText.split('');
        const durPerChar = dur / chars.length;
        const wordStart = (start / totalDur) * 100;
        const charWidth = (durPerChar / totalDur) * 100;
        chars.forEach((char, k) => {
          const letterData = this.alpha.get(char);
          if (!letterData) return;
          const id = `char-${i}-${j}-${k}`;
          const classList = `word-${i} syll-${i}-${j}`;
          const charStart = wordStart + k * charWidth;
          html += `<div id="${id}" class="char ${classList}" style="left: ${charStart}%; width: ${charWidth}%">`;
          html += `  <div class="char-ghost">${letterData.html}</div>`;
          html += `  <div class="char-image">${letterData.html}</div>`;
          html += '</div>';
        });
      });
    });
    this.$el.innerHTML = html;
  }

  selectSyllableByCharId(charId) {
    if (charId in this.charLookup);
    const [wordIndex, syllableIndex, _charIndex] = this.charLookup[charId];
    this.data.words.forEach((word, i) => {
      word.syllables.forEach((syllable, j) => {
        syllable.$els.forEach(($el) => {
          if (i === wordIndex && j === syllableIndex)
            $el.classList.add('selected');
          else $el.classList.remove('selected');
        });
      });
    });
  }
}
