import { cleanMaterial } from './clean-material';

export function killObject(object: (THREE.Object3D | THREE.HemisphereLight | THREE.Mesh) & { isMesh: boolean, material: any, geometry: THREE.BoxGeometry }): void {
  object.clear();
  if (object.isMesh) {
    object.geometry.dispose()
    if (object.material.type == 'MeshBasicMaterial' || object.material.type == 'MeshPhongMaterial') {
      return;
    }
    if (object.material.isMaterial) {
      cleanMaterial(object.material)
    } else {
      for (const material of object.material) cleanMaterial(material)
    }
  }
}
