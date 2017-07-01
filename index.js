/**
 * @module  audio-dtype
 */

'use strict'

var AudioBuffer = require('audio-buffer')
var isAudioBuffer = require('is-audio-buffer')
var isObj = require('is-plain-obj')
var getContext = require('audio-context')
var convert = require('pcm-convert')
var format = require('audio-format')
var str2ab = require('string-to-arraybuffer')

module.exports = function createBuffer (source, options) {

	var length, data, channels, sampleRate, format

	//src, channels
	if (typeof options === 'number') {
		options = {channels: options}
	}
	else if (typeof options === 'string') {
		options = {format: options}
	}
	//{}
	else if (options === undefined) {
		if (isObj(source)) {
			options = source
			source = undefined
		}
		else {
			options = {}
		}
	}

	if (options.dtype) options.format = options.dtype

	//detect options
	channels = options.channels || options.numberOfChannels || options.channelCount
	sampleRate = options.sampleRate || options.rate
	if (options.format) format = getFormat(options.format)

	if (format) {
		if (channels && !format.channels) format.channels = channels
		else if (format.channels && !channels) channels = format.channels
		if (!sampleRate && format.sampleRate) sampleRate = format.sampleRate
	}

	//empty buffer
	if (source == null) {
		if (options.duration != null) {
			if (!sampleRate) sampleRate = 44100
			length = sampleRate*options.duration
		}
		else length = options.length
	}

	//if audio buffer passed - create fast clone of it
	else if (isAudioBuffer(source)) {
		length = source.length
		if (channels == null) channels = source.numberOfChannels
		if (sampleRate == null) sampleRate = source.sampleRate

		if (source._channelData) {
			data = source._channelData.slice(0, channels)
		}
		else {
			data = []

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

	//if array with channels - parse channeled data
	else if (Array.isArray(source) && (Array.isArray(source[0]) || ArrayBuffer.isView(source[0]))) {
		length = source[0].length;
		data = []
		if (!channels) channels = source.length
		for (var c = 0; c < channels; c++) {
			data[c] = source[c] instanceof Float32Array ? source[c] : new Float32Array(source[c])
		}
	}

	//if ndarray, ndsamples, or anything with data
	else if (source.shape && source.data) {
		if (source.shape) channels = source.shape[1]
		if (!sampleRate && source.format) sampleRate = source.format.sampleRate

		return createBuffer(source.data, {
			channels: channels,
			sampleRate: sampleRate
		})
	}

	//TypedArray, Buffer, DataView etc, ArrayBuffer, Array etc.
	//NOTE: node 4.x+ detects Buffer as ArrayBuffer view
	else {
		if (typeof source === 'string') {
			source = str2ab(source)
		}

		if (!format) format = getFormat(source)
		if (!channels) channels = format.channels || 1
		source = convert(source, format, 'float32 planar')

		length = Math.floor(source.length / channels);
		data = []
		for (var c = 0; c < channels; c++) {
			data[c] = source.subarray(c * length, (c + 1) * length);
		}
	}

	//create buffer of proper length
	var audioBuffer = new AudioBuffer((options.context === null || length === 0) ? null : options.context || getContext(), {
		length: length == null ? 1 : length,
		numberOfChannels: channels || 1,
		sampleRate: sampleRate || 44100
	})

	//fill channels
	if (data) {
		for (var c = 0, l = data.length; c < l; c++) {
			audioBuffer.getChannelData(c).set(data[c]);
		}
	}


	return audioBuffer
}


function getFormat (arg) {
	return typeof arg === 'string' ? format.parse(arg) : format.detect(arg)
}
