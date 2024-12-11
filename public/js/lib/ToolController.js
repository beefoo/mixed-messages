import MathUtil from './MathUtil.js';

export default class ToolController {
  constructor(options = {}) {
    const defaults = {
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.sequencer = this.options.sequencer;
    this.ui = this.options.ui;
  }

  move(pointer) {
    const { ui, sequencer } = this;
    const charId = pointer.$target.id;
    if (!charId) return;
    const syllable = ui.getSyllableByCharId(charId);
    if (!syllable) return;
    // get delta movement in percentage of bounding box
    const { bbox } = ui;
    const { delta } = pointer;
    const nx = (delta.x / bbox.width) * 100;
    const ny = (delta.y / bbox.height) * 100;
    // move syllable elements
    const { els, wordIndex, index } = syllable;
    const syllWidth = syllable.width;
    const i = wordIndex;
    const j = index;
    const minY = -200;
    const maxY = 200;
    els.forEach((el, k) => {
      const { $el, left, width, top, relativeLeft } = el;
      const minX = relativeLeft;
      const maxX = 100 - syllWidth + relativeLeft;
      const newLeft = MathUtil.clamp(left + nx, minX, maxX);
      const newTop = MathUtil.clamp(top + ny, minY, maxY);
      $el.style.left = `${newLeft}%`;
      $el.style.top = `${newTop}%`;
      ui.data.words[i].syllables[j].els[k].left = newLeft;
      ui.data.words[i].syllables[j].els[k].top = newTop;
    });
  }

  moveStart(_pointer) {
    this.ui.refreshBBox(); // refresh bounding box
  }
}
