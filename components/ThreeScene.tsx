import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { createModelFromSVG } from '../services/svgTo3D';
import * as styles from '../styles';

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
  isBloomEffectEnabled: boolean;
  isPixelationEffectEnabled: boolean;
  isChromaticAberrationEnabled: boolean;
  isScanLinesEnabled: boolean;
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
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: `
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

const PixelationShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'pixelSize': { value: 8.0 },
        'resolution': { value: new THREE.Vector2() },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float pixelSize;
        uniform vec2 resolution;
        varying vec2 vUv;
        void main() {
            vec2 newUv = floor(vUv * resolution / pixelSize) * pixelSize / resolution;
            gl_FragColor = texture2D(tDiffuse, newUv);
        }`
};

const ScanLineShader = {
    uniforms: {
        'tDiffuse': { value: null },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
            vec4 originalColor = texture2D(tDiffuse, vUv);
            float lineFactor = 400.0;
            float intensity = sin(vUv.y * lineFactor);
            vec3 scanLineColor = originalColor.rgb * (1.0 - 0.15 * pow(intensity, 2.0));
            gl_FragColor = vec4(scanLineColor, originalColor.a);
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
  isBloomEffectEnabled,
  isPixelationEffectEnabled,
  isChromaticAberrationEnabled,
  isScanLinesEnabled,
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationsRef = useRef<THREE.AnimationClip[]>([]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const originalGeometriesRef = useRef(new Map<string, THREE.BufferGeometry>());
  
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const rgbShiftPassRef = useRef<ShaderPass | null>(null);
  const pixelationPassRef = useRef<ShaderPass | null>(null);
  const scanLinesPassRef = useRef<ShaderPass | null>(null);


  useImperativeHandle(ref, () => ({
    model: modelRef.current,
    animations: animationsRef.current,
  }), []);
  
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

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;

    const removeGlitch = () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      animationsRef.current = [];
      
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
      
      if (rgbShiftPassRef.current && isChromaticAberrationEnabled) {
        rgbShiftPassRef.current.uniforms['amount'].value = 0.0035;
        rgbShiftPassRef.current.uniforms['angle'].value = 0.5;
      }
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
        glitchedPositions.set(basePositions);
        
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
    };

    if (isGlitchEffectEnabled) {
      addGlitch();
    } else {
      removeGlitch();
    }

    return () => {
      removeGlitch();
    };
  }, [isGlitchEffectEnabled, modelRef.current, isChromaticAberrationEnabled]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(styles.colors.background); 

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    // Add all passes, keep refs to them
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight), 0.4, 0.1, 0.1);
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;
    
    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    composer.addPass(rgbShiftPass);
    rgbShiftPassRef.current = rgbShiftPass;

    const pixelationPass = new ShaderPass(PixelationShader);
    pixelationPass.uniforms['resolution'].value.set(currentMount.clientWidth, currentMount.clientHeight);
    composer.addPass(pixelationPass);
    pixelationPassRef.current = pixelationPass;

    const scanLinesPass = new ShaderPass(ScanLineShader);
    composer.addPass(scanLinesPass);
    scanLinesPassRef.current = scanLinesPass;

    composerRef.current = composer;


    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-50, 50, -50);
    scene.add(directionalLight2);
    
    const gridHelper = new THREE.GridHelper(200, 50, 0x222222, 0x222222);
    scene.add(gridHelper);
    
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      const delta = clock.getDelta();
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
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

            if (pixelationPassRef.current) {
              pixelationPassRef.current.uniforms['resolution'].value.set(width, height);
            }
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
  
  // Hooks to toggle individual effect passes
  useEffect(() => {
    if (bloomPassRef.current) {
        bloomPassRef.current.enabled = isBloomEffectEnabled;
    }
  }, [isBloomEffectEnabled]);

  useEffect(() => {
    if (rgbShiftPassRef.current) {
        const shouldBeEnabled = isGlitchEffectEnabled || isChromaticAberrationEnabled;
        rgbShiftPassRef.current.enabled = shouldBeEnabled;

        if (isChromaticAberrationEnabled && !isGlitchEffectEnabled) {
            rgbShiftPassRef.current.uniforms['amount'].value = 0.0035;
            rgbShiftPassRef.current.uniforms['angle'].value = 0.5;
        }
    }
  }, [isChromaticAberrationEnabled, isGlitchEffectEnabled]);

  useEffect(() => {
    if (pixelationPassRef.current) {
        pixelationPassRef.current.enabled = isPixelationEffectEnabled;
    }
  }, [isPixelationEffectEnabled]);

  useEffect(() => {
    if (scanLinesPassRef.current) {
        scanLinesPassRef.current.enabled = isScanLinesEnabled;
    }
  }, [isScanLinesEnabled]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
});

export default ThreeScene;