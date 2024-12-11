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
    this.player = this.options.player;
  }

  move(pointer) {
    // retrieve the syllable from the pointer
    const { ui } = this;
    const charId = pointer.$target.id;
    if (!charId) return;
    const syllable = ui.getSyllableByCharId(charId);
    if (!syllable) return;
    const { els, wordIndex, index } = syllable;
    if (els.length < 1) return;

    // get delta movement in percentage of bounding box
    const { bbox } = ui;
    const { delta } = pointer;
    const nx = (delta.x / bbox.width) * 100;
    const ny = (delta.y / bbox.height) * 100;

    // move syllable elements in UI
    const syllWidth = syllable.width;
    const i = wordIndex;
    const j = index;
    const minY = -200;
    const maxY = 200;
    els.forEach((el, k) => {
      const { $el, left, top, relativeLeft } = el;
      const minX = relativeLeft;
      const maxX = 100 - syllWidth + relativeLeft;
      const newLeft = MathUtil.clamp(left + nx, minX, maxX);
      const newTop = MathUtil.clamp(top + ny, minY, maxY);
      $el.style.left = `${newLeft}%`;
      $el.style.top = `${newTop}%`;
      ui.data.words[i].syllables[j].els[k].left = newLeft;
      ui.data.words[i].syllables[j].els[k].top = newTop;
    });

    // now update the syllable start time in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    const syllLeft = ui.data.words[i].syllables[j].els[0].left;
    const nStart = syllLeft / 100.0;
    const newStart = sequencer.duration * nStart;
    const newEnd = newStart + syllable.duration;
    this.ui.data.words[i].syllables[j].start = newStart;
    this.ui.data.words[i].syllables[j].end = newEnd;
    sequence.forEach((item, index) => {
      const { group } = item;
      // update start time for player and UI callback
      if (group === syllable.id) {
        this.sequencer.sequence[index].start = newStart;
      }
    });
  }

  moveStart(_pointer) {
    this.ui.refreshBBox(); // refresh bounding box
  }
}
