class Application {
    constructor(title, renderer, noiseGenerator, camera) {
        this.title = title
        this.renderer = renderer
        this.camera = camera
        this.world = new World(noiseGenerator)
        //this.startTime = Date.now()
        //this.nbFrame = 0
        //this.runLoop = this.runLoop.bind(this)
    }
    runLoop() {
        //this.updateFPS()
        this.camera.move(myInfo.x, myInfo.y);
        this.world.loadChunks(this.camera)
        this.world.draw(this.renderer)
        this.renderer.render(this.camera)
        //requestAnimationFrame(this.runLoop)
    }
}