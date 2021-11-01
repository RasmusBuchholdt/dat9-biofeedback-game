import { ElementRef, Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';

import { Colors } from '../_models/color';
import { clamp } from '../_utils/clamp';
import { randomNumberInRange } from '../_utils/randomNumberInRange';
import { scaleNumberToRange } from '../_utils/scale-number-to-range';

@Injectable({
  providedIn: 'root'
})
export class KiwiGameEngineService {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private hemisphereLight: THREE.HemisphereLight;
  private shadowLight: THREE.DirectionalLight;

  private frameId: number = null;

  private floor: THREE.Object3D;
  private skyOptions: THREE.Object3D[] = [];
  private skyFirstHalf: THREE.Object3D;
  private skySecondHalf: THREE.Object3D;
  private plane: THREE.Object3D;
  private propeller: THREE.Object3D;

  private ascending = true;
  private previousValue: number;

  constructor(
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

  createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // Create the scene
    this.scene = new THREE.Scene();

    // Add a fog effect to the scene; same color as the
    // background color used in the style sheet
    this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    // Create the camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );

    // Set the position of the camera
    this.camera.position.x = 0;
    this.camera.position.z = 200;
    this.camera.position.y = 100;

    // Pre generate different sky options
    for (let i = 0; i < 5; i++) {
      this.skyOptions.push(this.createSky());
    }

    const selectedSky = this.skyOptions[randomNumberInRange(0, this.skyOptions.length)];
    this.skyFirstHalf = selectedSky;
    this.scene.add(selectedSky);

    this.createLights();
    this.createSea();
    this.createPlane()
  }

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

  private createSea(): void {
    let floor: THREE.Object3D;

    var geom = new THREE.PlaneGeometry(1000, 100);

    // create the material
    var mat = new THREE.MeshPhongMaterial({
      color: Colors.blue,
      transparent: true,
      opacity: 1,
      flatShading: true
    });

    // To create an object in Three.js, we have to create a mesh
    // which is a combination of a geometry and some material
    floor = new THREE.Mesh(geom, mat);

    // Allow the floor to receive shadows
    floor.receiveShadow = true;

    this.floor = floor;
    this.scene.add(floor);
  }

  private createSky(): THREE.Object3D {
    // Create an empty container
    let sky = new THREE.Object3D();

    // choose a number of clouds to be scattered in the sky
    let nClouds = 30;

    // To distribute the clouds consistently,
    // we need to place them according to a uniform angle
    var stepAngle = 2;

    // create the clouds
    for (var i = 0; i < nClouds; i++) {
      var c = this.createCloud();

      // set the rotation and the position of each cloud;
      // for that we use a bit of trigonometry
      var a = stepAngle * i; // this is the final angle of the cloud
      var h = 750 + Math.random() * 200; // this is the distance between the center of the axis and the cloud itself

      // Trigonometry!!! I hope you remember what you've learned in Math :)
      // in case you don't:
      // we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
      c.position.y = Math.sin(a) * h;
      c.position.x = Math.cos(a) * h;

      c.position.x = randomNumberInRange(1000, 3000)
      c.position.y = randomNumberInRange(200, 1000)

      // rotate the cloud according to its position
      c.rotation.z = a + Math.PI / 2;

      console.log(c.position);


      // for a better result, we position the clouds
      // at random depths inside of the scene
      c.position.z = -400 - Math.random() * 400;

      // we also set a random scale for each cloud
      var s = 1 + Math.random() * 2;
      c.scale.set(s, s, s);

      // do not forget to add the mesh of each cloud in the scene
      sky.add(c);
    }

    sky.position.y = -600;

    return sky;
  }

  private createCloud(): THREE.Object3D {
    // Create an empty container that will hold the different parts of the cloud
    let cloud = new THREE.Object3D();

    // create a cube geometry;
    // this shape will be duplicated to create the cloud
    var geom = new THREE.BoxGeometry(20, 20, 20);

    // create a material; a simple white material will do the trick
    var mat = new THREE.MeshPhongMaterial({
      color: Colors.white,
    });

    // duplicate the geometry a random number of times
    var nBlocs = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < nBlocs; i++) {

      // create the mesh by cloning the geometry
      var m = new THREE.Mesh(geom, mat);

      // set the position and the rotation of each cube randomly
      m.position.x = i * 15;
      m.position.y = Math.random() * 10;
      m.position.z = Math.random() * 10;
      m.rotation.z = Math.random() * Math.PI * 2;
      m.rotation.y = Math.random() * Math.PI * 2;

      // set the size of the cube randomly
      var s = .1 + Math.random() * .9;
      m.scale.set(s, s, s);

      // allow each cube to cast and to receive shadows
      m.castShadow = true;
      m.receiveShadow = true;

      // add the cube to the container we first created
      cloud.add(m);
    }

    return cloud;
  }

  private createPlane(): void {

    let plane = new THREE.Object3D();

    // Create the cabin
    var geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
    var matCockpit = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
    var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    plane.add(cockpit);

    // Create the engine
    var geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    var matEngine = new THREE.MeshPhongMaterial({ color: Colors.white, flatShading: true });
    var engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;
    plane.add(engine);

    // Create the tail
    var geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    var matTailPlane = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
    var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-35, 25, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    plane.add(tailPlane);

    // Create the wing
    var geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
    var matSideWing = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
    var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    plane.add(sideWing);

    // propeller
    var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    var matPropeller = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
    let propeller = new THREE.Mesh(geomPropeller, matPropeller);
    propeller.castShadow = true;
    propeller.receiveShadow = true;

    // blades
    var geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
    var matBlade = new THREE.MeshPhongMaterial({ color: Colors.brownDark, flatShading: true });

    var blade = new THREE.Mesh(geomBlade, matBlade);
    blade.position.set(8, 0, 0);
    blade.castShadow = true;
    blade.receiveShadow = true;
    propeller.add(blade);
    propeller.position.set(50, 0, 0);

    this.propeller = propeller;
    plane.add(propeller);

    plane.scale.set(.25, .25, .25);
    plane.position.y = 100;
    this.plane = plane;
    this.scene.add(plane);
  };

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

  private render(): void {
    this.skyFirstHalf.position.x -= 5;
    if (this.skySecondHalf) {
      this.skySecondHalf.position.x -= 5;
    }

    if (this.skySecondHalf?.position.x <= -4000) {
      this.scene.remove(this.skySecondHalf);
      // this.skySecondHalf.children.forEach(this.killObject);
      // this.skySecondHalf.clear();
    }

    if (this.skyFirstHalf.position.x <= -2000) {
      this.skySecondHalf = this.skyFirstHalf;
      const selectedSky = this.skyOptions[randomNumberInRange(0, this.skyOptions.length)];
      this.skyFirstHalf = selectedSky;
      this.scene.add(selectedSky);
    }

    // this.sky.rotation.z += .005;
    this.propeller.rotation.x += 0.3;

    if (this.previousValue) {
      const planeMovement = clamp(this.plane.position.y + (this.ascending ? 0.5 : -0.5), 25, 175);
      this.plane.position.y = planeMovement;
    }

    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    this.renderer.render(this.scene, this.camera);
  }

  public updatePlane(value: number): void {
    const target = scaleNumberToRange(value, 0, 100, 25, 175)
    this.plane.position.y = target;
  }

  public updatePlaneSmooth(value: number): void {
    if (this.previousValue === null)
      this.previousValue = value;
    this.ascending = value >= this.previousValue;
    this.previousValue = value;
  }

  private killObject(object: (THREE.Object3D | THREE.HemisphereLight | THREE.Mesh) & { isMesh: boolean, material: any, geometry: THREE.BoxGeometry }): void {
    object.clear();
    if (object.isMesh) {
      object.geometry.dispose()
      if (object.material.type == 'MeshBasicMaterial' || object.material.type == 'MeshPhongMaterial') {
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

  takeSceneScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL();
  }
}
