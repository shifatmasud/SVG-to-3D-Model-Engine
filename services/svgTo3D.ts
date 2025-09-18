

import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

interface MaterialProps {
    color: string;
    roughness: number;
    metalness: number;
    transmission: number;
    ior: number;
    thickness: number;
}

export const createModelFromSVG = (svgString: string, extrusionDepth: number, bevelSegments: number, materialProps: MaterialProps): THREE.Group => {
  const loader = new SVGLoader();
  const data = loader.parse(svgString);

  const group = new THREE.Group();
  const extrudeSettings = {
    depth: extrusionDepth,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.5,
    bevelSegments: bevelSegments,
  };

  data.paths.forEach((path) => {
    const fillColor = path.userData?.style?.fill;
    
    const initialColor = (fillColor && fillColor !== 'none') ? fillColor : materialProps.color;

    const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(initialColor),
        roughness: materialProps.roughness,
        metalness: materialProps.metalness,
        side: THREE.DoubleSide,
        transmission: materialProps.transmission,
        ior: materialProps.ior,
        thickness: materialProps.thickness,
    });
    // FIX: The 'morphTargets' property must be set on the material instance, not in the constructor.
    material.morphTargets = true;
    material.color.convertSRGBToLinear();

    if (path.userData?.style?.fill !== 'none' && path.userData?.style?.fill !== undefined) {
      const shapes = SVGLoader.createShapes(path);

      shapes.forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      });
    }
  });
  
  group.scale.y *= -1;

  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);

  return group;
};