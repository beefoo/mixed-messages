import MathUtil from './MathUtil.js';
import Meyda from '../vendor/meyda.js';
import nlp from '../vendor/compromise/one/compromise-one.mjs';
import plg from '../vendor/compromise-speech/compromise-speech.mjs';

export default class TranscriptAligner {
  constructor(options = {}) {
    const defaults = {
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    nlp.extend(plg);
  }

  async align(audio, text) {
    this.text = nlp(text);
    console.log(this.text.syllables());
    this.ctx = new AudioContext();
    this.audioData = {};
    const buffer = await this.loadFromURL(audio);
    this.analyzeAudio(buffer);
    return true;
  }

  // Based on: https://github.com/meyda/meyda/issues/419
  analyzeAudio(buffer) {
    const mono = buffer.getChannelData(0);
    const bufferSize = 256;
    const features = ['rms'];
    Meyda.bufferSize = bufferSize;

    const numChunks = Math.floor(mono.length / bufferSize);
    const length = mono.length / buffer.sampleRate;
    const lengthPerChunk = mono.length / buffer.sampleRate / numChunks; //in secs
    console.log(`${length}s in total. ${lengthPerChunk}s per chunk`);

    // initialize audio data features
    features.forEach((feature) => {
      this.audioData[feature] = [];
    });

    // extract features
    for (let i = 0; i < numChunks; i += 1) {
      const chunk = mono.slice(i * bufferSize, (i + 1) * bufferSize);
      features.forEach((feature) => {
        const result = Meyda.extract(feature, chunk);
        this.audioData[feature].push(result);
      });
    }
    console.log(this.audioData['rms']);
  }

  getWaveform(height = 1.0) {
    const { rms } = this.audioData;
    const maxRms = MathUtil.maxList(rms);
    const minRms = MathUtil.minList(rms);
    return rms.map((value) => MathUtil.norm(value, minRms, maxRms) * height);
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
