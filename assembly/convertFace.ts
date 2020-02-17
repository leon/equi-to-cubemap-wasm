export class ImageData {
  width: f32
  height: f32
  length: f32
  data: Uint32Array

  constructor(width: f32, height: f32) {
    this.length = width * height * 4 // assumes 4 BPP; documented.
    this.data = new Uint32Array(this.length)
  }
}

export interface Vector3 {
  x: f32
  y: f32
  z: f32
}

export function clamp(x: f32, min: f32, max: f32): f32 {
  return Mathf.min(max, Mathf.max(x, min))
}

export function mod(x: f32, n: f32): f32 {
  return ((x % n) + n) % n
}

export function copyPixelNearest(read: ImageData, write: ImageData): (xFrom: f32, yFrom: f32, to: f32) => void {
  const width = read.width
  const height: f32 = read.height
  const data: Uint32Array = read.data

  const readIndex = (x: f32, y: f32): f32 => 4 * (y * width + x)

  return (xFrom: f32, yFrom: f32, to: f32) => {
    const nearest: f32 = readIndex(clamp(Mathf.round(xFrom), 0, width - 1), clamp(Mathf.round(yFrom), 0, height - 1))

    for (let channel = 0; channel < 3; channel++) {
      write.data[to + channel] = data[nearest + channel]
    }
  }
}

/**
 * Gets the transform values for the cube
 * @param face the face that we should extract from the equirectangular image
 */
function getFaceOrientationFn(face: string): (out: Vector3, x: f32, y: f32) => void {
  switch (face) {
    case 'pz':
      return (out: Vector3, x: f32, y: f32) => {
        out.x = -1
        out.y = -x
        out.z = -y
      }
    case 'nz':
      return (out: Vector3, x: f32, y: f32) => {
        out.x = 1
        out.y = x
        out.z = -y
      }
    case 'px':
      return (out: Vector3, x: f32, y: f32) => {
        out.x = x
        out.y = -1
        out.z = -y
      }
    case 'nx':
      return (out: Vector3, x: f32, y: f32) => {
        out.x = -x
        out.y = 1
        out.z = -y
      }
    case 'py':
      return (out: Vector3, x: f32, y: f32) => {
        out.x = -y
        out.y = -x
        out.z = 1
      }
    case 'ny':
      return (out: Vector3, x: f32, y: f32) => {
        out.x = y
        out.y = -x
        out.z = -1
      }
    default:
      return (out: Vector3, x: f32, y: f32) => {
        out.x = 0
        out.y = 0
        out.z = 0
      }
  }
}

export const convertFace = (
  readData: ImageData,
  face: string,
  rotation: f32,
  interpolation: string,
  maxWidth: f32 = F32.POSITIVE_INFINITY,
): ImageData => {
  const faceWidth: f32 = Mathf.min(maxWidth, readData.width / 4)
  const faceHeight: f32 = faceWidth

  // how should we transform this face
  const orientationFn = getFaceOrientationFn(face)

  // const writeData = new ImageData(faceWidth, faceHeight);
  const writeData: ImageData = new ImageData(faceWidth, faceHeight)

  // how should we copy the pixels
  const copyPixel = copyPixelNearest(readData, writeData)
  // const copyPixel =
  //   interpolation === 'linear'
  //     ? copyPixelBilinear(readData, writeData)
  //     : interpolation === 'cubic'
  //     ? copyPixelBicubic(readData, writeData)
  //     : interpolation === 'lanczos'
  //     ? copyPixelLanczos(readData, writeData)
  //     : interpolation === 'nearest'
  //     ? copyPixelNearest(readData, writeData)
  //     : copyPixelLanczos(readData, writeData)

  // create working cube Vector3
  const cube: Vector3 = { x: 0, y: 0, z: 0 }

  // iterate over all pixels in image
  for (let x: f32 = 0; x < faceWidth; x++) {
    for (let y: f32 = 0; y < faceHeight; y++) {
      const to: f32 = 4 * (y * faceWidth + x)

      // fill alpha channel
      writeData.data[to + 3] = 255

      // get position on cube face
      // cube is centered at the origin with a side length of 2
      orientationFn(cube, (2 * (x + 0.5)) / faceWidth - 1, (2 * (y + 0.5)) / faceHeight - 1)

      // project cube face onto unit sphere by converting cartesian to spherical coordinates
      const r = Mathf.sqrt(cube.x * cube.x + cube.y * cube.y + cube.z * cube.z)
      const lon = mod(Mathf.atan2(cube.y, cube.x) + rotation, 2 * Mathf.PI)
      const lat = Mathf.acos(cube.z / r)

      copyPixel((readData.width * lon) / Mathf.PI / 2 - 0.5, (readData.height * lat) / Mathf.PI - 0.5, to)
    }
  }

  return writeData
}
