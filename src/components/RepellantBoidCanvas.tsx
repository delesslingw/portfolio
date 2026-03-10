'use client'
import P5Canvas from './P5Canvas'

import type p5 from 'p5'
const sketch = (p: p5) => {
  let fadeIn = 0

  // Pre-allocated reusable vectors to avoid GC pressure from O(n²) allocations per frame
  let _alignSteering: p5.Vector
  let _cohesionSteering: p5.Vector
  let _sepSteering: p5.Vector
  let _diff: p5.Vector

  class Boid {
    pos: p5.Vector
    vel: p5.Vector
    acc: p5.Vector
    maxForce: number
    maxSpeed: number

    constructor() {
      this.pos = p.createVector(p.random(p.width), p.random(p.height))
      this.vel = p.createVector(p.random(-1, 1), p.random(-1, 1)).normalize()
      this.acc = p.createVector()
      this.maxForce = 0.2
      this.maxSpeed = 4
    }

    edges() {
      if (this.pos.x > p.width) this.pos.x = 0
      else if (this.pos.x < 0) this.pos.x = p.width

      if (this.pos.y > p.height) this.pos.y = 0
      else if (this.pos.y < 0) this.pos.y = p.height
    }

    align(boids: Boid[]) {
      const perceptionRadius = 50
      _alignSteering.set(0, 0)
      let total = 0

      for (const other of boids) {
        const d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y)
        if (other !== this && d < perceptionRadius) {
          _alignSteering.add(other.vel)
          total++
        }
      }

      if (total > 0) {
        _alignSteering.div(total)
        _alignSteering.setMag(this.maxSpeed)
        _alignSteering.sub(this.vel)
        _alignSteering.limit(this.maxForce)
      }

      return _alignSteering
    }

    cohesion(boids: Boid[]) {
      const perceptionRadius = 50
      _cohesionSteering.set(0, 0)
      let total = 0

      for (const other of boids) {
        const d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y)
        if (other !== this && d < perceptionRadius) {
          _cohesionSteering.add(other.pos)
          total++
        }
      }

      if (total > 0) {
        _cohesionSteering.div(total)
        _cohesionSteering.sub(this.pos)
        _cohesionSteering.setMag(this.maxSpeed)
        _cohesionSteering.sub(this.vel)
        _cohesionSteering.limit(this.maxForce)
      }

      return _cohesionSteering
    }

    separation(boids: Boid[]) {
      const perceptionRadius = 24
      _sepSteering.set(0, 0)
      let total = 0

      for (const other of boids) {
        const d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y)
        if (other !== this && d < perceptionRadius) {
          _diff.set(this.pos.x - other.pos.x, this.pos.y - other.pos.y)
          _diff.div(d * d)
          _sepSteering.add(_diff)
          total++
        }
      }

      if (total > 0) {
        _sepSteering.div(total)
        _sepSteering.setMag(this.maxSpeed)
        _sepSteering.sub(this.vel)
        _sepSteering.limit(this.maxForce)
      }

      return _sepSteering
    }

    flock(boids: Boid[]) {
      const alignment = this.align(boids)
      const cohesion = this.cohesion(boids)
      const separation = this.separation(boids)

      this.acc.add(alignment)
      this.acc.add(cohesion)
      this.acc.add(separation)
    }

    update() {
      this.pos.add(this.vel)
      this.vel.add(this.acc)
      this.vel.limit(this.maxSpeed)
      this.acc.mult(0)
    }

    show() {
      p.strokeWeight(8)
      p.stroke(200, fadeIn)
      p.point(this.pos.x, this.pos.y)
      if (fadeIn < 245) {
        fadeIn += 0.01
      }
    }
  }

  const flock: Boid[] = []

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    _alignSteering = p.createVector()
    _cohesionSteering = p.createVector()
    _sepSteering = p.createVector()
    _diff = p.createVector()
    for (let i = 0; i < 100; i++) {
      flock.push(new Boid())
    }
  }

  p.draw = () => {
    p.background(255)
    for (const boid of flock) {
      boid.edges()
      boid.flock(flock)
      boid.update()
      boid.show()
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}

export default function RepellantBoidCanvas() {
  return <P5Canvas sketch={sketch} />
}
