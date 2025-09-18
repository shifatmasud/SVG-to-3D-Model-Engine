import React, { useState, useCallback, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import ThreeScene, { ThreeSceneRef } from './components/ThreeScene';
import Loader from './components/Loader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as styles from './styles';
import VectorPenIcon from './components/icons/VectorPenIcon';

const GlobalStyles = () => (
  <style>{`
    :root {
      --color-accent: ${styles.colors.accent};
      --color-surface: ${styles.colors.surface};
      --color-background: ${styles.colors.background};
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: ${styles.typography.fontFamily};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: ${styles.colors.background};
      color: ${styles.colors.textPrimary};
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      background-size: cover;
      opacity: 0.98;
    }
    #root {
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    /* --- Custom Scrollbar --- */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.15);
      border-radius: ${styles.radii.full};
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255, 255, 255, 0.25);
    }
    /* --- Custom Range Slider --- */
    input[type=range] {
      -webkit-appearance: none; appearance: none;
      background: transparent; cursor: pointer; width: 100%;
    }
    input[type=range]:focus { outline: none; }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      margin-top: -6px;
      background-color: ${styles.colors.accent};
      height: 20px; width: 20px;
      border-radius: ${styles.radii.full};
      border: 3px solid ${styles.colors.background};
      box-shadow: 0 0 0 2px ${styles.colors.surface}, 0 0 8px ${styles.colors.accentGlow};
      transition: transform 150ms ease;
    }
    input[type=range]::-moz-range-thumb {
      background-color: ${styles.colors.accent};
      height: 14px; width: 14px; /* Adjusted for consistency */
      border-radius: ${styles.radii.full};
      border: 3px solid ${styles.colors.background};
      box-shadow: 0 0 0 2px ${styles.colors.surface}, 0 0 8px ${styles.colors.accentGlow};
      transition: transform 150ms ease;
    }
    input[type=range]:active::-webkit-slider-thumb { transform: scale(1.15); }
    input[type=range]:active::-moz-range-thumb { transform: scale(1.15); }

    input[type=range]::-webkit-slider-runnable-track {
      background: linear-gradient(to right, ${styles.colors.accent}, ${styles.colors.accent} var(--value-percent, 0%), rgba(255,255,255,0.1) var(--value-percent, 0%), rgba(255,255,255,0.1));
      border-radius: ${styles.radii.md}; height: 8px;
    }
    input[type=range]::-moz-range-track {
      background: linear-gradient(to right, ${styles.colors.accent}, ${styles.colors.accent} var(--value-percent, 0%), rgba(255,255,255,0.1) var(--value-percent, 0%), rgba(255,255,255,0.1));
      border-radius: ${styles.radii.md}; height: 8px;
    }
  `}</style>
);

const App: React.FC = () => {
  const [svgData, setSvgData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState<number>(0);

  // Model & Material properties state
  const [extrusion, setExtrusion] = useState<number>(10);
  const [bevelSegments, setBevelSegments] = useState<number>(2);
  const [color, setColor] = useState<string>('#cccccc');
  const [roughness, setRoughness] = useState<number>(0.5);
  const [metalness, setMetalness] = useState<number>(0.1);
  const [transmission, setTransmission] = useState<number>(0);
  const [ior, setIor] = useState<number>(1.5);
  const [thickness, setThickness] = useState<number>(0.5);

  // Scene properties state
  const [lightingPreset, setLightingPreset] = useState<string>('studio');
  const [backgroundColor, setBackgroundColor] = useState<string>('#0a0a0a');
  const [isGridVisible, setIsGridVisible] = useState<boolean>(true);

  // Special effects state
  const [isGlitchEffectEnabled, setIsGlitchEffectEnabled] = useState<boolean>(false);
  const [isBloomEffectEnabled, setIsBloomEffectEnabled] = useState<boolean>(false);
  const [isPixelationEffectEnabled, setIsPixelationEffectEnabled] = useState<boolean>(false);
  const [isChromaticAberrationEnabled, setIsChromaticAberrationEnabled] = useState<boolean>(false);
  const [isScanLinesEnabled, setIsScanLinesEnabled] = useState<boolean>(false);


  const sceneRef = useRef<ThreeSceneRef>(null);

  const handleFileLoad = useCallback((svgContent: string) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, "image/svg+xml");
        if (doc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("Invalid SVG file format.");
        }
        setSvgData(svgContent);
        setKey(prevKey => prevKey + 1);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(`Failed to process SVG: ${errorMessage}`);
        setSvgData(null);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  }, []);

  const handleClear = useCallback(() => {
    setSvgData(null);
    setError(null);
    // Reset all properties
    setColor('#cccccc');
    setRoughness(0.5);
    setMetalness(0.1);
    setTransmission(0);
    setIor(1.5);
    setThickness(0.5);
    setExtrusion(10);
    setBevelSegments(2);
    setLightingPreset('studio');
    setBackgroundColor('#0a0a0a');
    setIsGridVisible(true);
    setIsGlitchEffectEnabled(false);
    setIsBloomEffectEnabled(false);
    setIsPixelationEffectEnabled(false);
    setIsChromaticAberrationEnabled(false);
    setIsScanLinesEnabled(false);
    setKey(prevKey => prevKey + 1);
  }, []);

  const handleExport = () => {
    const model = sceneRef.current?.getModel();
    if (model) {
        const exporter = new GLTFExporter();
        const options = {
            animations: sceneRef.current?.getAnimations() || [],
            binary: true, // Export as a binary GLB file
        };
        exporter.parse(
            model,
            (gltf) => {
                // The result is an ArrayBuffer for binary GLB
                const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'model.glb';
                link.click();
            },
            (error) => {
                console.error('An error happened during parsing', error);
                alert("Could not export model. See console for details.");
            },
            options
        );
    }
  };

  return (
    <div style={appContainerStyle}>
      <GlobalStyles />
      <ControlPanel
        onFileLoad={handleFileLoad}
        onClear={handleClear}
        extrusion={extrusion}
        setExtrusion={setExtrusion}
        bevelSegments={bevelSegments}
        setBevelSegments={setBevelSegments}
        isLoading={isLoading}
        hasModel={!!svgData}
        error={error}
        // Material props
        color={color}
        setColor={setColor}
        roughness={roughness}
        setRoughness={setRoughness}
        metalness={metalness}
        setMetalness={setMetalness}
        transmission={transmission}
        setTransmission={setTransmission}
        ior={ior}
        setIor={setIor}
        thickness={thickness}
        setThickness={setThickness}
        // Scene props
        lightingPreset={lightingPreset}
        setLightingPreset={setLightingPreset}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        isGridVisible={isGridVisible}
        setIsGridVisible={setIsGridVisible}
        // Special Effects
        isGlitchEffectEnabled={isGlitchEffectEnabled}
        setIsGlitchEffectEnabled={setIsGlitchEffectEnabled}
        isBloomEffectEnabled={isBloomEffectEnabled}
        setIsBloomEffectEnabled={setIsBloomEffectEnabled}
        isPixelationEffectEnabled={isPixelationEffectEnabled}
        setIsPixelationEffectEnabled={setIsPixelationEffectEnabled}
        isChromaticAberrationEnabled={isChromaticAberrationEnabled}
        setIsChromaticAberrationEnabled={setIsChromaticAberrationEnabled}
        isScanLinesEnabled={isScanLinesEnabled}
        setIsScanLinesEnabled={setIsScanLinesEnabled}
        // Export prop
        onExport={handleExport}
      />
      <main style={sceneContainerStyle}>
        {isLoading && (
            <div style={loaderOverlayStyle}>
            <Loader />
          </div>
        )}
        {!svgData && !isLoading && (
          <div style={emptyStateStyle}>
              <div style={emptyStateContentStyle}>
                  <VectorPenIcon style={emptyStateIconStyle} />
                  <h2 style={{...styles.typography.h1, color: styles.colors.textPrimary, marginTop: styles.spacing.lg}}>3D Vector Engine</h2>
                  <p style={{...styles.typography.body, color: styles.colors.textSecondary, marginTop: styles.spacing.xs}}>Upload an SVG file to begin</p>
              </div>
          </div>
        )}
        <ThreeScene 
          key={key} 
          ref={sceneRef}
          svgData={svgData} 
          extrusionDepth={extrusion} 
          bevelSegments={bevelSegments}
          color={color}
          roughness={roughness}
          metalness={metalness}
          transmission={transmission}
          ior={ior}
          thickness={thickness}
          lightingPreset={lightingPreset}
          backgroundColor={backgroundColor}
          isGridVisible={isGridVisible}
          isGlitchEffectEnabled={isGlitchEffectEnabled}
          isBloomEffectEnabled={isBloomEffectEnabled}
          isPixelationEffectEnabled={isPixelationEffectEnabled}
          isChromaticAberrationEnabled={isChromaticAberrationEnabled}
          isScanLinesEnabled={isScanLinesEnabled}
        />
      </main>
    </div>
  );
};

const appContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
};

const sceneContainerStyle: React.CSSProperties = {
  flexGrow: 1,
  position: 'relative',
  backgroundColor: styles.colors.background,
};

const loaderOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 5, 5, 0.8)',
    backdropFilter: 'blur(4px)',
    zIndex: 20,
};

const emptyStateStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    pointerEvents: 'none',
    animation: 'fadeIn 0.5s ease-out both',
};

const emptyStateContentStyle: React.CSSProperties = {
    textAlign: 'center',
    color: styles.colors.textSecondary,
};

const emptyStateIconStyle: React.CSSProperties = {
    margin: '0 auto',
    height: '80px',
    width: '80px',
    color: '#3f3f46',
};


export default App;
