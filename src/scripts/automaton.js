export class Kernel {
  constructor(weights) {
    this.weights = weights;
  }

  static OFFSETS = [
    [-1, -1], [-1,  0], [-1,  1],
    [ 0, -1],           [ 0,  1],
    [ 1, -1], [ 1,  0], [ 1,  1]
  ];

  total() {
    return this.weights.reduce((a, b) => a + b, 0);
  }

  static random() {
    return new Kernel(Array.from({ length: 8 }, () => Math.floor(Math.random() * 2)));
  }
}

export class AutomatonState {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.current = Array.from({ length: height }, () => new Float32Array(width));
    this.previous = Array.from({ length: height }, () => new Float32Array(width));
  }

  step(kernel, updateWeight = 0.05) {
    [this.current, this.previous] = [this.previous, this.current];

    for (let i = 0; i < this.height; ++i) {
      for (let j = 0; j < this.width; ++j) {
        let neighborhood = 0.0;

        for (let k = 0; k < Kernel.OFFSETS.length; ++k) {
          const ni = (i + Kernel.OFFSETS[k][0] + this.height) % this.height;
          const nj = (j + Kernel.OFFSETS[k][1] + this.width) % this.width;
          neighborhood += this.previous[ni][nj] * kernel.weights[k];
        }

        const original = this.previous[i][j];
        const average = neighborhood / kernel.total();
        const delta = Math.sin(Math.PI * 2 * average);

        this.current[i][j] = (1.0 - updateWeight) * original + updateWeight * delta;
      }
    }
  }

  render(canvas) {
    const height = this.current.length;
    const width = this.current[0].length;

    canvas.height = height;
    canvas.width = width;

    const context = canvas.getContext("2d");
    const imageData = context.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = Math.floor(this.current[y][x] * 255);
        const index = (y * width + x) * 4;
        imageData.data[index] = value;
        imageData.data[index + 1] = value;
        imageData.data[index + 2] = value;
        imageData.data[index + 3] = 255;
      }
    }

    context.putImageData(imageData, 0, 0);
  }

  save() {
    const buffer = new ArrayBuffer(this.width * this.height * 4);
    const view = new Float32Array(buffer);

    for (let y = 0; y < this.height; y++) {
      view.set(this.current[y], y * this.width);
    }

    return new Int8Array(buffer);
  }

  load(bytes) {
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const view = new Float32Array(buffer);

    for (let y = 0; y < this.height; y++) {
      this.current[y].set(view.subarray(y * this.width, (y + 1) * this.width));
    }
  }

  randomize() {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        this.current[i][j] = Math.random();
      }
    }
  }
}
