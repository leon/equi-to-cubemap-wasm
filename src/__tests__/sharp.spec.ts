import sharp from 'sharp'
import path from 'path'

describe('convertImageInSharp', () => {
  it('should convert front face', async () => {
    const equiInput = path.resolve(__dirname, 'assets', 'equirectangular-test.png')
    const imageData: Buffer = await sharp(equiInput)
      .raw()
      .toBuffer()
    expect(imageData).toBeDefined()
  })
})
