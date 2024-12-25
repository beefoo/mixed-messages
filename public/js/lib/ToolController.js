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
    const syllable = this.ui.getSyllableFromEl(pointer.$target);
    if (!syllable) return false;
    return syllable;
  }

  move(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // get delta movement in percentage of bounding box
    const { bbox } = this.ui;
    const { delta } = pointer;
    if (!delta) return;
    const nx = (delta.x / bbox.width) * 100;
    const ny = (delta.y / bbox.height) * 100;

    // move syllable elements in UI
    const { top, left, width, $el, wordIndex, index } = syllable;
    const i = wordIndex;
    const j = index;
    const isFlipped = width < 0;
    const minY = -200;
    const maxY = 200;
    const newLeft = left + nx;
    const adjustedLeft = isFlipped ? newLeft + width : newLeft;
    const newTop = MathUtil.clamp(top + ny, minY, maxY);
    $el.style.left = `${adjustedLeft}%`;
    $el.style.top = `${newTop}%`;
    this.ui.data.words[i].syllables[j].left = newLeft;
    this.ui.data.words[i].syllables[j].top = newTop;

    // now update the syllable start time in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    const syllLeft = adjustedLeft;
    let nStart = syllLeft / 100.0;
    if (nStart < 0 || nStart > 1.0) nStart = nStart % 1.0; // wrap it if out of bounds
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
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;
    const startingElDimensions = pointer.getData('pitchStartElDimensions');
    if (!startingElDimensions) return;

    // get delta movement in percentage of bounding box
    const { bbox } = this.ui;
    const { deltaFromStart } = pointer;
    if (!deltaFromStart) return;
    const dx = (deltaFromStart.x / bbox.width) * 100;
    const dy = (-deltaFromStart.y / bbox.height) * 100;

    // scale the syllable
    const { wordIndex, index, originalRect, $el } = syllable;
    const minScale = { x: -3.0, y: 0.1 };
    const maxScale = { x: 3.0, y: 4.0 };
    const i = wordIndex;
    const j = index;
    const { top, left, width, height } = startingElDimensions;
    // calculate new height within bounds
    const maxWidth = originalRect.width * maxScale.x;
    const minWidth = originalRect.width * minScale.x;
    const maxHeight = originalRect.height * maxScale.y;
    const minHeight = originalRect.height * minScale.y;
    let newWidth = MathUtil.clamp(width + dx, minWidth, maxWidth);
    if (newWidth >= 0 && newWidth < 1.0) newWidth = 1.0;
    else if (newWidth < 0 && newWidth > -1.0) newWidth = -1.0;
    const newHeight = MathUtil.clamp(height + dy, minHeight, maxHeight);
    const newTop = top + (height - newHeight) * 0.5;
    const isFlipped = newWidth < 0;
    if (isFlipped) $el.classList.add('flip-x');
    else $el.classList.remove('flip-x');
    $el.style.top = `${newTop}%`;
    $el.style.left = isFlipped ? `${left + newWidth}%` : `${left}%`;
    $el.style.width = `${Math.abs(newWidth)}%`;
    $el.style.height = `${newHeight}%`;
    this.ui.data.words[i].syllables[j].top = newTop;
    this.ui.data.words[i].syllables[j].width = newWidth;
    this.ui.data.words[i].syllables[j].height = newHeight;
  }

  pitchStart(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;
    const { top, left, width, height } = syllable;
    const startingElDimensions = { top, left, width, height };
    pointer.setData('pitchStartElDimensions', startingElDimensions);
  }
}
