
import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ThreeScene, { ThreeSceneRef } from './components/ThreeScene';
import Loader from './components/Loader';
import { generateColorPalette } from './services/geminiService';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as THREE from 'three';


const App: React.FC = () => {
  const [svgData, setSvgData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extrusion, setExtrusion] = useState<number>(10);
  const [bevelSegments, setBevelSegments] = useState<number>(2);
  const [key, setKey] = useState<number>(0);

  // Material properties state
  const [color, setColor] = useState<string>('#cccccc');
  const [roughness, setRoughness] = useState<number>(0.5);
  const [metalness, setMetalness] = useState<number>(0.1);
  const [transmission, setTransmission] = useState<number>(0); // for glass
  const [ior, setIor] = useState<number>(1.5); // index of refraction
  const [thickness, setThickness] = useState<number>(0.5); // for transmission

  // AI Palette Generator state
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  const [isGeneratingPalette, setIsGeneratingPalette] = useState<boolean>(false);
  const [paletteError, setPaletteError] = useState<string | null>(null);

  // Special effects state
  const [isGlitchEffectEnabled, setIsGlitchEffectEnabled] = useState<boolean>(false);

  const sceneRef = useRef<ThreeSceneRef>(null);

  const handleFileLoad = useCallback((svgContent: string) => {
    setIsLoading(true);
    setError(null);
    setPaletteColors([]);
    setPaletteError(null);
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
    setPaletteColors([]);
    setPaletteError(null);
    // Reset all material properties
    setColor('#cccccc');
    setRoughness(0.5);
    setMetalness(0.1);
    setTransmission(0);
    setIor(1.5);
    setThickness(0.5);
    setExtrusion(10);
    setBevelSegments(2);
    setIsGlitchEffectEnabled(false); // Reset effect
    setKey(prevKey => prevKey + 1);
  }, []);

  const handleGeneratePalette = async (prompt: string) => {
    if (!prompt) {
        setPaletteError("Please enter a description for the palette.");
        return;
    }
    setIsGeneratingPalette(true);
    setPaletteError(null);
    try {
        const colors = await generateColorPalette(prompt);
        setPaletteColors(colors);
    } catch (error) {
        setPaletteError("Could not generate palette. Please try again.");
        console.error(error);
    } finally {
        setIsGeneratingPalette(false);
    }
  };
  
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
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <Header />
      <div className="flex flex-grow overflow-hidden">
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
          // AI Palette props
          onGeneratePalette={handleGeneratePalette}
          paletteColors={paletteColors}
          isGeneratingPalette={isGeneratingPalette}
          paletteError={paletteError}
          // Special Effects
          isGlitchEffectEnabled={isGlitchEffectEnabled}
          setIsGlitchEffectEnabled={setIsGlitchEffectEnabled}
          // Export prop
          onExport={handleExport}
        />
        <main className="flex-grow relative bg-gray-800">
          {isLoading && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-20">
              <Loader />
            </div>
          )}
          {!svgData && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4l2 2h4a2 2 0 012 2v12a4 4 0 01-4 4H7z" />
                    </svg>
                    <h2 className="mt-4 text-xl font-semibold">SVG to 3D Model Engine</h2>
                    <p className="mt-2">Upload an SVG file to get started.</p>
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
