import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ThreeScene, { ThreeSceneRef } from './components/ThreeScene';
import Loader from './components/Loader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as THREE from 'three';


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

  // Special effects state
  const [isGlitchEffectEnabled, setIsGlitchEffectEnabled] = useState<boolean>(false);

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
    setIsGlitchEffectEnabled(false);
    setKey(prevKey => prevKey + 1);
  }, []);

  const handleExport = () => {
    if (sceneRef.current?.model) {
        const exporter = new GLTFExporter();
        const options = {
            animations: sceneRef.current.animations || []
        };
        exporter.parse(
            sceneRef.current.model,
            (gltf) => {
                const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'model.gltf';
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
    <div className="app-container">
      <Header />
      <div className="main-layout">
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
          // Special Effects
          isGlitchEffectEnabled={isGlitchEffectEnabled}
          setIsGlitchEffectEnabled={setIsGlitchEffectEnabled}
          // Export prop
          onExport={handleExport}
        />
        <main className="scene-container">
          {isLoading && (
             <div className="loader-overlay">
              <Loader />
            </div>
          )}
          {!svgData && !isLoading && (
            <div className="empty-state">
                <div className="empty-state__content">
                    <svg xmlns="http://www.w3.org/2000/svg" className="empty-state__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L8.3 14.053M20 7l-4.57 11.253L8.3 14.053M20 7L11.7 4 8.3 14.053" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17.253L8.3 14.053 11.7 4 4 17.253z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17.253L15.43 21 11.7 4" />
                    </svg>
                    <h2 className="empty-state__title">SVG to 3D Engine</h2>
                    <p className="empty-state__subtitle">Upload an SVG file to begin</p>
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
            isGlitchEffectEnabled={isGlitchEffectEnabled}
          />
        </main>
      </div>
    </div>
  );
};

export default App;