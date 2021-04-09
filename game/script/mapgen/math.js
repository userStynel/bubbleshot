class Maths{
    static smoothInterpolation(bottomLeft, topLeft, bottomRight, topRight, xMin, xMax, zMin, zMax, x, z){
        let width = xMax - xMin;
        let height = zMax - zMin;
        let xValue = 1 - (x - xMin) / width;
        let zValue = 1 - (z - zMin) / height;

        let a = this.smoothstep(bottomLeft, bottomRight, xValue);
        let b = this.smoothstep(topLeft, topRight, xValue);
        let res = this.smoothstep(a, b, zValue);
        return res;
    }

    static smoothstep(edge0, edge1, x){
        x = x * x * (3 - 2 * x);
        return (edge0 * x) + (edge1 * (1-x));
    }
}