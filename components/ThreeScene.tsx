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
  // Material
  color: string;
  roughness: number;
  metalness: number;
  transmission: number;
  ior: number;
  thickness: number;
  // Scene
  lightingPreset: string;
  backgroundColor: string;
  isGridVisible: boolean;
  // Effects
  isGlitchEffectEnabled: boolean;
  isBloomEffectEnabled: boolean;
  isPixelationEffectEnabled: boolean;
  isChromaticAberrationEnabled: boolean;
  isScanLinesEnabled: boolean;
}

export interface ThreeSceneRef {
  getModel: () => THREE.Group | null;
  getAnimations: () => THREE.AnimationClip[];
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
  lightingPreset,
  backgroundColor,
  isGridVisible,
  isGlitchEffectEnabled,
  isBloomEffectEnabled,
  isPixelationEffectEnabled,
  isChromaticAberrationEnabled,
  isScanLinesEnabled,
}, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    
    // Core object refs
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const clockRef = useRef<THREE.Clock | null>(null);

    // Scene content refs
    const modelRef = useRef<THREE.Group | null>(null);
    const lightsRef = useRef<THREE.Group | null>(null);
    const gridHelperRef = useRef<THREE.GridHelper | null>(null);

    // Effect pass refs
    const bloomPassRef = useRef<UnrealBloomPass | null>(null);
    const rgbShiftPassRef = useRef<ShaderPass | null>(null);
    const pixelationPassRef = useRef<ShaderPass | null>(null);
    const scanLinesPassRef = useRef<ShaderPass | null>(null);

    // Animation refs
    const animationsRef = useRef<THREE.AnimationClip[]>([]);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const originalGeometriesRef = useRef(new Map<string, THREE.BufferGeometry>());
    
    // Ref for state inside animation loop
    const isGlitchEffectEnabledRef = useRef(isGlitchEffectEnabled);
    useEffect(() => {
        isGlitchEffectEnabledRef.current = isGlitchEffectEnabled;
    }, [isGlitchEffectEnabled]);

    useImperativeHandle(ref, () => ({
        getModel: () => modelRef.current,
        getAnimations: () => animationsRef.current,
    }), []);

    // Effect 1: Initialize Scene, Renderer, Composer, and Animation Loop (runs once)
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        clockRef.current = new THREE.Clock();

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 50;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;
        
        const composer = new EffectComposer(renderer);
        composerRef.current = composer;
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

        const lights = new THREE.Group();
        lightsRef.current = lights;
        scene.add(lights);
        
        const gridHelper = new THREE.GridHelper(200, 50, 0x222222, 0x222222);
        gridHelperRef.current = gridHelper;
        scene.add(gridHelper);
        
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            const clock = clockRef.current;
            if (clock) {
                const delta = clock.getDelta();
                if (mixerRef.current) {
                    mixerRef.current.update(delta);
                }
                if (isGlitchEffectEnabledRef.current && rgbShiftPassRef.current) {
                    const time = clock.getElapsedTime();
                    rgbShiftPassRef.current.uniforms['amount'].value = Math.sin(time * 20) * 0.003 + 0.003;
                    rgbShiftPassRef.current.uniforms['angle'].value = Math.sin(time * 5) * Math.PI;
                }
            }
            composer.render();
        };
        animate();

        const handleResize = () => {
            if (mountRef.current) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                composer.setSize(width, height);
                if (pixelationPassRef.current) {
                    pixelationPassRef.current.uniforms['resolution'].value.set(width, height);
                }
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if(currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // Effect 2: Update Model based on SVG data and geometry props
    useEffect(() => {
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!scene || !camera || !controls) return;

        if (modelRef.current) {
            scene.remove(modelRef.current);
            // In a larger app, you'd dispose geometries and materials here
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
    }, [svgData, extrusionDepth, bevelSegments]);

    // Effect 3: Update material properties
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

    // Effect 4: Handle Glitch effect logic (re-runs when model is rebuilt)
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

        return () => removeGlitch();
    }, [isGlitchEffectEnabled, isChromaticAberrationEnabled, svgData, extrusionDepth, bevelSegments]);

    // Effects for toggling individual passes
    useEffect(() => { if (bloomPassRef.current) bloomPassRef.current.enabled = isBloomEffectEnabled; }, [isBloomEffectEnabled]);
    useEffect(() => { if (pixelationPassRef.current) pixelationPassRef.current.enabled = isPixelationEffectEnabled; }, [isPixelationEffectEnabled]);
    useEffect(() => { if (scanLinesPassRef.current) scanLinesPassRef.current.enabled = isScanLinesEnabled; }, [isScanLinesEnabled]);

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

    // Effects for scene settings
    useEffect(() => {
        const lights = lightsRef.current;
        if (!lights) return;

        while (lights.children.length > 0) {
            lights.remove(lights.children[0]);
        }

        if (lightingPreset === 'studio') {
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(50, 50, 50);
            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
            directionalLight2.position.set(-50, 50, -50);
            lights.add(ambientLight, directionalLight, directionalLight2);
        } else if (lightingPreset === 'dramatic') {
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            const keyLight = new THREE.SpotLight(0xffffff, 2.5, 300, Math.PI / 4, 0.5);
            keyLight.position.set(60, 80, 40);
            const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
            fillLight.position.set(-50, 30, 20);
            const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
            rimLight.position.set(-30, 40, -80);
            lights.add(ambientLight, keyLight, fillLight, rimLight);
        } else if (lightingPreset === 'soft') {
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
            hemisphereLight.position.set(0, 100, 0);
            lights.add(ambientLight, hemisphereLight);
        }
    }, [lightingPreset]);

    useEffect(() => { if (sceneRef.current) sceneRef.current.background = new THREE.Color(backgroundColor); }, [backgroundColor]);
    useEffect(() => { if (gridHelperRef.current) gridHelperRef.current.visible = isGridVisible; }, [isGridVisible]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
});

export default ThreeScene;
