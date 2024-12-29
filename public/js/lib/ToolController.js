import MathHelper from './MathHelper.js';

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
    const newTop = MathHelper.clamp(top + ny, minY, maxY);
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

  loudness(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;
    const startingElDimensions = pointer.getData('loudnessStartElDimensions');
    if (!startingElDimensions) return;

    // get delta movement in percentage of bounding box
    const { bbox } = this.ui;
    const { deltaFromStart } = pointer;
    if (!deltaFromStart) return;
    const dy = -(deltaFromStart.y / bbox.height) * 100;

    // scale the syllable
    const { wordIndex, index, originalRect, $el } = syllable;
    const scaleRange = [0.25, 2.5];
    const i = wordIndex;
    const j = index;
    const { top, height } = startingElDimensions;
    const minHeight = originalRect.height * scaleRange[0];
    const maxHeight = originalRect.height * scaleRange[1];
    const newHeight = MathHelper.clamp(height + dy, minHeight, maxHeight);
    const newTop = top + (height - newHeight) * 0.5;
    $el.style.top = `${newTop}%`;
    $el.style.height = `${newHeight}%`;
    this.ui.data.words[i].syllables[j].top = newTop;
    this.ui.data.words[i].syllables[j].height = newHeight;

    // update the syllable in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    const volume = MathHelper.lerp(
      scaleRange[0],
      scaleRange[1],
      MathHelper.norm(newHeight, minHeight, maxHeight),
    );
    sequence.forEach((item, index) => {
      const { group } = item;
      // update start time for player and UI callback
      if (group === syllable.id) {
        this.sequencer.sequence[index].volume = volume;
      }
    });
  }

  loudnessStart(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;
    const { top, height } = syllable;
    const startingElDimensions = { top, height };
    pointer.setData('loudnessStartElDimensions', startingElDimensions);
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

    // scale the syllable
    const { wordIndex, index, originalRect, $el } = syllable;
    const scaleRange = [-3.0, 3.0];
    const i = wordIndex;
    const j = index;
    const { left, width } = startingElDimensions;
    const minWidth = originalRect.width * scaleRange[0];
    const maxWidth = originalRect.width * scaleRange[1];
    let newWidth = MathHelper.clamp(width + dx, minWidth, maxWidth);
    if (newWidth >= 0 && newWidth < 1.0) newWidth = 1.0;
    else if (newWidth < 0 && newWidth > -1.0) newWidth = -1.0;
    const isFlipped = newWidth < 0;
    const adjustedLeft = isFlipped ? left + newWidth : left;
    if (isFlipped) $el.classList.add('flip-x');
    else $el.classList.remove('flip-x');
    $el.style.left = `${adjustedLeft}%`;
    $el.style.width = `${Math.abs(newWidth)}%`;
    this.ui.data.words[i].syllables[j].width = newWidth;

    // update the syllable in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    // adjust start time if flipped
    const syllLeft = adjustedLeft;
    let nStart = syllLeft / 100.0;
    if (nStart < 0 || nStart > 1.0) nStart = nStart % 1.0; // wrap it if out of bounds
    const newStart = sequencer.duration * nStart;
    const newEnd = newStart + syllable.duration;
    this.ui.data.words[i].syllables[j].start = newStart;
    this.ui.data.words[i].syllables[j].end = newEnd;
    const scale = MathHelper.lerp(
      scaleRange[0],
      scaleRange[1],
      MathHelper.norm(newWidth, minWidth, maxWidth),
    );
    const playbackRate = 1.0 / Math.abs(scale);
    sequence.forEach((item, index) => {
      const { group } = item;
      // update start time for player and UI callback
      if (group === syllable.id) {
        this.sequencer.sequence[index].start = newStart;
        this.sequencer.sequence[index].reverse = isFlipped;
        this.sequencer.sequence[index].playbackRate = playbackRate;
      }
    });
  }

  pitchStart(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;
    const { left, width } = syllable;
    const startingElDimensions = { left, width };
    pointer.setData('pitchStartElDimensions', startingElDimensions);
  }
}
