var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/dct/src/dct.js
var require_dct = __commonJS({
  "node_modules/dct/src/dct.js"(exports, module) {
    var cosMap = null;
    var memoizeCosines = function(N) {
      cosMap = cosMap || {};
      cosMap[N] = new Array(N * N);
      var PI_N = Math.PI / N;
      for (var k = 0; k < N; k++) {
        for (var n = 0; n < N; n++) {
          cosMap[N][n + k * N] = Math.cos(PI_N * (n + 0.5) * k);
        }
      }
    };
    function dct2(signal, scale) {
      var L = signal.length;
      scale = scale || 2;
      if (!cosMap || !cosMap[L]) memoizeCosines(L);
      var coefficients = signal.map(function() {
        return 0;
      });
      return coefficients.map(function(__, ix) {
        return scale * signal.reduce(function(prev, cur, ix_, arr) {
          return prev + cur * cosMap[L][ix_ + ix * L];
        }, 0);
      });
    }
    module.exports = dct2;
  }
});

// node_modules/dct/index.js
var require_dct2 = __commonJS({
  "node_modules/dct/index.js"(exports, module) {
    module.exports = require_dct();
  }
});

// node_modules/fftjs/dist/utils.js
var require_utils = __commonJS({
  "node_modules/fftjs/dist/utils.js"(exports, module) {
    "use strict";
    function _toConsumableArray(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
          arr2[i] = arr[i];
        }
        return arr2;
      } else {
        return Array.from(arr);
      }
    }
    var memoizedReversal = {};
    var memoizedZeroBuffers = {};
    var constructComplexArray = function constructComplexArray2(signal) {
      var complexSignal = {};
      complexSignal.real = signal.real === void 0 ? signal.slice() : signal.real.slice();
      var bufferSize = complexSignal.real.length;
      if (memoizedZeroBuffers[bufferSize] === void 0) {
        memoizedZeroBuffers[bufferSize] = Array.apply(null, Array(bufferSize)).map(Number.prototype.valueOf, 0);
      }
      complexSignal.imag = memoizedZeroBuffers[bufferSize].slice();
      return complexSignal;
    };
    var bitReverseArray = function bitReverseArray2(N) {
      if (memoizedReversal[N] === void 0) {
        var maxBinaryLength = (N - 1).toString(2).length;
        var templateBinary = "0".repeat(maxBinaryLength);
        var reversed = {};
        for (var n = 0; n < N; n++) {
          var currBinary = n.toString(2);
          currBinary = templateBinary.substr(currBinary.length) + currBinary;
          currBinary = [].concat(_toConsumableArray(currBinary)).reverse().join("");
          reversed[n] = parseInt(currBinary, 2);
        }
        memoizedReversal[N] = reversed;
      }
      return memoizedReversal[N];
    };
    var multiply = function multiply2(a, b) {
      return {
        "real": a.real * b.real - a.imag * b.imag,
        "imag": a.real * b.imag + a.imag * b.real
      };
    };
    var add = function add2(a, b) {
      return {
        "real": a.real + b.real,
        "imag": a.imag + b.imag
      };
    };
    var subtract = function subtract2(a, b) {
      return {
        "real": a.real - b.real,
        "imag": a.imag - b.imag
      };
    };
    var euler = function euler2(kn, N) {
      var x2 = -2 * Math.PI * kn / N;
      return { "real": Math.cos(x2), "imag": Math.sin(x2) };
    };
    var conj = function conj2(a) {
      a.imag *= -1;
      return a;
    };
    module.exports = {
      bitReverseArray,
      multiply,
      add,
      subtract,
      euler,
      conj,
      constructComplexArray
    };
  }
});

// node_modules/fftjs/dist/fft.js
var require_fft = __commonJS({
  "node_modules/fftjs/dist/fft.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var fft2 = function fft3(signal) {
      var complexSignal = {};
      if (signal.real === void 0 || signal.imag === void 0) {
        complexSignal = utils.constructComplexArray(signal);
      } else {
        complexSignal.real = signal.real.slice();
        complexSignal.imag = signal.imag.slice();
      }
      var N = complexSignal.real.length;
      var logN = Math.log2(N);
      if (Math.round(logN) != logN) throw new Error("Input size must be a power of 2.");
      if (complexSignal.real.length != complexSignal.imag.length) {
        throw new Error("Real and imaginary components must have the same length.");
      }
      var bitReversedIndices = utils.bitReverseArray(N);
      var ordered = {
        "real": [],
        "imag": []
      };
      for (var i = 0; i < N; i++) {
        ordered.real[bitReversedIndices[i]] = complexSignal.real[i];
        ordered.imag[bitReversedIndices[i]] = complexSignal.imag[i];
      }
      for (var _i = 0; _i < N; _i++) {
        complexSignal.real[_i] = ordered.real[_i];
        complexSignal.imag[_i] = ordered.imag[_i];
      }
      for (var n = 1; n <= logN; n++) {
        var currN = Math.pow(2, n);
        for (var k = 0; k < currN / 2; k++) {
          var twiddle = utils.euler(k, currN);
          for (var m = 0; m < N / currN; m++) {
            var currEvenIndex = currN * m + k;
            var currOddIndex = currN * m + k + currN / 2;
            var currEvenIndexSample = {
              "real": complexSignal.real[currEvenIndex],
              "imag": complexSignal.imag[currEvenIndex]
            };
            var currOddIndexSample = {
              "real": complexSignal.real[currOddIndex],
              "imag": complexSignal.imag[currOddIndex]
            };
            var odd = utils.multiply(twiddle, currOddIndexSample);
            var subtractionResult = utils.subtract(currEvenIndexSample, odd);
            complexSignal.real[currOddIndex] = subtractionResult.real;
            complexSignal.imag[currOddIndex] = subtractionResult.imag;
            var additionResult = utils.add(odd, currEvenIndexSample);
            complexSignal.real[currEvenIndex] = additionResult.real;
            complexSignal.imag[currEvenIndex] = additionResult.imag;
          }
        }
      }
      return complexSignal;
    };
    var ifft = function ifft2(signal) {
      if (signal.real === void 0 || signal.imag === void 0) {
        throw new Error("IFFT only accepts a complex input.");
      }
      var N = signal.real.length;
      var complexSignal = {
        "real": [],
        "imag": []
      };
      for (var i = 0; i < N; i++) {
        var currentSample = {
          "real": signal.real[i],
          "imag": signal.imag[i]
        };
        var conjugateSample = utils.conj(currentSample);
        complexSignal.real[i] = conjugateSample.real;
        complexSignal.imag[i] = conjugateSample.imag;
      }
      var X = fft2(complexSignal);
      complexSignal.real = X.real.map(function(val) {
        return val / N;
      });
      complexSignal.imag = X.imag.map(function(val) {
        return val / N;
      });
      return complexSignal;
    };
    module.exports = {
      fft: fft2,
      ifft
    };
  }
});

// node_modules/tslib/tslib.es6.mjs
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

// node_modules/meyda/dist/esm/windowing.js
var windowing_exports = {};
__export(windowing_exports, {
  blackman: () => blackman,
  hamming: () => hamming,
  hanning: () => hanning,
  sine: () => sine
});
function blackman(size) {
  var blackmanBuffer = new Float32Array(size);
  var coeff1 = 2 * Math.PI / (size - 1);
  var coeff2 = 2 * coeff1;
  for (var i = 0; i < size / 2; i++) {
    blackmanBuffer[i] = 0.42 - 0.5 * Math.cos(i * coeff1) + 0.08 * Math.cos(i * coeff2);
  }
  for (var i = Math.ceil(size / 2); i > 0; i--) {
    blackmanBuffer[size - i] = blackmanBuffer[i - 1];
  }
  return blackmanBuffer;
}
function sine(size) {
  var coeff = Math.PI / (size - 1);
  var sineBuffer = new Float32Array(size);
  for (var i = 0; i < size; i++) {
    sineBuffer[i] = Math.sin(coeff * i);
  }
  return sineBuffer;
}
function hanning(size) {
  var hanningBuffer = new Float32Array(size);
  for (var i = 0; i < size; i++) {
    hanningBuffer[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (size - 1));
  }
  return hanningBuffer;
}
function hamming(size) {
  var hammingBuffer = new Float32Array(size);
  for (var i = 0; i < size; i++) {
    hammingBuffer[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * (i / size - 1));
  }
  return hammingBuffer;
}

// node_modules/meyda/dist/esm/utilities.js
var windows = {};
function isPowerOfTwo(num) {
  while (num % 2 === 0 && num > 1) {
    num /= 2;
  }
  return num === 1;
}
function pointwiseBufferMult(a, b) {
  var c = [];
  for (var i = 0; i < Math.min(a.length, b.length); i++) {
    c[i] = a[i] * b[i];
  }
  return c;
}
function applyWindow(signal, windowname) {
  if (windowname !== "rect") {
    if (windowname === "" || !windowname)
      windowname = "hanning";
    if (!windows[windowname])
      windows[windowname] = {};
    if (!windows[windowname][signal.length]) {
      try {
        windows[windowname][signal.length] = windowing_exports[windowname](signal.length);
      } catch (e) {
        throw new Error("Invalid windowing function");
      }
    }
    signal = pointwiseBufferMult(signal, windows[windowname][signal.length]);
  }
  return signal;
}
function createBarkScale(length, sampleRate, bufferSize) {
  var barkScale = new Float32Array(length);
  for (var i = 0; i < barkScale.length; i++) {
    barkScale[i] = i * sampleRate / bufferSize;
    barkScale[i] = 13 * Math.atan(barkScale[i] / 1315.8) + 3.5 * Math.atan(Math.pow(barkScale[i] / 7518, 2));
  }
  return barkScale;
}
function arrayToTyped(t) {
  return Float32Array.from(t);
}
function _melToFreq(melValue) {
  var freqValue = 700 * (Math.exp(melValue / 1125) - 1);
  return freqValue;
}
function _freqToMel(freqValue) {
  var melValue = 1125 * Math.log(1 + freqValue / 700);
  return melValue;
}
function createMelFilterBank(numFilters, sampleRate, bufferSize) {
  var melValues = new Float32Array(numFilters + 2);
  var melValuesInFreq = new Float32Array(numFilters + 2);
  var lowerLimitFreq = 0;
  var upperLimitFreq = sampleRate / 2;
  var lowerLimitMel = _freqToMel(lowerLimitFreq);
  var upperLimitMel = _freqToMel(upperLimitFreq);
  var range = upperLimitMel - lowerLimitMel;
  var valueToAdd = range / (numFilters + 1);
  var fftBinsOfFreq = new Array(numFilters + 2);
  for (var i = 0; i < melValues.length; i++) {
    melValues[i] = i * valueToAdd;
    melValuesInFreq[i] = _melToFreq(melValues[i]);
    fftBinsOfFreq[i] = Math.floor((bufferSize + 1) * melValuesInFreq[i] / sampleRate);
  }
  var filterBank = new Array(numFilters);
  for (var j = 0; j < filterBank.length; j++) {
    filterBank[j] = new Array(bufferSize / 2 + 1).fill(0);
    for (var i = fftBinsOfFreq[j]; i < fftBinsOfFreq[j + 1]; i++) {
      filterBank[j][i] = (i - fftBinsOfFreq[j]) / (fftBinsOfFreq[j + 1] - fftBinsOfFreq[j]);
    }
    for (var i = fftBinsOfFreq[j + 1]; i < fftBinsOfFreq[j + 2]; i++) {
      filterBank[j][i] = (fftBinsOfFreq[j + 2] - i) / (fftBinsOfFreq[j + 2] - fftBinsOfFreq[j + 1]);
    }
  }
  return filterBank;
}
function hzToOctaves(freq, A440) {
  return Math.log2(16 * freq / A440);
}
function normalizeByColumn(a) {
  var emptyRow = a[0].map(function() {
    return 0;
  });
  var colDenominators = a.reduce(function(acc, row) {
    row.forEach(function(cell, j) {
      acc[j] += Math.pow(cell, 2);
    });
    return acc;
  }, emptyRow).map(Math.sqrt);
  return a.map(function(row, i) {
    return row.map(function(v, j) {
      return v / (colDenominators[j] || 1);
    });
  });
}
function createChromaFilterBank(numFilters, sampleRate, bufferSize, centerOctave, octaveWidth, baseC, A440) {
  if (centerOctave === void 0) {
    centerOctave = 5;
  }
  if (octaveWidth === void 0) {
    octaveWidth = 2;
  }
  if (baseC === void 0) {
    baseC = true;
  }
  if (A440 === void 0) {
    A440 = 440;
  }
  var numOutputBins = Math.floor(bufferSize / 2) + 1;
  var frequencyBins = new Array(bufferSize).fill(0).map(function(_, i) {
    return numFilters * hzToOctaves(sampleRate * i / bufferSize, A440);
  });
  frequencyBins[0] = frequencyBins[1] - 1.5 * numFilters;
  var binWidthBins = frequencyBins.slice(1).map(function(v, i) {
    return Math.max(v - frequencyBins[i]);
  }, 1).concat([1]);
  var halfNumFilters = Math.round(numFilters / 2);
  var filterPeaks = new Array(numFilters).fill(0).map(function(_, i) {
    return frequencyBins.map(function(frq) {
      return (10 * numFilters + halfNumFilters + frq - i) % numFilters - halfNumFilters;
    });
  });
  var weights = filterPeaks.map(function(row, i) {
    return row.map(function(_, j) {
      return Math.exp(-0.5 * Math.pow(2 * filterPeaks[i][j] / binWidthBins[j], 2));
    });
  });
  weights = normalizeByColumn(weights);
  if (octaveWidth) {
    var octaveWeights = frequencyBins.map(function(v) {
      return Math.exp(-0.5 * Math.pow((v / numFilters - centerOctave) / octaveWidth, 2));
    });
    weights = weights.map(function(row) {
      return row.map(function(cell, j) {
        return cell * octaveWeights[j];
      });
    });
  }
  if (baseC) {
    weights = __spreadArray(__spreadArray([], weights.slice(3), true), weights.slice(0, 3), true);
  }
  return weights.map(function(row) {
    return row.slice(0, numOutputBins);
  });
}
function frame(buffer2, frameLength, hopLength) {
  if (buffer2.length < frameLength) {
    throw new Error("Buffer is too short for frame length");
  }
  if (hopLength < 1) {
    throw new Error("Hop length cannot be less that 1");
  }
  if (frameLength < 1) {
    throw new Error("Frame length cannot be less that 1");
  }
  var numFrames = 1 + Math.floor((buffer2.length - frameLength) / hopLength);
  return new Array(numFrames).fill(0).map(function(_, i) {
    return buffer2.slice(i * hopLength, i * hopLength + frameLength);
  });
}

// node_modules/meyda/dist/esm/featureExtractors.js
var featureExtractors_exports = {};
__export(featureExtractors_exports, {
  amplitudeSpectrum: () => amplitudeSpectrum,
  buffer: () => buffer,
  chroma: () => chroma_default,
  complexSpectrum: () => complexSpectrum,
  energy: () => energy_default,
  loudness: () => loudness_default,
  melBands: () => melBands_default,
  mfcc: () => mfcc_default,
  perceptualSharpness: () => perceptualSharpness_default,
  perceptualSpread: () => perceptualSpread_default,
  powerSpectrum: () => powerSpectrum_default,
  rms: () => rms_default,
  spectralCentroid: () => spectralCentroid_default,
  spectralCrest: () => spectralCrest_default,
  spectralFlatness: () => spectralFlatness_default,
  spectralFlux: () => spectralFlux_default,
  spectralKurtosis: () => spectralKurtosis_default,
  spectralRolloff: () => spectralRolloff_default,
  spectralSkewness: () => spectralSkewness_default,
  spectralSlope: () => spectralSlope_default,
  spectralSpread: () => spectralSpread_default,
  zcr: () => zcr_default
});

// node_modules/meyda/dist/esm/extractors/rms.js
function rms_default(_a) {
  var signal = _a.signal;
  if (typeof signal !== "object") {
    throw new TypeError();
  }
  var rms = 0;
  for (var i = 0; i < signal.length; i++) {
    rms += Math.pow(signal[i], 2);
  }
  rms = rms / signal.length;
  rms = Math.sqrt(rms);
  return rms;
}

// node_modules/meyda/dist/esm/extractors/energy.js
function energy_default(_a) {
  var signal = _a.signal;
  if (typeof signal !== "object") {
    throw new TypeError();
  }
  var energy = 0;
  for (var i = 0; i < signal.length; i++) {
    energy += Math.pow(Math.abs(signal[i]), 2);
  }
  return energy;
}

// node_modules/meyda/dist/esm/extractors/spectralSlope.js
function spectralSlope_default(_a) {
  var ampSpectrum = _a.ampSpectrum, sampleRate = _a.sampleRate, bufferSize = _a.bufferSize;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError();
  }
  var ampSum = 0;
  var freqSum = 0;
  var freqs = new Float32Array(ampSpectrum.length);
  var powFreqSum = 0;
  var ampFreqSum = 0;
  for (var i = 0; i < ampSpectrum.length; i++) {
    ampSum += ampSpectrum[i];
    var curFreq = i * sampleRate / bufferSize;
    freqs[i] = curFreq;
    powFreqSum += curFreq * curFreq;
    freqSum += curFreq;
    ampFreqSum += curFreq * ampSpectrum[i];
  }
  return (ampSpectrum.length * ampFreqSum - freqSum * ampSum) / (ampSum * (powFreqSum - Math.pow(freqSum, 2)));
}

// node_modules/meyda/dist/esm/extractors/extractorUtilities.js
function mu(i, amplitudeSpect) {
  var numerator = 0;
  var denominator = 0;
  for (var k = 0; k < amplitudeSpect.length; k++) {
    numerator += Math.pow(k, i) * Math.abs(amplitudeSpect[k]);
    denominator += amplitudeSpect[k];
  }
  return numerator / denominator;
}

// node_modules/meyda/dist/esm/extractors/spectralCentroid.js
function spectralCentroid_default(_a) {
  var ampSpectrum = _a.ampSpectrum;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError();
  }
  return mu(1, ampSpectrum);
}

// node_modules/meyda/dist/esm/extractors/spectralRolloff.js
function spectralRolloff_default(_a) {
  var ampSpectrum = _a.ampSpectrum, sampleRate = _a.sampleRate;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError();
  }
  var ampspec = ampSpectrum;
  var nyqBin = sampleRate / (2 * (ampspec.length - 1));
  var ec = 0;
  for (var i = 0; i < ampspec.length; i++) {
    ec += ampspec[i];
  }
  var threshold = 0.99 * ec;
  var n = ampspec.length - 1;
  while (ec > threshold && n >= 0) {
    ec -= ampspec[n];
    --n;
  }
  return (n + 1) * nyqBin;
}

// node_modules/meyda/dist/esm/extractors/spectralFlatness.js
function spectralFlatness_default(_a) {
  var ampSpectrum = _a.ampSpectrum;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError();
  }
  var numerator = 0;
  var denominator = 0;
  for (var i = 0; i < ampSpectrum.length; i++) {
    numerator += Math.log(ampSpectrum[i]);
    denominator += ampSpectrum[i];
  }
  return Math.exp(numerator / ampSpectrum.length) * ampSpectrum.length / denominator;
}

// node_modules/meyda/dist/esm/extractors/spectralSpread.js
function spectralSpread_default(_a) {
  var ampSpectrum = _a.ampSpectrum;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError();
  }
  return Math.sqrt(mu(2, ampSpectrum) - Math.pow(mu(1, ampSpectrum), 2));
}

// node_modules/meyda/dist/esm/extractors/spectralSkewness.js
function spectralSkewness_default(_a) {
  var ampSpectrum = _a.ampSpectrum;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError();
  }
  var mu1 = mu(1, ampSpectrum);
  var mu2 = mu(2, ampSpectrum);
  var mu3 = mu(3, ampSpectrum);
  var numerator = 2 * Math.pow(mu1, 3) - 3 * mu1 * mu2 + mu3;
  var denominator = Math.pow(Math.sqrt(mu2 - Math.pow(mu1, 2)), 3);
  return numerator / denominator;
}

// node_modules/meyda/dist/esm/extractors/spectralKurtosis.js
function spectralKurtosis_default(_a) {
  var ampSpectrum = _a.ampSpectrum;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError();
  }
  var ampspec = ampSpectrum;
  var mu1 = mu(1, ampspec);
  var mu2 = mu(2, ampspec);
  var mu3 = mu(3, ampspec);
  var mu4 = mu(4, ampspec);
  var numerator = -3 * Math.pow(mu1, 4) + 6 * mu1 * mu2 - 4 * mu1 * mu3 + mu4;
  var denominator = Math.pow(Math.sqrt(mu2 - Math.pow(mu1, 2)), 4);
  return numerator / denominator;
}

// node_modules/meyda/dist/esm/extractors/zcr.js
function zcr_default(_a) {
  var signal = _a.signal;
  if (typeof signal !== "object") {
    throw new TypeError();
  }
  var zcr = 0;
  for (var i = 1; i < signal.length; i++) {
    if (signal[i - 1] >= 0 && signal[i] < 0 || signal[i - 1] < 0 && signal[i] >= 0) {
      zcr++;
    }
  }
  return zcr;
}

// node_modules/meyda/dist/esm/extractors/loudness.js
function loudness_default(_a) {
  var ampSpectrum = _a.ampSpectrum, barkScale = _a.barkScale, _b = _a.numberOfBarkBands, numberOfBarkBands = _b === void 0 ? 24 : _b;
  if (typeof ampSpectrum !== "object" || typeof barkScale !== "object") {
    throw new TypeError();
  }
  var NUM_BARK_BANDS = numberOfBarkBands;
  var specific = new Float32Array(NUM_BARK_BANDS);
  var total = 0;
  var normalisedSpectrum = ampSpectrum;
  var bbLimits = new Int32Array(NUM_BARK_BANDS + 1);
  bbLimits[0] = 0;
  var currentBandEnd = barkScale[normalisedSpectrum.length - 1] / NUM_BARK_BANDS;
  var currentBand = 1;
  for (var i = 0; i < normalisedSpectrum.length; i++) {
    while (barkScale[i] > currentBandEnd) {
      bbLimits[currentBand++] = i;
      currentBandEnd = currentBand * barkScale[normalisedSpectrum.length - 1] / NUM_BARK_BANDS;
    }
  }
  bbLimits[NUM_BARK_BANDS] = normalisedSpectrum.length - 1;
  for (var i = 0; i < NUM_BARK_BANDS; i++) {
    var sum = 0;
    for (var j = bbLimits[i]; j < bbLimits[i + 1]; j++) {
      sum += normalisedSpectrum[j];
    }
    specific[i] = Math.pow(sum, 0.23);
  }
  for (var i = 0; i < specific.length; i++) {
    total += specific[i];
  }
  return {
    specific,
    total
  };
}

// node_modules/meyda/dist/esm/extractors/perceptualSpread.js
function perceptualSpread_default(_a) {
  var ampSpectrum = _a.ampSpectrum, barkScale = _a.barkScale;
  var loudnessValue = loudness_default({ ampSpectrum, barkScale });
  var max = 0;
  for (var i = 0; i < loudnessValue.specific.length; i++) {
    if (loudnessValue.specific[i] > max) {
      max = loudnessValue.specific[i];
    }
  }
  var spread = Math.pow((loudnessValue.total - max) / loudnessValue.total, 2);
  return spread;
}

// node_modules/meyda/dist/esm/extractors/perceptualSharpness.js
function perceptualSharpness_default(_a) {
  var ampSpectrum = _a.ampSpectrum, barkScale = _a.barkScale;
  var loudnessValue = loudness_default({ ampSpectrum, barkScale });
  var spec = loudnessValue.specific;
  var output = 0;
  for (var i = 0; i < spec.length; i++) {
    if (i < 15) {
      output += (i + 1) * spec[i + 1];
    } else {
      output += 0.066 * Math.exp(0.171 * (i + 1));
    }
  }
  output *= 0.11 / loudnessValue.total;
  return output;
}

// node_modules/meyda/dist/esm/extractors/powerSpectrum.js
function powerSpectrum_default(_a) {
  var ampSpectrum = _a.ampSpectrum;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError();
  }
  var powerSpectrum = new Float32Array(ampSpectrum.length);
  for (var i = 0; i < powerSpectrum.length; i++) {
    powerSpectrum[i] = Math.pow(ampSpectrum[i], 2);
  }
  return powerSpectrum;
}

// node_modules/meyda/dist/esm/extractors/melBands.js
function melBands_default(_a) {
  var ampSpectrum = _a.ampSpectrum, melFilterBank = _a.melFilterBank, bufferSize = _a.bufferSize;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError("Valid ampSpectrum is required to generate melBands");
  }
  if (typeof melFilterBank !== "object") {
    throw new TypeError("Valid melFilterBank is required to generate melBands");
  }
  var powSpec = powerSpectrum_default({ ampSpectrum });
  var numFilters = melFilterBank.length;
  var filtered = Array(numFilters);
  var loggedMelBands = new Float32Array(numFilters);
  for (var i = 0; i < loggedMelBands.length; i++) {
    filtered[i] = new Float32Array(bufferSize / 2);
    loggedMelBands[i] = 0;
    for (var j = 0; j < bufferSize / 2; j++) {
      filtered[i][j] = melFilterBank[i][j] * powSpec[j];
      loggedMelBands[i] += filtered[i][j];
    }
    loggedMelBands[i] = Math.log(loggedMelBands[i] + 1);
  }
  return Array.prototype.slice.call(loggedMelBands);
}

// node_modules/meyda/dist/esm/extractors/mfcc.js
var import_dct = __toESM(require_dct2());
function mfcc_default(_a) {
  var ampSpectrum = _a.ampSpectrum, melFilterBank = _a.melFilterBank, numberOfMFCCCoefficients = _a.numberOfMFCCCoefficients, bufferSize = _a.bufferSize;
  var _numberOfMFCCCoefficients = Math.min(40, Math.max(1, numberOfMFCCCoefficients || 13));
  var numFilters = melFilterBank.length;
  if (numFilters < _numberOfMFCCCoefficients) {
    throw new Error("Insufficient filter bank for requested number of coefficients");
  }
  var loggedMelBandsArray = melBands_default({
    ampSpectrum,
    melFilterBank,
    bufferSize
  });
  var mfccs = (0, import_dct.default)(loggedMelBandsArray).slice(0, _numberOfMFCCCoefficients);
  return mfccs;
}

// node_modules/meyda/dist/esm/extractors/chroma.js
function chroma_default(_a) {
  var ampSpectrum = _a.ampSpectrum, chromaFilterBank = _a.chromaFilterBank;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError("Valid ampSpectrum is required to generate chroma");
  }
  if (typeof chromaFilterBank !== "object") {
    throw new TypeError("Valid chromaFilterBank is required to generate chroma");
  }
  var chromagram = chromaFilterBank.map(function(row, i) {
    return ampSpectrum.reduce(function(acc, v, j) {
      return acc + v * row[j];
    }, 0);
  });
  var maxVal = Math.max.apply(Math, chromagram);
  return maxVal ? chromagram.map(function(v) {
    return v / maxVal;
  }) : chromagram;
}

// node_modules/meyda/dist/esm/extractors/spectralFlux.js
function spectralFlux_default(_a) {
  var signal = _a.signal, previousSignal = _a.previousSignal, bufferSize = _a.bufferSize;
  if (typeof signal !== "object" || typeof previousSignal != "object") {
    throw new TypeError();
  }
  var sf = 0;
  for (var i = -(bufferSize / 2); i < signal.length / 2 - 1; i++) {
    x = Math.abs(signal[i]) - Math.abs(previousSignal[i]);
    sf += (x + Math.abs(x)) / 2;
  }
  return sf;
}

// node_modules/meyda/dist/esm/extractors/spectralCrest.js
function spectralCrest_default(_a) {
  var ampSpectrum = _a.ampSpectrum;
  if (typeof ampSpectrum !== "object") {
    throw new TypeError();
  }
  var rms = 0;
  var peak = -Infinity;
  ampSpectrum.forEach(function(x2) {
    rms += Math.pow(x2, 2);
    peak = x2 > peak ? x2 : peak;
  });
  rms = rms / ampSpectrum.length;
  rms = Math.sqrt(rms);
  return peak / rms;
}

// node_modules/meyda/dist/esm/featureExtractors.js
var buffer = function(args) {
  return args.signal;
};
var complexSpectrum = function(args) {
  return args.complexSpectrum;
};
var amplitudeSpectrum = function(args) {
  return args.ampSpectrum;
};

// node_modules/meyda/dist/esm/main.js
var import_fftjs = __toESM(require_fft());

// node_modules/meyda/dist/esm/meyda-wa.js
var MeydaAnalyzer = (
  /** @class */
  function() {
    function MeydaAnalyzer2(options, _this) {
      var _this_1 = this;
      this._m = _this;
      if (!options.audioContext) {
        throw this._m.errors.noAC;
      } else if (options.bufferSize && !isPowerOfTwo(options.bufferSize)) {
        throw this._m._errors.notPow2;
      } else if (!options.source) {
        throw this._m._errors.noSource;
      }
      this._m.audioContext = options.audioContext;
      this._m.bufferSize = options.bufferSize || this._m.bufferSize || 256;
      this._m.hopSize = options.hopSize || this._m.hopSize || this._m.bufferSize;
      this._m.sampleRate = options.sampleRate || this._m.audioContext.sampleRate || 44100;
      this._m.callback = options.callback;
      this._m.windowingFunction = options.windowingFunction || "hanning";
      this._m.featureExtractors = featureExtractors_exports;
      this._m.EXTRACTION_STARTED = options.startImmediately || false;
      this._m.channel = typeof options.channel === "number" ? options.channel : 0;
      this._m.inputs = options.inputs || 1;
      this._m.outputs = options.outputs || 1;
      this._m.numberOfMFCCCoefficients = options.numberOfMFCCCoefficients || this._m.numberOfMFCCCoefficients || 13;
      this._m.numberOfBarkBands = options.numberOfBarkBands || this._m.numberOfBarkBands || 24;
      this._m.spn = this._m.audioContext.createScriptProcessor(this._m.bufferSize, this._m.inputs, this._m.outputs);
      this._m.spn.connect(this._m.audioContext.destination);
      this._m._featuresToExtract = options.featureExtractors || [];
      this._m.barkScale = createBarkScale(this._m.bufferSize, this._m.sampleRate, this._m.bufferSize);
      this._m.melFilterBank = createMelFilterBank(Math.max(this._m.melBands, this._m.numberOfMFCCCoefficients), this._m.sampleRate, this._m.bufferSize);
      this._m.inputData = null;
      this._m.previousInputData = null;
      this._m.frame = null;
      this._m.previousFrame = null;
      this.setSource(options.source);
      this._m.spn.onaudioprocess = function(e) {
        var buffer2;
        if (_this_1._m.inputData !== null) {
          _this_1._m.previousInputData = _this_1._m.inputData;
        }
        _this_1._m.inputData = e.inputBuffer.getChannelData(_this_1._m.channel);
        if (!_this_1._m.previousInputData) {
          buffer2 = _this_1._m.inputData;
        } else {
          buffer2 = new Float32Array(_this_1._m.previousInputData.length + _this_1._m.inputData.length - _this_1._m.hopSize);
          buffer2.set(_this_1._m.previousInputData.slice(_this_1._m.hopSize));
          buffer2.set(_this_1._m.inputData, _this_1._m.previousInputData.length - _this_1._m.hopSize);
        }
        var frames = frame(buffer2, _this_1._m.bufferSize, _this_1._m.hopSize);
        frames.forEach(function(f) {
          _this_1._m.frame = f;
          var features = _this_1._m.extract(_this_1._m._featuresToExtract, _this_1._m.frame, _this_1._m.previousFrame);
          if (typeof _this_1._m.callback === "function" && _this_1._m.EXTRACTION_STARTED) {
            _this_1._m.callback(features);
          }
          _this_1._m.previousFrame = _this_1._m.frame;
        });
      };
    }
    MeydaAnalyzer2.prototype.start = function(features) {
      this._m._featuresToExtract = features || this._m._featuresToExtract;
      this._m.EXTRACTION_STARTED = true;
    };
    MeydaAnalyzer2.prototype.stop = function() {
      this._m.EXTRACTION_STARTED = false;
    };
    MeydaAnalyzer2.prototype.setSource = function(source) {
      this._m.source && this._m.source.disconnect(this._m.spn);
      this._m.source = source;
      this._m.source.connect(this._m.spn);
    };
    MeydaAnalyzer2.prototype.setChannel = function(channel) {
      if (channel <= this._m.inputs) {
        this._m.channel = channel;
      } else {
        console.error("Channel ".concat(channel, " does not exist. Make sure you've provided a value for 'inputs' that is greater than ").concat(channel, " when instantiating the MeydaAnalyzer"));
      }
    };
    MeydaAnalyzer2.prototype.get = function(features) {
      if (this._m.inputData) {
        return this._m.extract(features || this._m._featuresToExtract, this._m.inputData, this._m.previousInputData);
      } else {
        return null;
      }
    };
    return MeydaAnalyzer2;
  }()
);

// node_modules/meyda/dist/esm/main.js
var Meyda = {
  audioContext: null,
  spn: null,
  bufferSize: 512,
  sampleRate: 44100,
  melBands: 26,
  chromaBands: 12,
  callback: null,
  windowingFunction: "hanning",
  featureExtractors: featureExtractors_exports,
  EXTRACTION_STARTED: false,
  numberOfMFCCCoefficients: 13,
  numberOfBarkBands: 24,
  _featuresToExtract: [],
  windowing: applyWindow,
  /** @hidden */
  _errors: {
    notPow2: new Error("Meyda: Buffer size must be a power of 2, e.g. 64 or 512"),
    featureUndef: new Error("Meyda: No features defined."),
    invalidFeatureFmt: new Error("Meyda: Invalid feature format"),
    invalidInput: new Error("Meyda: Invalid input."),
    noAC: new Error("Meyda: No AudioContext specified."),
    noSource: new Error("Meyda: No source node specified.")
  },
  /**
   * @summary
   * Create a MeydaAnalyzer
   *
   * A factory function for creating a MeydaAnalyzer, the interface for using
   * Meyda in the context of Web Audio.
   *
   * ```javascript
   * const analyzer = Meyda.createMeydaAnalyzer({
   *   "audioContext": audioContext,
   *   "source": source,
   *   "bufferSize": 512,
   *   "featureExtractors": ["rms"],
   *   "inputs": 2,
   *   "callback": features => {
   *     levelRangeElement.value = features.rms;
   *   }
   * });
   * ```
   */
  createMeydaAnalyzer,
  /**
   * List available audio feature extractors. Return format provides the key to
   * be used in selecting the extractor in the extract methods
   */
  listAvailableFeatureExtractors,
  /**
   * Extract an audio feature from a buffer
   *
   * Unless `meyda.windowingFunction` is set otherwise, `extract` will
   * internally apply a hanning window to the buffer prior to conversion into
   * the frequency domain.
   *
   * ```javascript
   * meyda.bufferSize = 2048;
   * const features = meyda.extract(['zcr', 'spectralCentroid'], signal);
   * ```
   */
  extract: function(feature, signal, previousSignal) {
    var _this = this;
    if (!signal)
      throw this._errors.invalidInput;
    else if (typeof signal != "object")
      throw this._errors.invalidInput;
    else if (!feature)
      throw this._errors.featureUndef;
    else if (!isPowerOfTwo(signal.length))
      throw this._errors.notPow2;
    if (typeof this.barkScale == "undefined" || this.barkScale.length != this.bufferSize) {
      this.barkScale = createBarkScale(this.bufferSize, this.sampleRate, this.bufferSize);
    }
    if (typeof this.melFilterBank == "undefined" || this.barkScale.length != this.bufferSize || this.melFilterBank.length != this.melBands) {
      this.melFilterBank = createMelFilterBank(Math.max(this.melBands, this.numberOfMFCCCoefficients), this.sampleRate, this.bufferSize);
    }
    if (typeof this.chromaFilterBank == "undefined" || this.chromaFilterBank.length != this.chromaBands) {
      this.chromaFilterBank = createChromaFilterBank(this.chromaBands, this.sampleRate, this.bufferSize);
    }
    if ("buffer" in signal && typeof signal.buffer == "undefined") {
      this.signal = arrayToTyped(signal);
    } else {
      this.signal = signal;
    }
    var preparedSignal = prepareSignalWithSpectrum(signal, this.windowingFunction, this.bufferSize);
    this.signal = preparedSignal.windowedSignal;
    this.complexSpectrum = preparedSignal.complexSpectrum;
    this.ampSpectrum = preparedSignal.ampSpectrum;
    if (previousSignal) {
      var preparedSignal_1 = prepareSignalWithSpectrum(previousSignal, this.windowingFunction, this.bufferSize);
      this.previousSignal = preparedSignal_1.windowedSignal;
      this.previousComplexSpectrum = preparedSignal_1.complexSpectrum;
      this.previousAmpSpectrum = preparedSignal_1.ampSpectrum;
    }
    var extract = function(feature2) {
      return _this.featureExtractors[feature2]({
        ampSpectrum: _this.ampSpectrum,
        chromaFilterBank: _this.chromaFilterBank,
        complexSpectrum: _this.complexSpectrum,
        signal: _this.signal,
        bufferSize: _this.bufferSize,
        sampleRate: _this.sampleRate,
        barkScale: _this.barkScale,
        melFilterBank: _this.melFilterBank,
        previousSignal: _this.previousSignal,
        previousAmpSpectrum: _this.previousAmpSpectrum,
        previousComplexSpectrum: _this.previousComplexSpectrum,
        numberOfMFCCCoefficients: _this.numberOfMFCCCoefficients,
        numberOfBarkBands: _this.numberOfBarkBands
      });
    };
    if (typeof feature === "object") {
      return feature.reduce(function(acc, el) {
        var _a;
        return Object.assign({}, acc, (_a = {}, _a[el] = extract(el), _a));
      }, {});
    } else if (typeof feature === "string") {
      return extract(feature);
    } else {
      throw this._errors.invalidFeatureFmt;
    }
  }
};
var prepareSignalWithSpectrum = function(signal, windowingFunction, bufferSize) {
  var preparedSignal = {};
  if (typeof signal.buffer == "undefined") {
    preparedSignal.signal = arrayToTyped(signal);
  } else {
    preparedSignal.signal = signal;
  }
  preparedSignal.windowedSignal = applyWindow(preparedSignal.signal, windowingFunction);
  preparedSignal.complexSpectrum = (0, import_fftjs.fft)(preparedSignal.windowedSignal);
  preparedSignal.ampSpectrum = new Float32Array(bufferSize / 2);
  for (var i = 0; i < bufferSize / 2; i++) {
    preparedSignal.ampSpectrum[i] = Math.sqrt(Math.pow(preparedSignal.complexSpectrum.real[i], 2) + Math.pow(preparedSignal.complexSpectrum.imag[i], 2));
  }
  return preparedSignal;
};
var main_default = Meyda;
function listAvailableFeatureExtractors() {
  return Object.keys(this.featureExtractors);
}
function createMeydaAnalyzer(options) {
  return new MeydaAnalyzer(options, Object.assign({}, Meyda));
}
if (typeof window !== "undefined")
  window.Meyda = Meyda;
export {
  main_default as default
};
