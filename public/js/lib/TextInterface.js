import Alphabet from './Alphabet.js';
import MathUtil from './MathUtil.js';

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
    this.charLookup = {};
    this.alpha = new Alphabet();
    this.$el = document.getElementById(this.options.el);
    this.refreshBBox();
  }

  getSyllableByCharId(charId) {
    if (!(charId in this.charLookup)) return false;
    const [wordIndex, syllableIndex, _charIndex] = this.charLookup[charId];
    return this.data.words[wordIndex].syllables[syllableIndex];
  }

  async loadFromURL(url) {
    const response = await fetch(url);
    const data = await response.json();
    const charLookup = {};
    this.render(data);
    // keep track of HTML element list
    data.words.forEach((word, i) => {
      word.syllables.forEach((syll, j) => {
        const { start, end, displayText } = syll;
        const chars = displayText.split('');
        const $els = chars.map((char, k) => {
          const id = `char-${i}-${j}-${k}`;
          charLookup[id] = [i, j, k];
          return document.getElementById(`char-${i}-${j}-${k}`);
        });
        data.words[i].syllables[j].duration = end - start;
        data.words[i].syllables[j].wordIndex = i;
        data.words[i].syllables[j].index = j;
        data.words[i].syllables[j].id = `syll-${i}-${j}`;
        data.words[i].syllables[j].els = $els.map(($el) => {
          const left = parseFloat($el.getAttribute('data-left'));
          const width = parseFloat($el.getAttribute('data-width'));
          return {
            $el,
            top: 0,
            left,
            width,
            height: 100,
            original: {
              top: 0,
              left,
              width,
              height: 100,
            },
          };
        });
      });
    });
    // Add relative positions
    data.words.forEach((word, i) => {
      word.syllables.forEach((syll, j) => {
        if (syll.els.length < 1) return;
        const [first] = syll.els;
        const width = MathUtil.sum(syll.els, 'width');
        data.words[i].syllables[j].width = width;
        syll.els.forEach((el, k) => {
          let relativeLeft = 0;
          if (k > 0) {
            relativeLeft = el.left - first.left;
          }
          data.words[i].syllables[j].els[k].relativeLeft = relativeLeft;
          data.words[i].syllables[j].els[k].original.relativeLeft =
            relativeLeft;
        });
      });
    });
    this.data = data;
    this.charLookup = charLookup;
    return true;
  }

  refreshBBox() {
    this.bbox = this.$el.getBoundingClientRect().toJSON();
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
          html += `<div id="${id}" class="char ${classList}" style="left: ${charStart}%; width: ${charWidth}%" data-left="${charStart}" data-width="${charWidth}" data-top="0">`;
          html += `  <div class="char-ghost">${letterData.html}</div>`;
          html += `  <div class="char-image">${letterData.html}</div>`;
          html += '</div>';
        });
      });
    });
    this.$el.innerHTML = html;
  }

  selectSyllableByCharId(charId) {
    if (!(charId in this.charLookup)) return;
    const [wordIndex, syllableIndex, _charIndex] = this.charLookup[charId];
    this.data.words.forEach((word, i) => {
      word.syllables.forEach((syllable, j) => {
        syllable.els.forEach((el) => {
          const { $el } = el;
          if (i === wordIndex && j === syllableIndex)
            $el.classList.add('selected');
          else $el.classList.remove('selected');
        });
      });
    });
  }
}
