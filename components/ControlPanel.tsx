
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import CollapsibleSection from './CollapsibleSection';

interface ControlPanelProps {
  onFileLoad: (svgContent: string) => void;
  onClear: () => void;
  extrusion: number;
  setExtrusion: (value: number) => void;
  isLoading: boolean;
  hasModel: boolean;
  error: string | null;
  // Material props
  color: string;
  setColor: (value: string) => void;
  roughness: number;
  setRoughness: (value: number) => void;
  metalness: number;
  setMetalness: (value: number) => void;
  // AI Palette props
  onGeneratePalette: (prompt: string) => void;
  paletteColors: string[];
  isGeneratingPalette: boolean;
  paletteError: string | null;
  // Export
  onExport: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onFileLoad,
  onClear,
  extrusion,
  setExtrusion,
  isLoading,
  hasModel,
  error,
  color,
  setColor,
  roughness,
  setRoughness,
  metalness,
  setMetalness,
  onGeneratePalette,
  paletteColors,
  isGeneratingPalette,
  paletteError,
  onExport,
}) => {
  const [palettePrompt, setPalettePrompt] = useState('');

  const handlePaletteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePalette(palettePrompt);
  };

  return (
    <aside className="w-96 flex-shrink-0 bg-gray-900 border-r border-gray-700 p-6 flex flex-col space-y-4 overflow-y-auto">
      <CollapsibleSection title="1. Load SVG Model" isOpenDefault>
        <FileUpload onFileLoad={onFileLoad} disabled={isLoading} />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </CollapsibleSection>

      {hasModel && !error && (
        <>
          <CollapsibleSection title="2. Adjust Properties">
            <div className="space-y-4">
              <div>
                <label htmlFor="extrusion-depth" className="block text-sm font-medium text-gray-300 mb-2">
                  Extrusion Depth
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="extrusion-depth"
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={extrusion}
                    onChange={(e) => setExtrusion(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-mono bg-gray-800 px-2 py-1 rounded w-16 text-center">
                    {extrusion.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection title="3. Material Editor">
            <div className="space-y-4">
                {/* Color */}
                <div>
                  <label htmlFor="model-color" className="block text-sm font-medium text-gray-300 mb-2">
                    Base Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      id="model-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="p-1 h-10 w-10 block bg-gray-700 border-gray-600 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                    />
                     <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-gray-800 border-gray-600 rounded-md px-2 py-1 text-center font-mono"
                    />
                  </div>
                </div>

                {/* Roughness */}
                <div>
                <label htmlFor="roughness-slider" className="block text-sm font-medium text-gray-300 mb-2">
                    Roughness (Matte vs Glossy)
                </label>
                <div className="flex items-center space-x-3">
                    <input
                    id="roughness-slider"
                    type="range" min="0" max="1" step="0.01"
                    value={roughness}
                    onChange={(e) => setRoughness(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-mono bg-gray-800 px-2 py-1 rounded w-16 text-center">
                    {roughness.toFixed(2)}
                    </span>
                </div>
                </div>

                {/* Metalness */}
                <div>
                <label htmlFor="metalness-slider" className="block text-sm font-medium text-gray-300 mb-2">
                    Metalness
                </label>
                <div className="flex items-center space-x-3">
                    <input
                    id="metalness-slider"
                    type="range" min="0" max="1" step="0.01"
                    value={metalness}
                    onChange={(e) => setMetalness(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-mono bg-gray-800 px-2 py-1 rounded w-16 text-center">
                    {metalness.toFixed(2)}
                    </span>
                </div>
                </div>
            </div>
          </CollapsibleSection>
        
          <CollapsibleSection title="4. AI Palette Helper">
            <form onSubmit={handlePaletteSubmit} className="space-y-3">
                <p className="text-sm text-gray-400">Describe a theme to get color ideas.</p>
                <input
                    type="text"
                    value={palettePrompt}
                    onChange={(e) => setPalettePrompt(e.target.value)}
                    placeholder="e.g., 'vaporwave sunset'"
                    className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-sm placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isGeneratingPalette}
                />
                <button
                    type="submit"
                    disabled={isLoading || isGeneratingPalette}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isGeneratingPalette ? 'Generating...' : 'Generate Palette'}
                </button>
                {paletteError && <p className="mt-2 text-sm text-red-400">{paletteError}</p>}
                {paletteColors.length > 0 && (
                    <div className="pt-3">
                        <p className="text-sm font-medium text-gray-300 mb-2">Click to apply:</p>
                        <div className="flex items-center justify-between space-x-1">
                            {paletteColors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className="h-10 w-full rounded-md cursor-pointer border-2 border-transparent hover:border-white focus:outline-none focus:border-white transition-all"
                                    style={{ backgroundColor: c }}
                                    aria-label={`Set color to ${c}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </form>
          </CollapsibleSection>
        
          <div className="!mt-auto pt-6 border-t border-gray-700 space-y-4">
              <button
                  onClick={onExport}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  Export to GLTF
              </button>
              <button
                  onClick={onClear}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  Clear Model
              </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default ControlPanel;
