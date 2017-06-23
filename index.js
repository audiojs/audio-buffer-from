/**
 * @module  audio-dtype
 */

'use strict'

var AudioBuffer = require('audio-buffer')
var isAudioBuffer = require('is-audio-buffer')
var isBuffer = require('is-buffer')
var isObj = require('is-plain-obj')
var getContext = require('audio-context')

module.exports = function createBuffer (source, options) {

	var length, data, channels, sampleRate, context

	//src, channels
	if (typeof options === 'number') {
		options = {channels: options}
	}
	//{}
	else if (isObj(source)) {
		options = source
		source = null
	}
	//src
	else if (options == null) {
		options = {}
	}

	channels = options.channels || 1
	sampleRate = options.sampleRate || 44100

	//empty buffer
	if (!source) {
		length = options.length || 0
	}

	//if audio buffer passed - create fast clone of it
	if (isAudioBuffer(source)) {
		length = source.length
		if (options.channels == null) channels = source.numberOfChannels

		if (source._channelData) {
			data = source._channelData
		}
		else {
			data = []

			//take channel's data
			for (var c = 0, l = channels; c < l; c++) {
				data[c] = source.getChannelData(c)
			}
		}
	}

	//if create(number, channels? rate?) = create new array
	//this is the default WAA-compatible case
	else if (typeof source === 'number') {
		length = source
	}

	//TypedArray, Buffer, DataView etc, ArrayBuffer or plain array
	//NOTE: node 4.x+ detects Buffer as ArrayBuffer view
	else if (ArrayBuffer.isView(source) || source instanceof ArrayBuffer || isBuffer(source) || (Array.isArray(source) && typeof source[0] === 'number')) {
		if (isBuffer(source)) {
			source = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength)
		}
		//convert non-float array to floatArray
		if (!(source instanceof Float32Array)) {
			source = new Float32Array(source);
		}
		length = Math.floor(source.length / channels);
		data = []
		for (var c = 0; c < channels; c++) {
			data[c] = source.subarray(c * length, (c + 1) * length);
		}
	}
	//if array - parse channeled data
	else if (Array.isArray(source)) {
		//if separated source passed already - send sub-arrays to channels
		length = source[0].length;
		data = []
		channels = source.length
		for (var c = 0; c < channels; c++) {
			data[c] = source[c] instanceof Float32Array ? source[c] : new Float32Array(source[c])
		}
	}
	//if ndarray, ndsamples, typedarray or other data-holder passed - redirect plain databuffer
	else if (source.data || source.buffer) {
		if (source.shape) channels = source.shape[1]
		if (source.format) sampleRate = source.format.sampleRate
		if (!channels) channels = source.numberOfChannels || source.channels
		return createBuffer(source.data || source.buffer, {
			channels: channels,
			sampleRate: sampleRate
		});
	}

	//create buffer of proper length
	var audioBuffer = new AudioBuffer(options.context == null ? null : options.context || getContext(), {
		length: length,
		numberOfChannels: channels,
		sampleRate: sampleRate
	})

	//fill channels
	if (data) {
		for (var c = 0; c < channels; c++) {
			audioBuffer.getChannelData(c).set(data[c]);
		}
	}

	return audioBuffer
}
