import { ElementRef, Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class RenderingEngineService {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.HemisphereLight;

  private increasing = true;
  private circleMaxValue = 3;
  private circleMinValue = 0.1;
  private currentInnerCicleSize = 0.1;
  private innerCircle: THREE.Mesh;
  private outerCircle: THREE.Mesh;

  private frameId: number = null;

  public constructor(private ngZone: NgZone) {
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x999999);

    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 5;
    this.scene.add(this.camera);

    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 1.5;
    this.light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    this.scene.add(this.light);

    this.addCircles();
  }

  private addCircles(): void {
    let geometry = new THREE.CircleGeometry(this.circleMaxValue, 64);
    let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.outerCircle = new THREE.Mesh(geometry, material);
    this.scene.add(this.outerCircle);

    geometry = new THREE.CircleGeometry(this.circleMinValue, 64);
    material = new THREE.MeshBasicMaterial({ color: 'green' });
    this.innerCircle = new THREE.Mesh(geometry, material);
    this.scene.add(this.innerCircle);
  }

  private adjustInnerCircle(): void {
    if (this.currentInnerCicleSize >= this.circleMaxValue) {
      this.increasing = false;
    } else if (!this.increasing && this.currentInnerCicleSize <= this.circleMinValue) {
      this.increasing = true;
    }
    this.currentInnerCicleSize += this.increasing ? 0.02 : -0.02;
    let geometry = new THREE.CircleGeometry(this.currentInnerCicleSize, 64);
    let material = new THREE.MeshBasicMaterial({ color: 'green' });
    this.scene.remove(this.innerCircle);
    this.innerCircle = new THREE.Mesh(geometry, material);
    this.scene.add(this.innerCircle);
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
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

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    this.adjustInnerCircle();
    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
