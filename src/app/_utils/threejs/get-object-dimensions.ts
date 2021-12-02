import { ObjectDimensions } from 'src/app/_models/object-dimensions';
import * as THREE from 'three';

export function getObjectDimensions(object: THREE.Object3D): ObjectDimensions {
  var bbox = new THREE.Box3().setFromObject(object);
  return {
    depth: bbox.max.z - bbox.min.z,
    height: bbox.max.y - bbox.min.y,
    width: bbox.max.x - bbox.min.x
  }
}
