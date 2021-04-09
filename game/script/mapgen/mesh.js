class Mesh{
    constructor(pos){
        this.position = pos;
        this.imgData = ctx.createImageData(CHUNK_SIZE, CHUNK_SIZE);
        this.data = this.imgData.data;
    }
    add(pixels){
        let l = this.data.length;
        for(var i = 0; i < l; i += 4){
            let pixel = pixels[i / 4];
            let rgb = null;
            if(pixel.type === PixelType.Water){
                rgb = [3, 169, 244]
            } else if (pixel.type == PixelType.Grass) {
                rgb = [64, 154, 67]
            } else if (pixel.type == PixelType.Sand) {
                rgb = [255, 193, 7]
            } else if (pixel.type == PixelType.Dirt){
                rgb = [74, 48, 39]
            } else {
                rgb = [249, 249, 249]
            }
            let bias = this.bias(pixel.heightMap);
            this.data[i] = rgb[0] * bias;
            this.data[i+1] = rgb[1] * bias;
            this.data[i+2] = rgb[2] * bias;
            this.data[i+3] = 255;
        }
    }
    bias(heightMap){
        let dark = 0.75;
        let light = 1;
        return dark * heightMap + light * (1 - heightMap);
    }
}