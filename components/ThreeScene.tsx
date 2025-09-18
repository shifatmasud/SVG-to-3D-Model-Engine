import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { createModelFromSVG } from '../services/svgTo3D';

interface ThreeSceneProps {
  svgData: string | null;
  extrusionDepth: number;
  bevelSegments: number;
  color: string;
  roughness: number;
  metalness: number;
  transmission: number;
  ior: number;
  thickness: number;
  isGlitchEffectEnabled: boolean;
}

export interface ThreeSceneRef {
  model: THREE.Group | null;
  animations: THREE.AnimationClip[];
}

const RGBShiftShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'amount': { value: 0.005 },
    'angle': { value: 0.0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float angle;
    varying vec2 vUv;
    void main() {
      vec2 offset = amount * vec2( cos(angle), sin(angle));
      vec4 r = texture2D(tDiffuse, vUv + offset);
      vec4 g = texture2D(tDiffuse, vUv);
      vec4 b = texture2D(tDiffuse, vUv - offset);
      gl_FragColor = vec4(r.r, g.g, b.b, g.a);
    }`
};

const ThreeScene = forwardRef<ThreeSceneRef, ThreeSceneProps>(({ 
  svgData, 
  extrusionDepth, 
  bevelSegments,
  color, 
  roughness, 
  metalness, 
  transmission,
  ior,
  thickness,
  isGlitchEffectEnabled,
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationsRef = useRef<THREE.AnimationClip[]>([]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const originalGeometriesRef = useRef(new Map<string, THREE.BufferGeometry>());
  
  // Refs for post-processing
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const rgbShiftPassRef = useRef<ShaderPass | null>(null);


  useImperativeHandle(ref, () => ({
    model: modelRef.current,
    animations: animationsRef.current,
  }), []);
  
  // Effect for updating material properties
  useEffect(() => {
    if (modelRef.current) {
        modelRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const material = object.material as THREE.MeshPhysicalMaterial;
                material.color.set(color).convertSRGBToLinear();
                material.roughness = roughness;
                material.metalness = metalness;
                material.transmission = transmission;
                material.ior = ior;
                material.thickness = thickness;
                material.transparent = transmission > 0;
                material.needsUpdate = true;
            }
        });
    }
  }, [color, roughness, metalness, transmission, ior, thickness]);

  // Effect for managing glitch animation and post-processing
  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;

    const removeGlitch = () => {
      // Stop animation
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      animationsRef.current = [];
      
      // Restore original geometry
      model.traverse((object) => {
        if (object instanceof THREE.Mesh && originalGeometriesRef.current.has(object.uuid)) {
          const originalGeo = originalGeometriesRef.current.get(object.uuid);
          object.geometry.dispose();
          if(originalGeo) object.geometry = originalGeo;
          object.morphTargetInfluences = [];
          object.morphTargetDictionary = {};
        }
      });
      originalGeometriesRef.current.clear();
      
      // Disable post-processing effects
      if(bloomPassRef.current) bloomPassRef.current.enabled = false;
      if(rgbShiftPassRef.current) rgbShiftPassRef.current.enabled = false;
    };

    const addGlitch = () => {
      const meshes: THREE.Mesh[] = [];
      originalGeometriesRef.current.clear();

      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.name = object.uuid;
          originalGeometriesRef.current.set(object.uuid, object.geometry);
          object.geometry = object.geometry.clone();
          meshes.push(object);
        }
      });
      if (meshes.length === 0) return;

      const bbox = new THREE.Box3().setFromObject(model);
      const size = bbox.getSize(new THREE.Vector3());
      const glitchStrength = Math.max(size.x / 15, 0.2);

      meshes.forEach(mesh => {
        const basePositions = mesh.geometry.attributes.position.array;
        const glitchedPositions = new Float32Array(basePositions.length);
        glitchedPositions.set(basePositions); // Start with a copy

        // Effect 1: Horizontal Slice Jitter
        for (let i = 0; i < basePositions.length; i += 3) {
            if (Math.random() > 0.9) {
                const y = basePositions[i + 1];
                const sliceOffset = (Math.random() - 0.5) * glitchStrength * Math.sin(y * 0.1);
                glitchedPositions[i] += sliceOffset;
            }
        }

        // Effect 2: Fine-grained Per-vertex Noise
        for (let i = 0; i < basePositions.length; i += 3) {
            if (Math.random() > 0.98) {
                 const x = basePositions[i];
                 const y = basePositions[i + 1];
                 const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
                 glitchedPositions[i] += ((hash - Math.floor(hash)) * 2.0 - 1.0) * glitchStrength * 0.3;
                 glitchedPositions[i + 1] += (Math.sin(hash) * 2.0 - 1.0) * glitchStrength * 0.3;
            }
        }
        
        // Effect 3: Blocky Data Corruption
        if (Math.random() > 0.7) { // 30% chance of a block glitch per mesh
            const blockCenter = new THREE.Vector3(
                (Math.random() - 0.5) * size.x,
                (Math.random() - 0.5) * size.y,
                (Math.random() - 0.5) * size.z,
            );
            const blockRadius = Math.random() * size.length() * 0.1;
            const blockOffset = new THREE.Vector3(
                (Math.random() - 0.5) * glitchStrength * 2,
                (Math.random() - 0.5) * glitchStrength,
                0
            );
            for (let i = 0; i < basePositions.length; i+=3) {
                const pos = new THREE.Vector3(basePositions[i], basePositions[i+1], basePositions[i+2]);
                if (pos.distanceTo(blockCenter) < blockRadius) {
                    glitchedPositions[i] += blockOffset.x;
                    glitchedPositions[i+1] += blockOffset.y;
                    glitchedPositions[i+2] += blockOffset.z;
                }
            }
        }

        // Effect 4: Wave Distortion
        for (let i = 0; i < basePositions.length; i+=3) {
            const y = basePositions[i+1];
            const waveOffset = Math.sin(y * 0.25 + 1.5) * glitchStrength * 0.5;
            glitchedPositions[i] += waveOffset;
        }
        
        mesh.geometry.morphAttributes.position = [new THREE.Float32BufferAttribute(glitchedPositions, 3)];
        mesh.updateMorphTargets();
      });

      const tracks = meshes.map(mesh => {
        const times =  [0, 0.2, 0.25, 0.3, 0.5, 0.55, 0.8, 0.85, 0.9, 1.1, 1.15, 1.4, 1.45, 1.5, 1.7, 1.75, 2.0];
        const values = [0, 0,   1.0,  0,   0,   0.8,  0,   1.0,  0.2, 0,   0.7,  0.1, 0.9,  0,   0,   0.6,  0];
        return new THREE.NumberKeyframeTrack(`${mesh.name}.morphTargetInfluences[0]`, times, values);
      });
      
      const clip = new THREE.AnimationClip('Glitch', 2, tracks);
      animationsRef.current = [clip];
      
      mixerRef.current = new THREE.AnimationMixer(model);
      const action = mixerRef.current.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity).play();
      
      // Enable post-processing effects
      if(bloomPassRef.current) bloomPassRef.current.enabled = true;
      if(rgbShiftPassRef.current) rgbShiftPassRef.current.enabled = true;
    };

    if (isGlitchEffectEnabled) {
      addGlitch();
    } else {
      removeGlitch();
    }

    return () => {
      removeGlitch();
    };
  }, [isGlitchEffectEnabled, modelRef.current]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171717); 

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Setup Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight), 0.4, 0.1, 0.1);
    bloomPass.enabled = false;
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;
    
    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.enabled = false;
    composer.addPass(rgbShiftPass);
    rgbShiftPassRef.current = rgbShiftPass;

    composerRef.current = composer;


    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-50, 50, -50);
    scene.add(directionalLight2);
    
    const gridHelper = new THREE.GridHelper(200, 50, 0x404040, 0x404040);
    scene.add(gridHelper);
    
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      const delta = clock.getDelta();
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      // Animate post-processing effects if they are enabled
      if (isGlitchEffectEnabled && rgbShiftPassRef.current) {
          const time = clock.getElapsedTime();
          rgbShiftPassRef.current.uniforms['amount'].value = Math.sin(time * 20) * 0.003 + 0.003;
          rgbShiftPassRef.current.uniforms['angle'].value = Math.sin(time * 5) * Math.PI;
      }

      composerRef.current?.render();
    };
    animate();

    const updateModel = () => {
        if (modelRef.current) {
            scene.remove(modelRef.current);
        }
        if (svgData) {
            const model = createModelFromSVG(svgData, extrusionDepth, bevelSegments, { color, roughness, metalness, transmission, ior, thickness });
            modelRef.current = model;
            scene.add(model);
            
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 1.5;
            
            camera.position.copy(center);
            camera.position.x += size.x / 4;
            camera.position.y += size.y / 4;
            camera.position.z += cameraZ;
            
            controls.target.copy(center);
            controls.update();
        } else {
            modelRef.current = null;
        }
    };
    
    updateModel();

    const handleResize = () => {
        if (mountRef.current) {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            composerRef.current?.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if(currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [svgData, extrusionDepth, bevelSegments]);

  return <div ref={mountRef} className="scene-view" />;
});

export default ThreeScene;