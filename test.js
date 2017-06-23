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
t('from arraybuffer')
t('from buffer')
t('from plain array')
t('from channelled array')
t('from channelled by float32 array')
t('from float32array')
t('from uint8 array')
t('from interleaved')
t('from empty')
t('from number')
t('from audiobuffer')
t('from options')
