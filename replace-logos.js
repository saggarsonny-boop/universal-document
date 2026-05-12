const fs = require('fs')
const path = require('path')

// Use sharp from the converter app
const sharp = require('./apps/converter/node_modules/sharp')

const IMAGE_PATH = '/Users/sonnyneo/.gemini/antigravity/brain/f31637dd-de6e-415b-a9c3-1655cde59a0d/media__1778607737142.jpg'
const BASE_DIR = '/Users/sonnyneo/.gemini/antigravity/scratch'
const UD_DIR = path.join(BASE_DIR, 'universal-document')
const UD_INC_DIR = path.join(BASE_DIR, 'ud-inc')

const pngTargets = [
  'universal-document/ud-mark-udr.png',
  'universal-document/ud-mark-uds.png',
  'universal-document/apps/reader/public/icons/ud-mark-uds.png',
  'universal-document/apps/reader/src/app/icon.png',
  'universal-document/apps/creator/public/icons/ud-mark-uds.png',
  'universal-document/apps/creator/src/app/icon.png',
  'universal-document/apps/signer/public/icons/ud-mark-uds.png',
  'universal-document/apps/signer/src/app/icon.png',
  'universal-document/apps/landing/public/icons/ud-mark-uds.png',
  'universal-document/apps/landing/src/app/icon.png',
  'universal-document/apps/validator/public/icons/ud-mark-uds.png',
  'universal-document/apps/validator/src/app/icon.png',
  'universal-document/apps/converter/public/hive-logo-full.png',
  'universal-document/apps/converter/public/icons/ud-mark-uds.png',
  'universal-document/apps/converter/src/app/icon.png',
  'universal-document/apps/utilities/public/icons/ud-mark-uds.png',
  'universal-document/apps/utilities/src/app/icon.png',
  'ud-inc/public/icons/ud-mark-uds.png',
]

const webpTargets = [
  'universal-document/apps/converter/public/hive-logo-full.webp',
]

const svgTargets = [
  'universal-document/apps/reader/public/icons/ud-logo.svg',
  'universal-document/apps/creator/public/icons/ud-logo.svg',
  'universal-document/apps/signer/public/icons/ud-logo.svg',
  'universal-document/apps/landing/public/icons/ud-logo.svg',
  'universal-document/apps/validator/public/icons/ud-logo.svg',
  'universal-document/apps/converter/public/icons/ud-logo.svg',
  'universal-document/apps/utilities/public/icons/ud-logo.svg',
  'ud-inc/public/icons/ud-logo.svg',
  'ud-inc/public/favicon.svg'
]

async function run() {
  try {
    const rawImage = fs.readFileSync(IMAGE_PATH)
    const base64Img = rawImage.toString('base64')
    
    // Process PNGs
    const pngBuffer = await sharp(rawImage)
      .resize(512, 512, { fit: 'cover' })
      .png()
      .toBuffer()

    for (const rel of pngTargets) {
      const fullPath = path.join(BASE_DIR, rel)
      if (fs.existsSync(path.dirname(fullPath))) {
        fs.writeFileSync(fullPath, pngBuffer)
        console.log('Updated', rel)
      }
    }

    // Process WEBPs
    const webpBuffer = await sharp(rawImage)
      .resize(512, 512, { fit: 'cover' })
      .webp()
      .toBuffer()

    for (const rel of webpTargets) {
      const fullPath = path.join(BASE_DIR, rel)
      if (fs.existsSync(path.dirname(fullPath))) {
        fs.writeFileSync(fullPath, webpBuffer)
        console.log('Updated', rel)
      }
    }

    // Process SVGs
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/jpeg;base64,${base64Img}" width="512" height="512" preserveAspectRatio="xMidYMid slice" />
</svg>`

    for (const rel of svgTargets) {
      const fullPath = path.join(BASE_DIR, rel)
      if (fs.existsSync(path.dirname(fullPath))) {
        fs.writeFileSync(fullPath, svgContent)
        console.log('Updated', rel)
      }
    }
    
    console.log('DONE!')
  } catch (err) {
    console.error('Error processing images:', err)
  }
}

run()
