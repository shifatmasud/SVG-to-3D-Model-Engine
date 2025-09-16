
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createModelFromSVG } from '../services/svgTo3D';

interface ThreeSceneProps {
  svgData: string | null;
  extrusionDepth: number;
  color: string;
  roughness: number;
  metalness: number;
}

export interface ThreeSceneRef {
  model: THREE.Group | null;
}

const ThreeScene = forwardRef<ThreeSceneRef, ThreeSceneProps>(({ svgData, extrusionDepth, color, roughness, metalness }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useImperativeHandle(ref, () => ({
    get model() {
      return modelRef.current;
    }
  }), []);
  
  // Effect for updating material properties
  useEffect(() => {
    if (modelRef.current) {
        modelRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const material = object.material as THREE.MeshStandardMaterial;
                material.color.set(color).convertSRGBToLinear();
                material.roughness = roughness;
                material.metalness = metalness;
            }
        });
    }
  }, [color, roughness, metalness]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2d3748); // bg-gray-700

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 50;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    
    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-50, 50, -50);
    scene.add(directionalLight2);
    
    // Grid Helper
    const gridHelper = new THREE.GridHelper(200, 50, 0x4a5568, 0x4a5568); // gray-600
    scene.add(gridHelper);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const updateModel = () => {
        if (modelRef.current) {
            scene.remove(modelRef.current);
            // Proper disposal would go here
        }

        if (svgData) {
            const model = createModelFromSVG(svgData, extrusionDepth, { color, roughness, metalness });
            modelRef.current = model;
            scene.add(model);
            
            // Center camera on model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 1.5; // zoom out a bit
            
            camera.position.copy(center);
            camera.position.x += size.x / 4;
            camera.position.y += size.y / 4;
            camera.position.z += cameraZ;
            
            controls.target.copy(center);
            controls.update();
        }
    };
    
    updateModel();

    // Handle resize
    const handleResize = () => {
        if (mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if(currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // You would also dispose of geometries and materials here for a full cleanup
    };
  }, [svgData, extrusionDepth]);

  return <div ref={mountRef} className="w-full h-full" />;
});

export default ThreeScene;
