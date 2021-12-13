import { ElementRef, Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';
import { Clock, Loader, Mesh } from 'three';
import { scaleNumberToRange } from '../../_utils/scale-number-to-range';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { killObject } from 'src/app/_utils/threejs/kill-object';

@Injectable({
  providedIn: 'root'
})
export class BalloonEngineService {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private listener: THREE.AudioListener;
  private sound: THREE.Audio;
  private soundFlag = false;

  private frameId: number = null;

  // Particle rotation variables
  private clock: Clock;
  private particleMesh: THREE.Points;
  private particleRotation = 10;

  // Circle variables
  private circleMaxValue = 2.5;
  private circleMinValue = 0.1;
  private outerCircle: THREE.Line;
  private innerCircle: THREE.Mesh;
  private currentInnerCircleSize = 0.1;

  private guidanceCircle: THREE.Mesh;
  private guidanceCircleIncreasing = true;
  private guidanceCirclePausing = false;
  private guidanceCircleThreshold = 0.2;
  private currentGuidanceCircleSize = 0.1;

  private _guidance = false;

  public set guidance(value: boolean) {
    this._guidance = value;
  }

  constructor(
    private ngZone: NgZone
  ) { }

  stop(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.scene != null) {
      this.renderer.dispose();
      this.scene.children.forEach(killObject);
      this.scene.clear();
      this.scene = null;
    }
    this.guidance = false;
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#21282a');

    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 5;
    this.scene.add(this.camera);

    this.clock = new Clock();

    // Sound
    this.addSound();

    // Particles
    this.addParticles();

    // Circles
    this.addCircles();

  }

  private addSound() {
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    this.sound = new THREE.Audio(this.listener);

    new THREE.AudioLoader().load('assets/sounds/piano_pling.mp4', (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setVolume(0.5);
    });
  }

  private addParticles(): void {
    const particleGeometry = new THREE.BufferGeometry;
    const particlesCount = 200;

    // Set particle position
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Particle material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      //map: this.bloomAsset,
      map: this.createCircleTexture('#F0E68C', 256),
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
      transparent: true
    })

    // Set particle mesh
    this.particleMesh = new THREE.Points(particleGeometry, particlesMaterial);
    this.particleMesh.renderOrder = 100;
    this.particleMesh.name = 'Particles';
    this.scene.add(this.particleMesh);
  }

  private addCircles(): void {
    let geometry = new THREE.CircleGeometry(this.circleMaxValue, 50);
    let material = new THREE.LineBasicMaterial({
      color: '#F0E68C'
    });
    this.outerCircle = new THREE.Line(geometry, material);
    this.outerCircle.name = 'Border circle';
    this.scene.add(this.outerCircle);

    geometry = new THREE.CircleGeometry(this.circleMinValue, 50);
    let materialInner = new THREE.MeshBasicMaterial({ color: '#F0E68C' });
    this.innerCircle = new THREE.Mesh(geometry, materialInner);
    this.innerCircle.name = 'Indicator circle';
    this.scene.add(this.innerCircle);
  }

  private setParticleRotation(value: number) {
    const elapsedTime = this.clock.getElapsedTime();
    this.particleRotation = (.005 * value) + (elapsedTime * 0.05);
    //this.particleRotation = elapsedTime * 0.05;
  }

  setInnerCircle(value: number) {
    this.setParticleRotation(value);
    const scaledValue = scaleNumberToRange(value, 0, 100, this.circleMinValue, this.circleMaxValue);
    let geometry = new THREE.CircleGeometry(scaledValue, 32);
    let material = new THREE.MeshBasicMaterial({ color: '#F0E68C', opacity: 0.5, transparent: true });
    this.currentInnerCircleSize = scaledValue;

    if (scaledValue == this.circleMaxValue && !this.soundFlag) {
      if (this.sound.isPlaying) this.sound.stop();
      this.sound.play();
      this.soundFlag = true;
    } else if (scaledValue != this.circleMaxValue) {
      this.soundFlag = false;
    }

    this.scene.remove(this.innerCircle);
    this.innerCircle = new THREE.Mesh(geometry, material);
    this.innerCircle.renderOrder = 2;
    this.innerCircle.name = 'Indicator circle';
    this.scene.add(this.innerCircle);
  }

  animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }
      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  private adjustGuidanceCircle(): void {
    if (this.currentGuidanceCircleSize >= this.circleMaxValue) {
      this.guidanceCircleIncreasing = false;
    } else if (!this.guidanceCircleIncreasing && this.currentGuidanceCircleSize <= this.circleMinValue) {
      this.guidanceCircleIncreasing = true;
      this.guidanceCirclePausing = true;
      setTimeout(() => {
        this.guidanceCirclePausing = false;
      }, 2000);
    }
    if (!this.guidanceCirclePausing)
      this.setGuidanceCircle();
  }

  private setGuidanceCircle(): void {
    this.currentGuidanceCircleSize += this.guidanceCircleIncreasing ? 0.015 : -0.015;
    const difference = Math.abs(this.currentGuidanceCircleSize - this.currentInnerCircleSize);
    const color = difference <= this.guidanceCircleThreshold ? 'green' : '#6F1E51';
    let geometry = new THREE.CircleGeometry(this.currentGuidanceCircleSize, 64);
    let material = new THREE.MeshBasicMaterial({ color });
    this.scene.remove(this.guidanceCircle);
    this.guidanceCircle = new THREE.Mesh(geometry, material);
    this.guidanceCircle.renderOrder = 1;
    this.guidanceCircle.name = 'Guidance circle';
    this.scene.add(this.guidanceCircle);
  }

  private render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    // Particle render
    this.particleMesh.rotation.x = this.particleRotation;
    this.renderer.render(this.scene, this.camera);

    if (this._guidance)
      this.adjustGuidanceCircle();
  }

  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private createCircleTexture(color, size) {
    var matCanvas = document.createElement('canvas');
    matCanvas.width = matCanvas.height = size;
    var matContext = matCanvas.getContext('2d');
    // create texture object from canvas.
    var texture = new THREE.Texture(matCanvas);
    // Draw a circle
    var center = size / 2;
    matContext.beginPath();
    matContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
    matContext.closePath();
    matContext.fillStyle = color;
    matContext.fill();
    // need to set needsUpdate
    texture.needsUpdate = true;
    // return a texture made from the canvas
    return texture;
  }
}
