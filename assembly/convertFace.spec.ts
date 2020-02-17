/// <reference path="../node_modules/@as-pect/assembly/types/as-pect.d.ts" />

import { convertFace, clamp } from './convertFace'

describe('clamp', () => {
  it('should clamp value', () => {
    const value = clamp(256, 128, 196)
    expect<f32>(value).toBe(196)
  })
})

// describe('convertFace', () => {
//   it('should convert a face', () => {
//     expect<i32>(convertFace()).toBe(1)
//   })
// })
