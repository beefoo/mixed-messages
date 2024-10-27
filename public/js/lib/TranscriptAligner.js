import Meyda from '../vendor/meyda.js';
import nlp from '../vendor/compromise/one/compromise-one.mjs';
import plg from '../vendor/compromise-speech/compromise-speech.mjs';

export default class TranscriptAligner {
  constructor(options = {}) {
    const defaults = {
      audio: 'audio/say_children_what_does_it_all_mean_la_guardia.wav',
      text: 'Say children, what does it all mean?',
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  async init() {
    const { text, audio } = this.options;
    nlp.extend(plg);
    this.text = nlp(text);
    console.log(this.text.syllables());
    this.ctx = new AudioContext();
    const buffer = await this.loadFromURL(audio);
    this.analyzeAudio(buffer);
  }

  // Based on: https://github.com/meyda/meyda/issues/419
  analyzeAudio(buffer) {
    const mono = buffer.getChannelData(0);
    const bufferSize = 1024;
    Meyda.bufferSize = bufferSize;

    const numChunks = Math.floor(mono.length / bufferSize);
    const length = mono.length / buffer.sampleRate;
    const lengthPerChunk = mono.length / buffer.sampleRate / numChunks; //in secs
    console.log(`${length}s in total. ${lengthPerChunk}s per chunk`);

    const chunks = [];
    for (let i = 0; i < numChunks; i += 1) {
      const chunk = mono.slice(i * bufferSize, (i + 1) * bufferSize);
      const result = Meyda.extract('rms', chunk);
      chunks.push(result);
    }
    console.log(chunks);
  }

  getSyllables() {
    return this.text.syllables().at(0);
  }

  async loadFromURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Response status: ${response.status}`);
        return false;
      }

      const audioData = await response.arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(audioData);
      return buffer;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  }
}
