function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgbToHex(r: number, g: number, b: number) {
  const to2 = (x: number) => x.toString(16).padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

// sRGB [0..255] -> HSL (h:0..360, s/l:0..100)
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0
  const l = (max + min) / 2
  const d = max - min

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: s * 100, l: l * 100 }
}

// HSL -> sRGB [0..255]
function hslToRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let rp = 0,
    gp = 0,
    bp = 0

  if (0 <= h && h < 60) {
    rp = c
    gp = x
    bp = 0
  } else if (60 <= h && h < 120) {
    rp = x
    gp = c
    bp = 0
  } else if (120 <= h && h < 180) {
    rp = 0
    gp = c
    bp = x
  } else if (180 <= h && h < 240) {
    rp = 0
    gp = x
    bp = c
  } else if (240 <= h && h < 300) {
    rp = x
    gp = 0
    bp = c
  } else {
    rp = c
    gp = 0
    bp = x
  }

  const r = Math.round((rp + m) * 255)
  const g = Math.round((gp + m) * 255)
  const b = Math.round((bp + m) * 255)
  return { r, g, b }
}

export function forceLightBackground(hex: string, minL = 85, maxL = 97) {
  const { r, g, b } = hexToRgb(hex)
  const hsl = rgbToHsl(r, g, b)
  const L = clamp(hsl.l, minL, maxL)
  const rgb = hslToRgb(hsl.h, hsl.s, L)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}
