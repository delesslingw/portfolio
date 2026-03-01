import type p5 from 'p5'
import type { MutableRefObject } from 'react'

function asAnalyserArray(arr: Uint8Array): Uint8Array<ArrayBuffer> {
  return arr as unknown as Uint8Array<ArrayBuffer>
}

export default function visualizerSketch(
  p: p5,
  analyserRef: MutableRefObject<AnalyserNode | null>,
) {
  let dataArray: Uint8Array | null = null
  let waveformArray: Uint8Array | null = null

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.noFill()
  }

  p.draw = () => {
    p.background(0, 0, 0, 20)

    const analyser = analyserRef.current
    if (!analyser) return

    if (!dataArray || !waveformArray) {
      dataArray = new Uint8Array(analyser.frequencyBinCount)
      waveformArray = new Uint8Array(analyser.fftSize)
    }

    analyser.getByteFrequencyData(asAnalyserArray(dataArray))
    analyser.getByteTimeDomainData(asAnalyserArray(waveformArray))

    // ----- Spectrum -----
    p.stroke(180, 100, 255)
    for (let i = 0; i < dataArray.length; i++) {
      const x = p.map(i, 0, dataArray.length, 0, p.width)
      const h = p.map(dataArray[i], 0, 255, 0, p.height / 2)
      p.line(x, p.height, x, p.height - h)
    }

    // ----- Waveform -----
    p.stroke(255)
    p.beginShape()
    for (let i = 0; i < waveformArray.length; i++) {
      const x = p.map(i, 0, waveformArray.length, 0, p.width)
      const y = p.map(waveformArray[i], 0, 255, 0, p.height)
      p.vertex(x, y)
    }
    p.endShape()
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}
