
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

interface MaterialProps {
    color: string;
    roughness: number;
    metalness: number;
}

export const createModelFromSVG = (svgString: string, extrusionDepth: number, materialProps: MaterialProps): THREE.Group => {
  const loader = new SVGLoader();
  const data = loader.parse(svgString);

  const group = new THREE.Group();
  const extrudeSettings = {
    depth: extrusionDepth,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.5,
    bevelSegments: 2,
  };

  data.paths.forEach((path) => {
    const fillColor = path.userData?.style?.fill;
    
    // Use provided material props, but fall back to SVG fill color if it exists
    const initialColor = (fillColor && fillColor !== 'none') ? fillColor : materialProps.color;

    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(initialColor).convertSRGBToLinear(),
        roughness: materialProps.roughness,
        metalness: materialProps.metalness,
        side: THREE.DoubleSide,
    });

    if (path.userData?.style?.fill !== 'none' && path.userData?.style?.fill !== undefined) {
      const shapes = SVGLoader.createShapes(path);

      shapes.forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      });
    }
    
    // Strokes can be complex and often don't extrude well. 
    // Focusing on filled shapes provides a more robust result for this tool.
    // If stroke support is needed, a different approach like TubeGeometry might be better.
  });
  
  // The SVG loader parses coordinates with Y pointing down, we need to flip it for 3D
  group.scale.y *= -1;

  // Center the model
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);

  return group;
};
