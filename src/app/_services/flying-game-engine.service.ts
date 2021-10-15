import { ElementRef, Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class FlyingGameEngineService {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private hemisphereLight: THREE.HemisphereLight;
  private shadowLight: THREE.DirectionalLight;

  private fieldOfView;
  private aspectRatio;
  private nearPlane;
  private farPlane;
  private HEIGHT;
  private WIDTH;

  private sea: THREE.Object3D;

  private frameId: number = null;

  public constructor(
    private ngZone: NgZone
  ) { }

  stopGame(): void {
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

  initialize(canvas: ElementRef<HTMLCanvasElement>): void {
    // set up the scene, the camera and the renderer
    this.createScene(canvas);

    // // add the lights
    this.createLights();

    // // add the objects
    // createPlane();
    // createSea();
    // createSky();

    // // start a loop that will update the objects' positions
    // // and render the scene on each frame
    // loop();
  }


  private createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // Set the canvas
    this.canvas = canvas.nativeElement;

    // Get the width and the height of the screen,
    // use them to set up the aspect ratio of the camera
    // and the size of the renderer.
    this.HEIGHT = window.innerHeight;
    this.WIDTH = window.innerWidth;

    // Create the scene
    this.scene = new THREE.Scene();

    // Add a fog effect to the scene; same color as the
    // background color used in the style sheet
    this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    // Create the camera
    this.aspectRatio = this.WIDTH / this.HEIGHT;
    this.fieldOfView = 60;
    this.nearPlane = 1;
    this.farPlane = 10000;
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      this.aspectRatio,
      this.nearPlane,
      this.farPlane
    );

    // Set the position of the camera
    this.camera.position.x = 0;
    this.camera.position.z = 200;
    this.camera.position.y = 100;

    // Create the renderer
    this.renderer = new THREE.WebGLRenderer({
      // Set the canvas
      canvas: this.canvas,
      // Allow transparency to show the gradient background
      // we defined in the CSS
      alpha: true,

      // Activate the anti-aliasing; this is less performant,
      // but, as our project is low-poly based, it should be fine :)
      antialias: true
    });

    // Define the size of the renderer; in this case,
    // it will fill the entire screen
    this.renderer.setSize(this.WIDTH, this.HEIGHT);

    // Listen to the screen: if the user resizes it
    // we have to update the camera and the renderer size
    window.addEventListener('resize', this.handleWindowResize, false);
  }

  // private createSea(): void {
  //   // create the geometry (shape) of the cylinder;
  //   // the parameters are:
  //   // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  //   var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);

  //   // rotate the geometry on the x axis
  //   geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  //   // create the material
  //   var mat = new THREE.MeshPhongMaterial({
  //     color: 'blue',
  //     transparent: true,
  //     opacity: .6,
  //     shading: new THREE.FlatShading,
  //   });

  //   // To create an object in Three.js, we have to create a mesh
  //   // which is a combination of a geometry and some material
  //   this.mesh = new THREE.Mesh(geom, mat);

  //   // Allow the sea to receive shadows
  //   this.mesh.receiveShadow = true;
  // }

  private createLights(): void {
    // A hemisphere light is a gradient colored light;
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intensity of the light
    this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    this.shadowLight = new THREE.DirectionalLight(0xffffff, .9);

    // Set the direction of the light
    this.shadowLight.position.set(150, 350, 350);

    // Allow shadow casting
    this.shadowLight.castShadow = true;

    // define the visible area of the projected shadow
    this.shadowLight.shadow.camera.left = -400;
    this.shadowLight.shadow.camera.right = 400;
    this.shadowLight.shadow.camera.top = 400;
    this.shadowLight.shadow.camera.bottom = -400;
    this.shadowLight.shadow.camera.near = 1;
    this.shadowLight.shadow.camera.far = 1000;

    // define the resolution of the shadow; the higher the better,
    // but also the more expensive and less performant
    this.shadowLight.shadow.mapSize.width = 2048;
    this.shadowLight.shadow.mapSize.height = 2048;

    // to activate the lights, just add them to the scene
    this.scene.add(this.hemisphereLight);
    this.scene.add(this.shadowLight);
  }

  private handleWindowResize() {
    // update height and width of the renderer and the camera
    this.HEIGHT = window.innerHeight;
    this.WIDTH = window.innerWidth;
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.camera.aspect = this.WIDTH / this.HEIGHT;
    this.camera.updateProjectionMatrix();
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
}
