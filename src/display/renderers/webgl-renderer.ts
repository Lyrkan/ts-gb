import { Display, SCREEN_WIDTH, SCREEN_HEIGHT } from '../display';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D u_texture;
  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
  }
`;

export class WebGLRenderer {
  private display: Display;
  private scaling: number;

  private canvas: HTMLCanvasElement;
  private canvasContext: WebGLRenderingContext;
  private texture: WebGLTexture | null;

  public constructor(
    display: Display, {
    scaling = 1,
    defaultColor = [233, 233, 233],
    canvasId = '',
  }: ICanvasRendererOptions = {}) {
    if (defaultColor.length !== 3) {
      throw new Error(`Invalid defaultColor length (expected 3, got ${defaultColor.length})`);
    }

    this.display = display;
    this.scaling = scaling;

    this.createCanvas(canvasId);
    this.initializeContext(defaultColor);

  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public renderFrame(): void {
    if (this.texture) {
      this.canvasContext.bindTexture(this.canvasContext.TEXTURE_2D, this.texture);
      this.canvasContext.texImage2D(
        this.canvasContext.TEXTURE_2D,
        0,
        this.canvasContext.RGB,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        0,
        this.canvasContext.RGB,
        this.canvasContext.UNSIGNED_BYTE,
        this.display.getFrontBuffer()
      );
      this.canvasContext.drawArrays(this.canvasContext.TRIANGLES, 0, 6);
    }
  }

  private createCanvas(canvasId: string): void {
    this.canvas = document.createElement('canvas');
    this.canvas.id = canvasId;
    this.canvas.style.width = `${SCREEN_WIDTH * this.scaling}px` ;
    this.canvas.style.height = `${SCREEN_HEIGHT * this.scaling}px` ;
    this.canvas.width = SCREEN_WIDTH * this.scaling;
    this.canvas.height = SCREEN_HEIGHT * this.scaling;
  }

  private initializeContext(defaultColor: number[]): void {
    this.canvasContext = this.canvas.getContext('webgl') as WebGLRenderingContext;
    if (!this.canvasContext) {
      throw new Error('Could not retrieve WebGL context');
    }

    // Create program and shaders
    const vertexShader = this.createShader(
      'vertex',
      this.canvasContext.VERTEX_SHADER,
      VERTEX_SHADER
    );

    const fragmentShader = this.createShader(
      'fragment',
      this.canvasContext.FRAGMENT_SHADER,
      FRAGMENT_SHADER
    );

    const program = this.canvasContext.createProgram();
    this.canvasContext.attachShader(program, fragmentShader);
    this.canvasContext.attachShader(program, vertexShader);
    this.canvasContext.linkProgram(program);
    this.canvasContext.useProgram(program);

    // Setup the two triangles that represent the screen
    const positionLoc = this.canvasContext.getAttribLocation(program, 'a_position');
    const positionBuffer = this.canvasContext.createBuffer();
    this.canvasContext.bindBuffer(this.canvasContext.ARRAY_BUFFER, positionBuffer);
    this.canvasContext.bufferData(
      this.canvasContext.ARRAY_BUFFER,
      new Float32Array([
        -1, 1, 1, 1, 1, -1,
        -1, 1, 1, -1, -1, -1,
      ]),
      this.canvasContext.STATIC_DRAW
    );
    this.canvasContext.enableVertexAttribArray(positionLoc);
    this.canvasContext.vertexAttribPointer(positionLoc, 2, this.canvasContext.FLOAT, false, 0, 0);

    // Setup texture coordinates
    const texCoordLoc = this.canvasContext.getAttribLocation(program, 'a_texCoord');
    const texCoordBuffer = this.canvasContext.createBuffer();
    this.canvasContext.bindBuffer(this.canvasContext.ARRAY_BUFFER, texCoordBuffer);
    this.canvasContext.bufferData(
      this.canvasContext.ARRAY_BUFFER,
      new Float32Array([
        0, 0, 1, 0, 1, 1,
        0, 0, 1, 1, 0, 1,
      ]),
      this.canvasContext.STATIC_DRAW
    );
    this.canvasContext.enableVertexAttribArray(texCoordLoc);
    this.canvasContext.vertexAttribPointer(texCoordLoc, 2, this.canvasContext.FLOAT, false, 0, 0);

    // Setup texture material
    this.texture = this.canvasContext.createTexture();
    this.canvasContext.bindTexture(this.canvasContext.TEXTURE_2D, this.texture);

    this.canvasContext.texParameteri(
      this.canvasContext.TEXTURE_2D,
      this.canvasContext.TEXTURE_MAG_FILTER,
      this.canvasContext.NEAREST
    );

    this.canvasContext.texParameteri(
      this.canvasContext.TEXTURE_2D,
      this.canvasContext.TEXTURE_MIN_FILTER,
      this.canvasContext.NEAREST
    );

    this.canvasContext.texParameteri(
      this.canvasContext.TEXTURE_2D,
      this.canvasContext.TEXTURE_WRAP_S,
      this.canvasContext.CLAMP_TO_EDGE
    );

    this.canvasContext.texParameteri(
      this.canvasContext.TEXTURE_2D,
      this.canvasContext.TEXTURE_WRAP_T,
      this.canvasContext.CLAMP_TO_EDGE
    );

    const imageLoc = this.canvasContext.getUniformLocation(program, 'u_texture');
    this.canvasContext.uniform1i(imageLoc, 0);

    // Clear the screen
    this.canvasContext.clearColor(
      defaultColor[0] / 255,
      defaultColor[1] / 255,
      defaultColor[2] / 255,
      1
    );

    this.canvasContext.clear(this.canvasContext.COLOR_BUFFER_BIT);
  }

  private createShader(name: string, type: number, code: string): WebGLShader | null {
    const shader = this.canvasContext.createShader(type);
    this.canvasContext.shaderSource(shader, code);
    this.canvasContext.compileShader(shader);

    if (!this.canvasContext.getShaderParameter(shader, this.canvasContext.COMPILE_STATUS)) {
      throw new Error(
        `Could not compile shader "${name}": ${this.canvasContext.getShaderInfoLog(shader)}`
      );
    }

    return shader;
  }
}

export interface ICanvasRendererOptions {
  scaling?: number;
  defaultColor?: number[];
  canvasId?: string;
}
