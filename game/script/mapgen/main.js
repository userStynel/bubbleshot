const title = 'Noise map - Simulator'

const seed = Math.random() * 10000
var noiseGenerator = new NoiseGenerator(seed)

var camera = new Camera({x: 1362, z: 1825})
var renderer = new Renderer()
var app = new Application(title, renderer, noiseGenerator, camera)