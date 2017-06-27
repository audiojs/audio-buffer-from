'use strict'

const t = require('tape')
const ndarray = require('ndarray')
const ndsamples = require('ndsamples')
const createBuffer = require('./')

t('from ndarray', t => {
	let a = ndarray(new Float32Array([0, 1, 1, 0]), [2, 2])

	let buf = createBuffer(a, {sampleRate: 48000})

	t.equal(buf.length, 2)
	t.equal(buf.numberOfChannels, 2)
	t.equal(buf.sampleRate, 48000)
	t.end()
})

t('from ndsamples', t => {
	let data = [
		0, 0.5,
		-0.5, 0,
		1, -1,
		-1, 1
	]
	let shape = [4, 2]
	let format = {
		sampleRate: 48000
	}
	let samples = ndsamples({
		data: data,
		shape: shape,
		format: format
	})

	let buf = createBuffer(samples)

	t.equal(buf.length, 4)
	t.equal(buf.numberOfChannels, 2)
	t.equal(buf.sampleRate, 48000)
	t.end()
})

t('from float32 arraybuffer', t => {
	let floats = new Float32Array([0, 1, 1, 0])

	let buf = createBuffer(floats.buffer, {format: 'float32', channels: 2})

	t.equal(buf.length, 2)
	t.deepEqual(buf.getChannelData(0), [0, 1])

	t.end()
})

t('from float64 arraybuffer', t => {
	let floats = new Float64Array([0, 1, 1, -1, 0, 1])

	let buf = createBuffer(floats.buffer, {format: 'float64', channels: 2})

	t.equal(buf.length, 3)
	t.deepEqual(buf.getChannelData(1), [-1, 0, 1])

	t.end()
})

t('from uint8 arraybuffer', t => {
	let ints = new Uint8Array([0, 255, 0, 255])
	let buf2 = createBuffer(ints.buffer, {format: 'uint8 interleaved stereo'})

	t.deepEqual(buf2.getChannelData(0), [-1, -1])
	t.deepEqual(buf2.getChannelData(1), [1, 1])
	t.equal(buf2.length, 2)
	t.equal(buf2.numberOfChannels, 2)

	t.end()
})

t('from int8 arraybuffer', t => {
	let ints = new Int8Array([-128, 127, -128, 127])
	let buf = createBuffer(ints, 'interleaved 96000')

	t.equal(buf.numberOfChannels, 2)
	t.equal(buf.length, 2)
	t.deepEqual(buf.getChannelData(0), [-1, -1])
	t.deepEqual(buf.getChannelData(1), [1, 1])
	t.equal(buf.sampleRate, 96000)

	t.end()
})


t('from buffer')
t('from array with numbers')
t('from array with channels')
t('from array with float32 channels')
t('from float32 array')
t('from uint8 array')
t('from interleaved')
t('from empty')
t('from number')
t('from audiobuffer')
t('from object', t => {
	//numberOfChannels, channelCount, channels
})
t('from dataURI')
t('from base64')
t('contradicting options')
