// Image-to-image conversion via sharp.
//
// Supported targets: png, jpg, webp. (gif → static frame only; sharp
// drops animation when output isn't gif.) Each direction reads the source
// and re-encodes to the requested target. Lossy formats (jpg, webp) use
// quality=85 by default — a reasonable default for general use, refined
// in PR D's per-utility "compress" option.

import type { Converter } from './types'
import { thrownToFailure } from './types'

type SharpFormat = 'png' | 'jpeg' | 'webp' | 'gif'

async function reencode(input: Buffer, target: SharpFormat): Promise<Buffer> {
  const sharp = (await import('sharp')).default
  const pipeline = sharp(input)
  switch (target) {
    case 'png':  return pipeline.png().toBuffer()
    case 'jpeg': return pipeline.jpeg({ quality: 85 }).toBuffer()
    case 'webp': return pipeline.webp({ quality: 85 }).toBuffer()
    case 'gif':  return pipeline.gif().toBuffer()
  }
}

function makeImageConverter(target: SharpFormat, contentType: string): Converter {
  return async (input, options) => {
    try {
      const buf = await reencode(input, target)
      return { ok: true, buffer: buf, contentType }
    } catch (err) {
      return thrownToFailure(err, { code: 'invalid_input', recoverable: true })
    }
  }
}

export const imageToPng  = makeImageConverter('png',  'image/png')
export const imageToJpg  = makeImageConverter('jpeg', 'image/jpeg')
export const imageToWebp = makeImageConverter('webp', 'image/webp')
