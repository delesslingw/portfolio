'use client'
import P5Canvas from './P5Canvas'

import type p5 from 'p5'
const sketch = (p: p5) => {
  let fadeIn = 0
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
      const steering = p.createVector()
      let total = 0

      for (const other of boids) {
        const d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y)
        if (other !== this && d < perceptionRadius) {
          steering.add(other.vel)
          total++
        }
      }

      if (total > 0) {
        steering.div(total)
        steering.setMag(this.maxSpeed)
        steering.sub(this.vel)
        steering.limit(this.maxForce)
      }

      return steering
    }

    cohesion(boids: Boid[]) {
      const perceptionRadius = 50
      const steering = p.createVector()
      let total = 0

      for (const other of boids) {
        const d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y)
        if (other !== this && d < perceptionRadius) {
          steering.add(other.pos)
          total++
        }
      }

      if (total > 0) {
        steering.div(total)
        steering.sub(this.pos)
        steering.setMag(this.maxSpeed)
        steering.sub(this.vel)
        steering.limit(this.maxForce)
      }

      return steering
    }

    separation(boids: Boid[]) {
      const perceptionRadius = 24
      const steering = p.createVector()
      let total = 0

      for (const other of boids) {
        const d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y)
        if (other !== this && d < perceptionRadius) {
          const diff = p.createVector(
            this.pos.x - other.pos.x,
            this.pos.y - other.pos.y,
          )
          diff.div(d * d)
          steering.add(diff)
          total++
        }
      }

      if (total > 0) {
        steering.div(total)
        steering.setMag(this.maxSpeed)
        steering.sub(this.vel)
        steering.limit(this.maxForce)
      }

      return steering
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

export default function BoidCanvas() {
  return <P5Canvas sketch={sketch} />
}
