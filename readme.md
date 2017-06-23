# audio-buffer-from [![Build Status](https://travis-ci.org/audiojs/audio-buffer-from.svg?branch=master)](https://travis-ci.org/audiojs/audio-buffer-from) [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Create [AudioBuffer](https://github.com/audiojs/audio-buffer) from any source.

## Usage

[![$ npm install audio-buffer-from](http://nodei.co/npm/audio-buffer-from.png?mini=true)](http://npmjs.org/package/audio-buffer-from)

```js
var createBuffer = require('audio-buffer-from')

//mono-buffer 1024 samples
var buf = createBuffer(1024)

//stereo-buffer 1024 samples
var buf2 = createBuffer(1024, 2)

//buffer from data with bound audio context
var buf3 = createBuffer(floatArray, {context: audioContext})

//empty 0-length mono buffer
var buf4 = createBuffer()
```

## API

### audioBuffer = createBuffer(source|length, channels|options)

Cre

#### Source

| Type | Interpretation |
|---|---|
| `ndarray` | Create from [ndarray](https://npmjs.org/package/ndarray) instance. The `shape` property is considered as `[length, channels]`. |
| `ndsamples` | Create from [ndsamples](https://npmjs.org/package/ndsamples) instance, similar to ndarray. |

#### Options

| Property | Default | Meaning |
|---|---|---|
