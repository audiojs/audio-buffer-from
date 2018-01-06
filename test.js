'use strict'

const t = require('tape')
const ndarray = require('ndarray')
const ndsamples = require('ndsamples')
const AudioBuffer = require('audio-buffer')
const createBuffer = require('./')
const atob = require('atob-lite')
const encode = require('wav-encoder').encode
const createUri = require('create-data-uri')
const toString = require('arraybuffer-to-string')
const AudioBufferList = require('audio-buffer-list')

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
	let buf = createBuffer(ints.buffer, 'int8 interleaved 96000')

	t.equal(buf.numberOfChannels, 2)
	t.equal(buf.length, 2)
	t.deepEqual(buf.getChannelData(0), [-1, -1])
	t.deepEqual(buf.getChannelData(1), [1, 1])
	t.equal(buf.sampleRate, 96000)

	t.end()
})

t('from buffer', t => {
	let buf = Buffer.from(new Uint8Array([0,255,0,255]))

	let abuf1 = createBuffer(buf)
	t.equal(abuf1.numberOfChannels, 1)
	t.equal(abuf1.length, 4)

	let abuf2 = createBuffer(buf, {channels: 2})
	t.equal(abuf2.numberOfChannels, 2)
	t.equal(abuf2.length, 2)

	let abuf3 = createBuffer(buf, 'stereo interleaved')
	t.equal(abuf3.numberOfChannels, 2)
	t.equal(abuf3.length, 2)
	t.deepEqual(abuf3.getChannelData(0), [-1, -1])

	t.end()
})

t('from array with numbers', t => {
	let buf = createBuffer([0, -1, 0, 1])

	t.equal(buf.numberOfChannels, 1)
	t.equal(buf.length, 4)


	let buf2 = createBuffer([0, -1, 0, 1], 'stereo interleaved')

	t.equal(buf2.numberOfChannels, 2)
	t.equal(buf2.length, 2)
	t.deepEqual(buf2.getChannelData(1), [-1, 1])

	t.end()
})

t('from array with channels', t => {
	let buf = createBuffer([[0, 0], [1, 1]])

	t.equal(buf.numberOfChannels, 2)
	t.equal(buf.length, 2)


	let buf2 = createBuffer([new Float32Array([0, 0]), new Float32Array([1, 1])])

	t.equal(buf2.numberOfChannels, 2)
	t.equal(buf2.length, 2)
	t.deepEqual(buf2.getChannelData(0), [0, 0])
	t.deepEqual(buf2.getChannelData(1), [1, 1])


	let buf3 = createBuffer([[-1, -1], [1, 1]], {channels: 3})
	t.equal(buf3.numberOfChannels, 3)
	t.equal(buf3.length, 2)

	t.end()
})

t('from float32 array', t => {
	let b = createBuffer(new Float32Array([-1,0,1]))

	t.equal(b.numberOfChannels, 1)
	t.equal(b.length, 3)

	let b2 = createBuffer(new Float32Array([-1, 0, 1, 0]), 'stereo interleaved')

	t.equal(b2.length, 2)
	t.equal(b2.numberOfChannels, 2)
	t.deepEqual(b2.getChannelData(0), [-1, 1])

	t.end()
})

t('from empty', t => {
	let b = createBuffer()

	t.equal(b.length, 1)
	t.equal(b.numberOfChannels, 1)


	let b2 = createBuffer(null)

	t.equal(b2.length, 1)
	t.equal(b2.numberOfChannels, 1)

	t.end()
})

t('from number', t => {
	let b = createBuffer(100)

	t.equal(b.length, 100)
	t.equal(b.numberOfChannels, 1)

	let b2 = createBuffer(100, 2)

	t.equal(b2.length, 100)
	t.equal(b2.numberOfChannels, 2)

	t.end()
})

t('from audiobuffer', t => {
	let ab = new AudioBuffer(null, {length: 10, numberOfChannels: 2})

	let b = createBuffer(ab)

	t.notEqual(b, ab)
	t.equal(b.numberOfChannels, ab.numberOfChannels)
	t.equal(b.sampleRate, ab.sampleRate)
	t.equal(b.length, ab.length)

	t.end()
})

t('from object', t => {
	//numberOfChannels, channelCount, channels
	let b = createBuffer({length: 100})

	t.equal(b.length, 100)
	t.equal(b.numberOfChannels, 1)


	let b2 = createBuffer({numberOfChannels: 2, length: 5})

	t.equal(b2.length, 5)
	t.equal(b2.numberOfChannels, 2)


	let b3 = createBuffer({channels: 2, length: 5})

	t.equal(b3.length, 5)
	t.equal(b3.numberOfChannels, 2)


	let b4 = createBuffer({sampleRate: 12000, length: 5})

	t.equal(b4.length, 5)
	t.equal(b4.numberOfChannels, 1)
	t.equal(b4.sampleRate, 12000)


	let b5 = createBuffer({channelCount: 2, length: 2})

	t.equal(b5.length, 2)
	t.equal(b5.numberOfChannels, 2)


	let b6 = createBuffer(null, {channels: 3, length: 5})

	t.equal(b6.length, 5)
	t.equal(b6.numberOfChannels, 3)


	t.end()
})

t('0-length buffer', t => {
	let b = createBuffer(0, {context: {}})

	t.equal(b.numberOfChannels, 1)
	t.equal(b.length, 0)

	t.end()
})

t('from dataURI', t => {
	// let header = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA'

	// smallest mp3
	// 'data:audio/mpeg;base64,/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

	// wav-datauri
	// let wave = encode({sampleRate: 44100, channelData: [
	// 	new Float32Array([0,0,1,1]),
	// 	new Float32Array([0,0,1,1]),
	// ]}).then(data => {
	// 	let str = createUri('audio/wav', toString(data, 'base64'))

	// 	let buf = createBuffer(str)

	// 	t.equal(t.numberOfChannels)
	// })

	let uint8 = new Uint8Array([0, 255, 0, 255])
	let uri = createUri('application/octet-stream', toString(uint8, 'base64'))
console.log(uri)
	let buf = createBuffer(uri, 'uint8 interleaved')

	t.equal(buf.numberOfChannels, 2)
	t.equal(buf.length, 2)
	t.deepEqual(buf.getChannelData(0), [-1, -1])
	t.deepEqual(buf.getChannelData(1), [1, 1])


	let floats = new Float32Array([0, 0, 1, 1])
	let uri2 = createUri('application/octet-stream', toString(floats.buffer, 'base64'))

	let buf2 = createBuffer(uri2, 'float32 planar')

	t.equal(buf2.numberOfChannels, 2)
	t.equal(buf2.length, 2)
	t.deepEqual(buf2.getChannelData(0), [0, 0])
	t.deepEqual(buf2.getChannelData(1), [1, 1])

	t.end()
})

t('from base64', t => {
	let uint8 = new Uint8Array([0, 255, 0, 255])
	let uri = toString(uint8, 'base64')

	let buf = createBuffer(uri, 'uint8 interleaved')

	t.equal(buf.numberOfChannels, 2)
	t.equal(buf.length, 2)
	t.deepEqual(buf.getChannelData(0), [-1, -1])
	t.deepEqual(buf.getChannelData(1), [1, 1])


	let floats = new Float32Array([0, 0, 1, 1])
	let uri2 = toString(floats.buffer, 'base64')

	let buf2 = createBuffer(uri2, 'float32 planar')

	t.equal(buf2.numberOfChannels, 2)
	t.equal(buf2.length, 2)
	t.deepEqual(buf2.getChannelData(0), [0, 0])
	t.deepEqual(buf2.getChannelData(1), [1, 1])

	t.end()
})


t('from raw string', t => {
	let uint8 = new Uint8Array([0, 255, 0, 255])
	let uri = toString(uint8, 'binary')

	let buf = createBuffer(uri, 'uint8 interleaved')

	t.equal(buf.numberOfChannels, 2)
	t.equal(buf.length, 2)
	t.deepEqual(buf.getChannelData(0), [-1, -1])
	t.deepEqual(buf.getChannelData(1), [1, 1])


	let floats = new Float32Array([-1, -1, 1, 1])
	let uri2 = toString(floats.buffer, 'binary')

	let buf2 = createBuffer(uri2, 'float32 planar')

	t.equal(buf2.numberOfChannels, 2)
	t.equal(buf2.length, 2)
	t.deepEqual(buf2.getChannelData(0), [-1, -1])
	t.deepEqual(buf2.getChannelData(1), [1, 1])

	t.end()
})


t('from audiobuffer strip channels', t => {
	let a = createBuffer(1, 3)
	let b = createBuffer(a, 2)

	t.equal(a.numberOfChannels, 3)
	t.equal(b.numberOfChannels, 2)
	t.equal(b.length, 1)

	t.end()
})


t('from audiobuffer save sample rate', t => {
	let a = createBuffer(1, {channels: 3, sampleRate: 10000})
	let b = createBuffer(a, 2)

	t.equal(a.numberOfChannels, 3)
	t.equal(b.numberOfChannels, 2)
	t.equal(b.length, 1)
	t.equal(b.sampleRate, 10000)

	t.end()
})

t('from audio-buffer-list', t => {
	let a = AudioBufferList(100, {channels: 2})

	let ab = createBuffer(a)

	t.equal(ab.length, 100)
	t.equal(ab.numberOfChannels, 2)

	t.end()
})

t('from object with duration', t => {
	let a = createBuffer({duration: .5, channels: 2})

	t.equal(a.length, 22050)

	let b = createBuffer({duration: 0, channels: 2})

	t.equal(b.length, 0)


	let c = createBuffer(null, {duration: 0, channels: 2})

	t.equal(c.length, 0)

	let d = createBuffer(null, {duration: 0.005, channels: 2})

	t.equal(d.length, 221)

	t.end()
})
