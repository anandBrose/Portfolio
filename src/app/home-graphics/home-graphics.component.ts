import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home-graphics',
  templateUrl: './home-graphics.component.html',
  styleUrls: ['./home-graphics.component.scss']
})
export class HomeGraphicsComponent implements OnInit, AfterViewInit {
  segmentWidth: number;
  segmentHeight: number;
  animateDistance = 80;
  animateSpeed = 15;
  constructor() { }
  particleCount = 260;
  particleSize = 5;
  particles: Particle[];
  mousePosition: any;
  closestParticlePairs: { p: number, q: number }[];
  lastTimestamp;
  @ViewChild('canvas') canvas: ElementRef;
  canvasWidth: number;
  canvasHeight: number;
  cx: CanvasRenderingContext2D;
  ngOnInit() { }
  ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = this.canvas.nativeElement.getContext('2d');
    canvasEl.width = this.canvasWidth = canvasEl.parentElement.offsetWidth;
    this.mousePosition = {
      x: canvasEl.width / 2,
      y: canvasEl.height / 2
    };
    this.segmentWidth = 125;//this.canvasWidth / 15;
    this.segmentHeight = 55;//this.canvasWidth / 15;
    canvasEl.height = this.canvasHeight = canvasEl.parentElement.offsetHeight;
    this.startDrawing();
    this.addEvents();
  }
  addEvents(): any {
    this.canvas.nativeElement.parentElement.parentElement.addEventListener('mousemove', (evt: Event) => {
      this.mousePosition = this.getMousePos(this.canvas.nativeElement, evt);
    }, false);
  }

  getMousePos(canvas: Element, evt: any) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  startDrawing() {
    this.particles = [];
    let posx = 0;
    let posy = 0;
    for (let x = 0; x < this.canvasWidth; x += this.segmentWidth) {
      for (let y = 0; y < this.canvasHeight; y += this.segmentHeight) {
        posx = x + (Math.random() * this.segmentWidth);
        posy = y + (Math.random() * this.segmentHeight);
        const particle: Particle = this.createParticle(posx, posy);
        this.particles.push(particle);
      }
    }
    this.closestParticlePairs = this.pairClosest();
    setInterval(() => {
      window.requestAnimationFrame(this.render);
    }, 16.6);
  }

  pairClosest(): any {
    const pairs: { p: number, q: any[] }[] = [];
    for (let i = 0; i < this.particles.length; i++) {
      let pair = [];
      for (let j = i + 1; j < this.particles.length; j++) {
        pair.push({
          index: j,
          distance: this.distanceBetweenParticles(this.particles[i], this.particles[j])
        });
      }
      pair = pair.sort((a: any, b: any) => {
        return a.distance - b.distance;
      });
      this.particles[i].closest = pair.splice(0, 5);
    }
    return pairs;
  }

  distanceBetweenParticles(pParticle: any, qParticle: any) {
    const xSq = Math.pow((qParticle.x - pParticle.x), 2);
    const ySq = Math.pow((qParticle.y - pParticle.y), 2);
    const distance = Math.sqrt(xSq + ySq);
    return distance;
  }

  animateParticle(particle: Particle, deltaTime: number) {
    if (this.distanceBetweenParticles(particle, particle.to) < 2) {
      particle.to = {
        x: particle.orginX + ((Math.random() - 0.5) * this.animateDistance),
        y: particle.orginY + ((Math.random() - 0.5) * this.animateDistance)
      };
    }
    particle.x += ((particle.to.x - particle.x) / 2) * deltaTime;
    particle.y += ((particle.to.y - particle.y) / 2) * deltaTime;
  }

  render = (currentTimestamp: number) => {
    this.lastTimestamp = this.lastTimestamp || currentTimestamp;
    const delta = currentTimestamp - this.lastTimestamp;
    this.lastTimestamp = currentTimestamp;
    this.cx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    for (const particle of this.particles) {
      let opacity = 0;
      this.animateParticle(particle, delta * 0.001 * this.animateSpeed);
      const distance = this.distanceBetweenParticles(this.mousePosition, particle);
      if (distance > 200) {
        opacity = 0.05;
      } else if (distance > 100) {
        opacity = 0.3;
      } else if (distance > 50) {
        opacity = 0.6;
      } else {
        opacity = 0.9;
      }
      this.drawParticle(particle, opacity);
      for (const pair of particle.closest) {
        this.drawLine(particle, this.particles[pair.index], opacity);
      }
    }
  }

  createParticle(x: number, y: number): Particle {
    return {
      id: x + '-' + y,
      closest: [],
      orginX: x,
      orginY: y,
      x,
      y,
      to: {
        x: x + (Math.random() * this.animateDistance),
        y: y + (Math.random() * this.animateDistance)
      },
      size: Math.random() * this.particleSize + 1
    };
  }
  drawLine(particle: Particle, lastParticle: Particle, opacity: number) {
    this.cx.beginPath();
    const startColor = { r: 5, g: 169, b: 133 };
    const endColor = { r: 255, g: 255, b: 255 };
    const red = (endColor.r - startColor.r) * particle.y / this.canvasHeight + startColor.r;
    const green = (endColor.g - startColor.g) * particle.y / this.canvasHeight + startColor.g;
    const blue = (endColor.b - startColor.b) * particle.y / this.canvasHeight + startColor.b;
    this.cx.strokeStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ', ' + opacity + ')';
    this.cx.moveTo(lastParticle.x, lastParticle.y);
    this.cx.lineTo(particle.x, particle.y);
    this.cx.lineWidth = 0.5;
    this.cx.stroke();
  }
  drawParticle(particle: Particle, opacity: number) {
    this.cx.beginPath();
    const startColor = { r: 5, g: 169, b: 133 };
    const endColor = { r: 255, g: 255, b: 255 };
    const red = (endColor.r - startColor.r) * particle.y / this.canvasHeight + startColor.r;
    const green = (endColor.g - startColor.g) * particle.y / this.canvasHeight + startColor.g;
    const blue = (endColor.b - startColor.b) * particle.y / this.canvasHeight + startColor.b;
    this.cx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ', ' + opacity + ')';
    this.cx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
    this.cx.fill();
    // this.cx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }

}

interface Particle {
  closest: any[];
  id: string;
  orginX: number;
  orginY: number;
  x: number;
  y: number;
  size: number;
  to: any;
}
