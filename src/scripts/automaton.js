export class Automaton {
  constructor(
    width,
    height,
    updateWeight = 0.05,
    kernel = Automaton.INITIAL_KERNEL,
  ) {
    this.width = width;
    this.height = height;
    this.updateWeight = updateWeight;
    this.kernel = kernel;

    this.currentCells = Array.from(
      { length: height },
      () => new Float32Array(width),
    );
    this.previousCells = Array.from(
      { length: height },
      () => new Float32Array(width),
    );
  }

  static FULL_KERNEL = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  static INITIAL_KERNEL = [
    [-1, -1],
    [-1, 0],
    [0, -1],
    [0, 1],
    [1, 0],
    [1, 1],
  ];

  static shuffle(array) {
    const arr = Array.from(array);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  randomizeKernel(size) {
    this.kernel = Automaton.shuffle(Automaton.FULL_KERNEL).slice(0, size);
  }

  randomizeCells() {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        this.currentCells[i][j] = Math.random();
      }
    }
  }

  iterate() {
    for (let i = 0; i < this.height; i++) {
      this.previousCells[i].set(this.currentCells[i]);
    }

    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const original = this.previousCells[i][j];
        let neighborhood = 0.0;

        for (const [di, dj] of this.kernel) {
          const ni = (i + di + this.height) % this.height;
          const nj = (j + dj + this.width) % this.width;
          neighborhood += this.previousCells[ni][nj];
        }

        const delta = Math.sin(
          Math.PI * (neighborhood / (this.kernel.length / 2.0)),
        );
        this.currentCells[i][j] =
          (1.0 - this.updateWeight) * original + this.updateWeight * delta;
      }
    }
  }

  render(canvas) {
    const height = this.currentCells.length;
    const width = this.currentCells[0].length;

    canvas.height = height;
    canvas.width = width;

    const context = canvas.getContext("2d");
    const imageData = context.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = Math.floor(this.currentCells[y][x] * 255);
        const index = (y * width + x) * 4;
        imageData.data[index] = value;
        imageData.data[index + 1] = value;
        imageData.data[index + 2] = value;
        imageData.data[index + 3] = 255;
      }
    }

    context.putImageData(imageData, 0, 0);
  }
}
