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

  getSyllableFromPointer(pointer) {
    const charId = pointer.$target.id;
    if (!charId) return false;
    const syllable = this.ui.getSyllableByCharId(charId);
    if (!syllable) return false;
    return syllable;
  }

  move(pointer) {
    // retrieve the syllable from the pointer
    const syllable = ui.getSyllableByCharId(charId);
    if (!syllable) return;
    const { els, wordIndex, index } = syllable;
    if (els.length < 1) return;

    // get delta movement in percentage of bounding box
    const { bbox } = ui;
    const { delta } = pointer;
    if (!delta) return;
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
      this.ui.data.words[i].syllables[j].els[k].left = newLeft;
      this.ui.data.words[i].syllables[j].els[k].top = newTop;
    });

    // now update the syllable start time in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    const syllLeft = this.ui.data.words[i].syllables[j].els[0].left;
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

  pitch(pointer) {
    // retrieve the syllable from the pointer
    const syllable = ui.getSyllableByCharId(charId);
    if (!syllable) return;
    const { els, wordIndex, index } = syllable;
    if (els.length < 1) return;

    // get delta movement in percentage of bounding box
    const { bbox } = ui;
    const { deltaFromStart } = pointer;
    if (!deltaFromStart) return;
    const dx = deltaFromStart.x / bbox.width;
    const dy = deltaFromStart.y / bbox.height;
  }
}
