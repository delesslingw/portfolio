"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";

export default function P5Canvas() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const p5Ref = useRef<p5>(null);

    useEffect(() => {
        import("p5").then((p5Module) => {
            const p5 = p5Module.default;
            const sketch = (p: p5) => {
                let fadeIn = 0;
                class Boid {
                    pos: p5.Vector;
                    vel: p5.Vector;
                    acc: p5.Vector;
                    maxForce: number;
                    maxSpeed: number;

                    constructor() {
                        this.pos = p.createVector(p.random(p.width), p.random(p.height));
                        this.vel = p5.Vector.random2D();
                        this.acc = p.createVector();
                        this.maxForce = 0.2;
                        this.maxSpeed = 4;
                    }

                    edges() {
                        if (this.pos.x > p.width) this.pos.x = 0;
                        else if (this.pos.x < 0) this.pos.x = p.width;

                        if (this.pos.y > p.height) this.pos.y = 0;
                        else if (this.pos.y < 0) this.pos.y = p.height;
                    }

                    align(boids: Boid[]) {
                        let perceptionRadius = 50;
                        let steering = p.createVector();
                        let total = 0;

                        for (let other of boids) {
                            let d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
                            if (other !== this && d < perceptionRadius) {
                                steering.add(other.vel);
                                total++;
                            }
                        }

                        if (total > 0) {
                            steering.div(total);
                            steering.setMag(this.maxSpeed);
                            steering.sub(this.vel);
                            steering.limit(this.maxForce);
                        }

                        return steering;
                    }

                    cohesion(boids: Boid[]) {
                        let perceptionRadius = 50;
                        let steering = p.createVector();
                        let total = 0;

                        for (let other of boids) {
                            let d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
                            if (other !== this && d < perceptionRadius) {
                                steering.add(other.pos);
                                total++;
                            }
                        }

                        if (total > 0) {
                            steering.div(total);
                            steering.sub(this.pos);
                            steering.setMag(this.maxSpeed);
                            steering.sub(this.vel);
                            steering.limit(this.maxForce);
                        }

                        return steering;
                    }

                    separation(boids: Boid[]) {
                        let perceptionRadius = 24;
                        let steering = p.createVector();
                        let total = 0;

                        for (let other of boids) {
                            let d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
                            if (other !== this && d < perceptionRadius) {
                                let diff = p5.Vector.sub(this.pos, other.pos);
                                diff.div(d * d);
                                steering.add(diff);
                                total++;
                            }
                        }

                        if (total > 0) {
                            steering.div(total);
                            steering.setMag(this.maxSpeed);
                            steering.sub(this.vel);
                            steering.limit(this.maxForce);
                        }

                        return steering;
                    }

                    flock(boids: Boid[]) {
                        let alignment = this.align(boids);
                        let cohesion = this.cohesion(boids);
                        let separation = this.separation(boids);

                        this.acc.add(alignment);
                        this.acc.add(cohesion);
                        this.acc.add(separation);
                    }

                    update() {
                        this.pos.add(this.vel);
                        this.vel.add(this.acc);
                        this.vel.limit(this.maxSpeed);
                        this.acc.mult(0);
                    }

                    show() {
                        p.strokeWeight(8);
                        p.stroke(200, fadeIn);
                        p.point(this.pos.x, this.pos.y);
                        if (fadeIn < 245) {
                            fadeIn += 0.01;
                        }
                    }
                }

                let flock: Boid[] = [];

                p.setup = () => {
                    p.createCanvas(p.windowWidth, p.windowHeight);
                    for (let i = 0; i < 100; i++) {
                        flock.push(new Boid());
                    }
                };

                p.draw = () => {
                    p.background(255);
                    for (let boid of flock) {
                        boid.edges();
                        boid.flock(flock);
                        boid.update();
                        boid.show();
                    }
                };

                p.windowResized = () => {
                    p.resizeCanvas(p.windowWidth, p.windowHeight);
                };
            };

            if (canvasRef.current) {
                p5Ref.current = new p5(sketch, canvasRef.current);
            }
        });

        return () => {
            p5Ref.current?.remove(); // Clean up
        };
    }, []);

    return <div ref={canvasRef} className="w-full h-full" />;
}
