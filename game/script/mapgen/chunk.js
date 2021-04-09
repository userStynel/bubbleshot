class Chunk{
    constructor(pos){
        this.position = pos;
        this.pixels = new Array(CHUNK_SIZE * CHUNK_SIZE);
        this.mesh = new Mesh(pos);
        this.isLoaded = false;
        this.isBuffered = false;
    }
    load(generator) {
        if (!this.isLoaded) {
            generator.generate(this)
            this.isLoaded = true
        }
    }
    setPixel(x, z, type, heightMap = 1){
        if(!this.pixels[z * CHUNK_SIZE + x])
            this.pixels[z * CHUNK_SIZE + x] = new Pixel();
        this.pixels[z * CHUNK_SIZE + x].type = type;
        this.pixels[z * CHUNK_SIZE + x].heightMap = heightMap;
    }
    addToBuffer(){
        if(!this.isBuffered){
            this.mesh.add(this.pixels);
            this.isBuffered = true;
            return true;
        }
        return false;
    }
    draw(renderer) {
        if (this.isBuffered) {
            renderer.drawChunk(this);
        }
    }
}