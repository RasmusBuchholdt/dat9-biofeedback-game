import { ElementRef, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as THREE from 'three';

import {
  CoinCollectDistanceTolerance,
  CoinsDistance,
  CoinsPerSpawn,
  Colors,
  FloorHeight,
  MaxCharacterY,
  MaxSkyY,
  MinCharacterY,
  MinSkyY,
  Speed,
} from '../../_models/games/kiwi-game';
import { ObjectDimensions } from '../../_models/object-dimensions';
import { clamp } from '../../_utils/clamp';
import { randomNumberInRange } from '../../_utils/randomNumberInRange';
import { scaleNumberToRange } from '../../_utils/scale-number-to-range';

@Injectable({
  providedIn: 'root'
})
export class CoinCollectorGameEngineService {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private listener: THREE.AudioListener;
  private sound: THREE.Audio;
  private clock = new THREE.Clock();

  private hemisphereLight: THREE.HemisphereLight;
  private shadowLight: THREE.DirectionalLight;

  private frameId: number = null;

  private floor: THREE.Object3D;
  private skyOptions: THREE.Object3D[] = [];
  private skyFirstHalf: THREE.Object3D;
  private skySecondHalf: THREE.Object3D;
  private character: THREE.Object3D;
  private propeller: THREE.Object3D;
  private activeCoins: THREE.Object3D[] = [];

  private ascending = true;
  private previousValue: number;

  private coinOuterGeometry = new THREE.CircleGeometry(3.25, 20);
  private coinOuterMaterial = new THREE.MeshPhongMaterial({
    color: Colors.black
  });

  private coinInnerGeometry = new THREE.CircleGeometry(3, 20);
  private coinInnerMaterial = new THREE.MeshPhongMaterial({
    color: Colors.yellow,
    shininess: 0,
    specular: 0xffffff,
    flatShading: true
  });

  coinsCollected$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private characterDimensions: ObjectDimensions | null = null;
  private coinsRespawnInternal = 0;

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
      this.skyOptions.push(this.createSky(15));
    }

    const selectedSky = this.skyOptions[randomNumberInRange(0, this.skyOptions.length - 1)].clone();
    this.skyFirstHalf = selectedSky;
    this.scene.add(selectedSky);

    this.setupSounds();

    this.createLights();
    this.createFloor();
    this.createCharacter();

    this.spawnCoins(CoinsPerSpawn);
  }

  private createLights(): void {
    // A hemisphere light is a gradient colored light;
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intensity of the light
    this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)
    this.hemisphereLight.name = 'Hemisphere light';

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    this.shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    this.shadowLight.name = 'Shadow light';

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

  private createFloor(): void {
    let floor: THREE.Object3D;

    let geom = new THREE.PlaneGeometry(1000, FloorHeight);
    let mat = new THREE.MeshPhongMaterial({
      color: Colors.green,
      transparent: true,
      opacity: 1,
      flatShading: true
    });
    floor = new THREE.Mesh(geom, mat);
    floor.receiveShadow = true;
    floor.name = 'Floor';
    this.floor = floor;
    this.scene.add(floor);
  }

  private setupSounds(): void {
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    this.sound = new THREE.Audio(this.listener);

    new THREE.AudioLoader().load('assets/sounds/coin.ogg', (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setVolume(0.5);
    });
  }


  private createSky(amount: number): THREE.Object3D {
    let sky = new THREE.Object3D();
    sky.name = 'Sky';

    // To distribute the clouds consistently,
    // we need to place them according to a uniform angle
    var stepAngle = 2;

    for (let i = 0; i < amount; i++) {
      let cloud = this.createCloud();

      // set the rotation and the position of each cloud;
      // for that we use a bit of trigonometry
      let a = stepAngle * i; // this is the final angle of the cloud
      let h = 750 + Math.random() * 200; // this is the distance between the center of the axis and the cloud itself

      // Trigonometry!!! I hope you remember what you've learned in Math :)
      // in case you don't:
      // we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
      cloud.position.y = Math.sin(a) * h;
      cloud.position.x = Math.cos(a) * h;

      cloud.position.x = randomNumberInRange(1200, 3000);
      cloud.position.y = randomNumberInRange(MinSkyY, MaxSkyY);

      // rotate the cloud according to its position
      cloud.rotation.z = a + Math.PI / 2;

      // for a better result, we position the clouds
      // at random depths inside of the scene
      cloud.position.z = -400 - Math.random() * 400;

      // we also set a random scale for each cloud
      let s = 1 + Math.random() * 2;
      cloud.scale.set(s, s, s);

      // do not forget to add the mesh of each cloud in the scene
      sky.add(cloud);
    }

    sky.position.y = -600;

    return sky;
  }

  private createCloud(): THREE.Object3D {
    let cloud = new THREE.Object3D();
    cloud.name = 'Cloud';

    let geom = new THREE.BoxGeometry(20, 20, 20);
    let mat = new THREE.MeshPhongMaterial({
      color: Colors.white,
    });

    let nBlocs = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < nBlocs; i++) {

      // create the mesh by cloning the geometry
      let mesh = new THREE.Mesh(geom, mat);
      mesh.name = 'Block';

      // set the position and the rotation of each cube randomly
      mesh.position.x = i * 15;
      mesh.position.y = Math.random() * 10;
      mesh.position.z = Math.random() * 10;
      mesh.rotation.z = Math.random() * Math.PI * 2;
      mesh.rotation.y = Math.random() * Math.PI * 2;

      // set the size of the cube randomly
      let s = .1 + Math.random() * .9;
      mesh.scale.set(s, s, s);

      // allow each cube to cast and to receive shadows
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // add the cube to the container we first created
      cloud.add(mesh);
    }

    return cloud;
  }

  private createCharacter(): void {
    let character = new THREE.Object3D();
    character.name = 'Character';

    // Create the cabin
    let geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
    let matCockpit = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
    let cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    character.add(cockpit);

    // Create the engine
    let geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    let matEngine = new THREE.MeshPhongMaterial({ color: Colors.white, flatShading: true });
    let engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;
    character.add(engine);

    // Create the tail
    let geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    let matTailPlane = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
    let tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-35, 25, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    character.add(tailPlane);

    // Create the wing
    let geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
    let matSideWing = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
    let sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    character.add(sideWing);

    // propeller
    let geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    let matPropeller = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
    let propeller = new THREE.Mesh(geomPropeller, matPropeller);
    propeller.castShadow = true;
    propeller.receiveShadow = true;

    // blades
    let geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
    let matBlade = new THREE.MeshPhongMaterial({ color: Colors.brownDark, flatShading: true });

    let blade = new THREE.Mesh(geomBlade, matBlade);
    blade.position.set(8, 0, 0);
    blade.castShadow = true;
    blade.receiveShadow = true;
    propeller.add(blade);
    propeller.position.set(50, 0, 0);

    this.propeller = propeller;
    character.add(propeller);

    character.scale.set(.25, .25, .25);

    this.character = character;
    this.characterDimensions = this.getObjectDimensions(character);

    this.scene.add(character);
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

  private spawnCoins(amount: number): void {
    this.activeCoins = [];
    if (Math.random() < 0.5) {
      this.createCoinRow(amount);
    } else {
      this.createCoinSineWave(amount)
    }
  }

  private createCoinRow(amount: number): void {
    this.coinsRespawnInternal = Speed * 15;
    const startPositionY = randomNumberInRange(MinCharacterY, MaxCharacterY);
    for (var i = 0; i < amount; i++) {
      let coin = this.createCoin();
      // Always spawn the coins in a row with a bit space between them
      coin.position.x = 300 + i * CoinsDistance;
      coin.position.y = startPositionY;
      this.activeCoins.push(coin);
      this.scene.add(coin);
    }
  }

  private createCoin(): THREE.Object3D {
    let coin = new THREE.Object3D();
    coin.name = 'Coin';
    const innerMesh = new THREE.Mesh(this.coinInnerGeometry, this.coinInnerMaterial);
    const outerMesh = new THREE.Mesh(this.coinOuterGeometry, this.coinOuterMaterial);
    coin.add(innerMesh);
    coin.add(outerMesh);
    return coin;
  }

  private render(): void {
    this.updateSky();
    this.updateCoins();

    this.propeller.rotation.x += 0.3;

    // Every x seconds we spawn a new coin row
    if (this.clock.getElapsedTime() >= this.coinsRespawnInternal) {
      this.activeCoins.map(e => this.scene.remove(e));
      this.spawnCoins(CoinsPerSpawn);
      this.clock.start();
    }

    if (this.previousValue) {
      const planeMovement = clamp(this.character.position.y + (this.ascending ? 0.5 : -0.5), 25, 175);
      this.character.position.y = planeMovement;
    }

    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    this.renderer.render(this.scene, this.camera);
  }

  private updateCoins(): void {
    this.activeCoins.forEach(coin => {
      coin.position.x -= Speed / 2;
      const diffPos = this.character.position.clone().distanceToSquared(coin.position.clone());
      if (diffPos <= 0 + (this.characterDimensions.height * this.characterDimensions.width / 2) + CoinCollectDistanceTolerance) {
        this.activeCoins.splice(this.activeCoins.indexOf(coin, 0), 1);
        this.coinsCollected$.next(this.coinsCollected$.getValue() + 1);
        coin.clear();
        this.sound.play();
      }
    });
  }

  private updateSky(): void {
    // We keep moving the first half
    this.skyFirstHalf.position.x -= Speed;

    // If we have an active second half it needs to be moved as well
    if (this.skySecondHalf) {
      this.skySecondHalf.position.x -= Speed;
    }

    // Once the second half is out of the view we remove it from the scene
    if (this.skySecondHalf?.position.x <= -4000) {
      this.scene.remove(this.skySecondHalf);
      // this.skySecondHalf.children.forEach(this.killObject);
      // this.skySecondHalf.clear();
    }

    // Once the first half is over halfway through the view
    if (this.skyFirstHalf.position.x <= -2000) {
      // We move the reference to the second half
      this.skySecondHalf = this.skyFirstHalf;

      // Select a new random sky and asign to first half
      const selectedSky = this.skyOptions[randomNumberInRange(0, this.skyOptions.length - 1)].clone();
      this.skyFirstHalf = selectedSky;
      this.scene.add(selectedSky);
    }
  }

  public setCharacterPosition(value: number): void {
    const target = scaleNumberToRange(value, 0, 100, MinCharacterY, MaxCharacterY)
    this.character.position.y = target;
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

  private getObjectDimensions(object: THREE.Object3D): ObjectDimensions {
    var bbox = new THREE.Box3().setFromObject(object);
    return {
      depth: bbox.max.z - bbox.min.z,
      height: bbox.max.y - bbox.min.y,
      width: bbox.max.x - bbox.min.x
    }
  }

  private createCoinSineWave(length: number) {
    this.coinsRespawnInternal = Speed * 20;
    const height = MaxCharacterY + MaxCharacterY * 0.15;
    const amplitude = 80;
    const frequency = 100;
    const placeEvery = 100;

    let x = 300;
    let y = 300;
    let placed = 0;

    for (let i = 0; i < length * placeEvery; i++) {
      y = height / 2 + amplitude * Math.sin(x / frequency);
      x = x + 1;
      if (placed % placeEvery === 0) {
        let coin = this.createCoin();
        coin.position.x = x;
        coin.position.y = y;
        this.activeCoins.push(coin);
        this.scene.add(coin);
      }
      placed++;
    }
  }
}
