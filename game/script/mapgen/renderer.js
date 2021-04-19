class Renderer{
    constructor(){
        this.meshes = []
    }

    drawChunk(chunk){
        this.meshes.push(chunk.mesh)
    }

    render(camera){
        for(var iMesh in this.meshes){
            const mesh = this.meshes[iMesh]
            const cameraViewX = camera.position.x - canvas.width / 2
            const cameraViewZ = camera.position.z - canvas.height / 2
            const meshX = parseInt(mesh.position.x) - cameraViewX;
            const meshZ = parseInt(mesh.position.z) - cameraViewZ;
            ctx.putImageData(mesh.imgData, meshX, meshZ);
        }
        this.meshes = []
    }
}