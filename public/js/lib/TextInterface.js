import Alphabet from './Alphabet.js';
import CollectionHelper from './CollectionHelper.js';

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
    this.refreshBBox();
  }

  cloneSyllable(syll) {
    const { wordIndex } = syll;
    const newSyll = structuredClone(
      CollectionHelper.objectOmit(syll, ['$el', '$trimLine']),
    );
    const $newEl = syll.$el.cloneNode(true);
    this.$el.append($newEl);
    const newIndex = this.data.words[wordIndex].syllables.length;
    newSyll.id = `syll-${wordIndex}-${newIndex}`;
    $newEl.id = newSyll.id;
    $newEl.setAttribute('data-syll', newIndex);
    newSyll.$el = $newEl;
    newSyll.$trimLine = $newEl.querySelector('.trim-line');
    newSyll.index = newIndex;
    this.data.words[wordIndex].syllables.push(newSyll);
    return newSyll;
  }

  getSyllableFromEl($el) {
    if (!$el.hasAttribute('data-syll')) return false;
    const wordIndex = parseInt($el.getAttribute('data-word'), 10);
    const syllableIndex = parseInt($el.getAttribute('data-syll'), 10);
    return this.data.words[wordIndex].syllables[syllableIndex];
  }

  async loadFromURL(url) {
    const response = await fetch(url);
    const data = await response.json();
    const totalDur = data.words[data.words.length - 1].end;

    // add syllable data
    data.words.forEach((word, i) => {
      word.syllables.forEach((syll, j) => {
        const { start, end } = syll;
        const duration = end - start;
        const rectData = {
          top: 0,
          left: (start / totalDur) * 100,
          width: (duration / totalDur) * 100,
          height: 100,
        };
        const syllData = {
          duration,
          wordIndex: i,
          index: j,
          id: `syll-${i}-${j}`,
          trim: 0,
          bass: 0,
          originalRect: structuredClone(rectData),
        };
        data.words[i].syllables[j] = Object.assign(syll, syllData, rectData);
      });
    });

    this.render(data);
    // keep track of HTML elements
    data.words.forEach((word, i) => {
      word.syllables.forEach((syll, j) => {
        const $el = document.getElementById(syll.id);
        data.words[i].syllables[j].$el = $el;
        data.words[i].syllables[j].$trimLine = $el.querySelector('.trim-line');
      });
    });
    this.data = data;
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
        const { displayText, duration, left, width } = syll;
        if (duration <= 0) return;
        const chars = displayText.split('');
        const charWidth = (1.0 / chars.length) * 100;
        html += `<button id="${syll.id}" class="syll" data-word="${i}" data-syll="${j}" style="left: ${left}%; width: ${width}%">`;
        chars.forEach((char, k) => {
          const letterData = this.alpha.get(char);
          if (!letterData) return;
          const charLeft = k * charWidth;
          html += `<div class="char" style="left: ${charLeft}%; width: ${charWidth}%">`;
          html += `  <div class="char-ghost">${letterData.html}</div>`;
          html += `  <div class="char-image">${letterData.html}</div>`;
          html += '</div>';
        });
        html += ' <div class="trim-line"></div>';
        html += '</button>';
      });
    });
    this.$el.innerHTML = html;
  }

  selectSyllableByFromEl($el) {
    const selectedSyll = this.getSyllableFromEl($el);
    this.data.words.forEach((word, i) => {
      word.syllables.forEach((syllable, j) => {
        const { $el } = syllable;
        if (selectedSyll.id == syllable.id) $el.classList.add('selected');
        else $el.classList.remove('selected');
      });
    });
  }
}
