import Alphabet from './Alphabet.js';
import CollectionHelper from './CollectionHelper.js';

export default class TextInterface {
  constructor(options = {}) {
    const defaults = {
      el: 'text-ui',
      debug: false,
      maxTimeBetweenSyllables: 0.05,
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

  activateSyllableFromPointer(pointer, activate = true, className = 'active') {
    if (!pointer.$target) return;
    // we need to (de)activate both the main target and its wrapper
    const { $target } = pointer;
    let $primary = false;
    let $wrapper = false;
    if ($target.classList.contains('wrapper')) {
      $wrapper = $target;
      const newLength = $wrapper.id.length - '-wrapper'.length;
      $primary = document.getElementById($wrapper.id.slice(0, newLength));
    } else {
      $primary = $target;
      $wrapper = document.getElementById(`${$primary.id}-wrapper`);
    }
    const $els = [$primary, $wrapper];
    $els.forEach(($el) => {
      if (activate) $el.classList.add(className);
      else $el.classList.remove(className);
    });
  }

  addListenersToSyll(syll) {
    const { $el, $wrapper } = syll;
    const $els = [$el, $wrapper];
    $els.forEach(($e) => {
      $e.onblur = (_event) => {
        this.activateSyllableFromPointer({ $target: $e }, false);
      };
      $e.onfocus = (_event) => {
        this.activateSyllableFromPointer({ $target: $e });
      };
      $e.onmouseover = (_event) => {
        this.activateSyllableFromPointer({ $target: $e }, true, 'hover');
      };
      $e.onmouseout = (_event) => {
        this.activateSyllableFromPointer({ $target: $e }, false, 'hover');
      };
    });
  }

  cloneSyllable(syll) {
    const { wordIndex } = syll;
    const newSyll = structuredClone(
      CollectionHelper.objectOmit(syll, ['$el', '$wrapper']),
    );
    const oldId = syll.$el.id;
    const oldWrapperId = syll.$wrapper.id;
    const $newEl = syll.$el.cloneNode(true);
    const $newWrapper = syll.$wrapper.cloneNode(true);
    this.$el.append($newEl);
    this.$el.append($newWrapper);
    const newIndex = this.data.words[wordIndex].syllables.length;
    newSyll.id = `syll-${wordIndex}-${newIndex}`;
    $newEl.id = newSyll.id;
    $newEl.setAttribute('data-syll', newIndex);
    $newEl.querySelector(`#${oldId}-trim-line`).id = `${newSyll.id}-trim-line`;
    $newWrapper.id = `${newSyll.id}-wrapper`;
    $newWrapper.setAttribute('data-syll', newIndex);
    $newWrapper.querySelector(`#${oldWrapperId}-trim-line`).id =
      `${newSyll.id}-wrapper-trim-line`;

    newSyll.$el = $newEl;
    newSyll.$wrapper = $newWrapper;
    newSyll.index = newIndex;
    this.data.words[wordIndex].syllables.push(newSyll);
    this.addListenersToSyll(newSyll);
    // update order
    let order = 0;
    this.data.words.forEach((word, i) => {
      word.syllables.forEach((_syll, j) => {
        this.data.words[i].syllables[j].order = order;
        order += 1;
      });
    });
    setTimeout(() => {
      this.activateSyllableFromPointer({ $target: syll.$el }, false);
    }, 10);

    return newSyll;
  }

  getSyllableFromEl($el) {
    if (!$el.hasAttribute('data-syll')) return false;
    const wordIndex = parseInt($el.getAttribute('data-word'), 10);
    const syllableIndex = parseInt($el.getAttribute('data-syll'), 10);
    return this.data.words[wordIndex].syllables[syllableIndex];
  }

  getSyllableHTML(syll, isWrapper = false) {
    const {
      id,
      wordIndex,
      index,
      displayText,
      duration,
      top,
      left,
      width,
      height,
    } = syll;
    if (duration <= 0) return '';
    const chars = displayText.split('');
    const charWidth = (1.0 / chars.length) * 100;
    const elId = isWrapper ? `${id}-wrapper` : id;
    const className = isWrapper ? 'syll wrapper' : 'syll';
    const tabindex = isWrapper ? 'tabindex="-1"' : '';
    let html = '';
    html += `<button id="${elId}" class="${className}" data-word="${wordIndex}" data-syll="${index}" style="top: ${top}%; left: ${left}%; width: ${width}%; height: ${height}%" ${tabindex}>`;
    chars.forEach((char, k) => {
      const letterData = this.alpha.get(char);
      if (!letterData) return;
      const charLeft = k * charWidth;
      html += `<div class="char" style="left: ${charLeft}%; width: ${charWidth}%">`;
      html += `  <div class="char-ghost">${letterData.html}</div>`;
      html += `  <div class="char-image">${letterData.html}</div>`;
      html += '</div>';
    });
    html += ` <div id="${elId}-trim-line" class="trim-line"></div>`;
    html += '</button>';
    return html;
  }

  getSyllablesWhere(condition) {
    const all_matches = [];
    this.data.words.forEach((word) => {
      const matches = word.syllables.filter((syll) => condition(syll));
      all_matches.push(...matches);
    });
    return all_matches;
  }

  async loadFromURL(url) {
    const response = await fetch(url);
    const data = await response.json();
    const totalDur = data.words[data.words.length - 1].end;
    const height = 15;
    const top = (100 - height) * 0.5;

    // create a flattened index
    const indices = [];
    data.words.forEach((word, i) => {
      word.syllables.forEach((_syll, j) => {
        indices.push([i, j]);
      });
    });

    // adjust time between syllables
    const { maxTimeBetweenSyllables } = this.options;
    const syllCount = indices.length;
    indices.forEach((ij, index) => {
      const [i, j] = ij;
      if (index >= syllCount - 1) return;
      const syll = data.words[i].syllables[j];
      if (index === 0 && syll.start > maxTimeBetweenSyllables) {
        data.words[i].syllables[j].start = maxTimeBetweenSyllables;
      }
      const [i2, j2] = indices[index + 1];
      const nextSyll = data.words[i2].syllables[j2];
      const delta = nextSyll.start - syll.end;
      if (delta > maxTimeBetweenSyllables) {
        const newEnd = nextSyll.start - maxTimeBetweenSyllables;
        data.words[i].syllables[j].end = newEnd;
      }
    });

    // add syllable data
    let order = 0;
    data.words.forEach((word, i) => {
      word.syllables.forEach((syll, j) => {
        const { start, end } = syll;
        const duration = end - start;
        const rectData = {
          top,
          left: (start / totalDur) * 100,
          width: (duration / totalDur) * 100,
          height,
        };
        const syllData = {
          duration,
          wordIndex: i,
          index: j,
          order,
          id: `syll-${i}-${j}`,
          trim: 0,
          bass: 0,
          originalRect: structuredClone(rectData),
        };
        data.words[i].syllables[j] = Object.assign(syll, syllData, rectData);
        order += 1;
      });
    });

    this.render(data);
    // keep track of HTML elements
    data.words.forEach((word, i) => {
      word.syllables.forEach((syll, j) => {
        const $el = document.getElementById(syll.id);
        const $wrapper = document.getElementById(`${syll.id}-wrapper`);
        data.words[i].syllables[j].$el = $el;
        data.words[i].syllables[j].$wrapper = $wrapper;
        this.addListenersToSyll(syll);
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
    let html = '';
    words.forEach((word, i) => {
      word.syllables.forEach((syll, j) => {
        const syllHTML = this.getSyllableHTML(syll);
        const wrapperHTML = this.getSyllableHTML(syll, true);
        html += syllHTML + wrapperHTML;
      });
    });
    this.$el.innerHTML = html;
  }
}
