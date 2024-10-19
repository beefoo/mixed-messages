import Meyda from '../vendor/meyda/main.js';
import nlp from '../vendor/compromise/one/compromise-one.mjs';
import plg from '../vendor/compromise-speech/compromise-speech.mjs';

export default class Analyzer {
  constructor(options = {}) {
    const defaults = {
      el: 'app',
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  async init() {
    const { options } = this;
    this.el = document.getElementById(options.el);
    nlp.extend(plg);
    const doc = nlp('seventh millenium. white collar');
    console.log(doc.syllables());
    this.ctx = new AudioContext();
    const buffer = await this.loadFromURL(
      'audio/say_children_what_does_it_all_mean_la_guardia.wav',
    );
    this.analyzeAudio(buffer);
  }

  // Based on: https://github.com/meyda/meyda/issues/419
  analyzeAudio(buffer) {
    const mono_channel = buffer.getChannelData(0);
    const buffer_size = 2048;
    Meyda.bufferSize = buffer_size;

    const num_chunks = Math.floor(mono_channel.length / buffer_size);
    const length_per_chunk =
      mono_channel.length / audio_buffer.sampleRate / num_chunks; //in secs
    console.log(`${length_per_chunk} seconds per chunk`);

    const data_chunks = [];
    for (let i = 0; i < num_chunks; i += 1) {
      const chunk = mono_channel.slice(i * buffer_size, (i + 1) * buffer_size);
      const result = Meyda.extract('amplitudeSpectrum', chunk);
      data_chunks.push(result);
    }
    console.log(data_chunks);
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
