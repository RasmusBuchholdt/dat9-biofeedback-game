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

  private circleMaxValue = 3;
  private circleMinValue = 0.1;
  private biggestValue = 0;

  private innerCircle: THREE.Mesh;
  private outerCircle: THREE.Mesh;
  private maxValueCircle: THREE.Mesh;

  private frameId: number = null;

  public constructor(private ngZone: NgZone) {
  }

  public stopGame(): void {
    this.resetGame();
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.scene != null) {
      this.renderer.dispose();
      this.scene.children.forEach(this.killObject); // Remove children, but also their materials.
      this.scene.clear(); // This does remove all the children too, but does not dispose the materials (I think).
      this.scene = null;
    }
  }

  public resetGame(): void {
    this.circleMaxValue = 3;
    this.circleMinValue = 0.1;
    this.biggestValue = 0;
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x999999);

    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 5;
    this.scene.add(this.camera);

    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity = 1.5;
    this.light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    this.scene.add(this.light);

    this.addCircles();
  }

  private addCircles(): void {
    let geometry = new THREE.CircleGeometry(this.circleMaxValue, 32);
    let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.outerCircle = new THREE.Mesh(geometry, material);
    this.scene.add(this.outerCircle);

    geometry = new THREE.CircleGeometry(this.circleMinValue, 32);
    material = new THREE.MeshBasicMaterial({ color: 'green' });
    this.innerCircle = new THREE.Mesh(geometry, material);
    this.scene.add(this.innerCircle);
  }

  private scaleNumberRange(value: number, oldMin: number = 0, oldMax: number = 1, newMin: number, newMax: number) {
    return (((newMax - newMin) * (value - oldMin)) / (oldMax - oldMin)) + newMin;
  }

  public setInnerCircle(value: number) {
    const scaledValue = this.scaleNumberRange(value, 0, 100, this.circleMinValue, this.circleMaxValue);
    let geometry = new THREE.CircleGeometry(scaledValue, 32);
    let material = new THREE.MeshBasicMaterial({ color: 'green' });
    this.scene.remove(this.innerCircle);
    this.innerCircle = new THREE.Mesh(geometry, material);
    this.scene.add(this.innerCircle);

    if (scaledValue > this.biggestValue) this.adjustMaxValueCircle(scaledValue);
  }

  private adjustMaxValueCircle(value: number): void {
    this.biggestValue = value;
    let geometry = new THREE.CircleGeometry(value, 32);
    let material = new THREE.MeshBasicMaterial({ color: 'red' });
    this.scene.remove(this.maxValueCircle);
    this.maxValueCircle = new THREE.Mesh(geometry, material);
    this.scene.add(this.maxValueCircle);
  }

  public animate(): void {
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

  private render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    this.renderer.render(this.scene, this.camera);
  }

  private killObject(object: (THREE.Object3D | THREE.HemisphereLight | THREE.Mesh) & { isMesh: boolean, material: any, geometry: THREE.BoxGeometry }): void {
    object.clear();
    if (object.isMesh) {
      object.geometry.dispose()
      if (object.material.type == 'MeshBasicMaterial') {
        return;
      }
      if (object.material.isMaterial) {
        this.cleanMaterial(object.material)
      } else {
        for (const material of object.material) this.cleanMaterial(material)
      }
    }
  }

  private cleanMaterial(material: any): void {
    material.dispose()
    // dispose textures
    for (const key of Object.keys(material)) {
      const value = material[key]
      if (value && typeof value === 'object' && 'minFilter' in value) {
        value.dispose()
      }
    }
  }

  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public takeSceneScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL();
  }
}
