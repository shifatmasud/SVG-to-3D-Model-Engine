import React from 'react';
import FileUpload from './FileUpload';
import CollapsibleSection from './CollapsibleSection';

interface ControlPanelProps {
  onFileLoad: (svgContent: string) => void;
  onClear: () => void;
  extrusion: number;
  setExtrusion: (value: number) => void;
  bevelSegments: number;
  setBevelSegments: (value: number) => void;
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
  transmission: number;
  setTransmission: (value: number) => void;
  ior: number;
  setIor: (value: number) => void;
  thickness: number;
  setThickness: (value: number) => void;
  // Special Effects
  isGlitchEffectEnabled: boolean;
  setIsGlitchEffectEnabled: (value: boolean) => void;
  // Export
  onExport: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onFileLoad,
  onClear,
  extrusion,
  setExtrusion,
  bevelSegments,
  setBevelSegments,
  isLoading,
  hasModel,
  error,
  color,
  setColor,
  roughness,
  setRoughness,
  metalness,
  setMetalness,
  transmission,
  setTransmission,
  ior,
  setIor,
  thickness,
  setThickness,
  isGlitchEffectEnabled,
  setIsGlitchEffectEnabled,
  onExport,
}) => {
  
  const handlePresetClick = (preset: 'matte' | 'plastic' | 'metal' | 'glass') => {
    switch (preset) {
        case 'matte':
            setColor('#cccccc');
            setRoughness(1.0);
            setMetalness(0.0);
            setTransmission(0.0);
            break;
        case 'plastic':
            setColor('#ffffff');
            setRoughness(0.1);
            setMetalness(0.1);
            setTransmission(0.0);
            break;
        case 'metal':
            setColor('#FFD700'); // gold-ish
            setRoughness(0.2);
            setMetalness(1.0);
            setTransmission(0.0);
            break;
        case 'glass':
            setColor('#ffffff');
            setRoughness(0.05);
            setMetalness(0.0);
            setTransmission(1.0);
            setIor(1.5);
            setThickness(1.5);
            break;
    }
  }

  const PresetButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <button onClick={onClick} type="button" className="btn btn--secondary">
      {children}
    </button>
  );

  return (
    <aside className="control-panel">
      <CollapsibleSection title="Load SVG Model" isOpenDefault>
        <FileUpload onFileLoad={onFileLoad} disabled={isLoading} />
        {error && <p className="error-message">{error}</p>}
      </CollapsibleSection>

      {hasModel && !error && (
        <>
          <CollapsibleSection title="Adjust Properties">
            <div className="control-group">
              <label htmlFor="extrusion-depth" className="control-label">
                Extrusion Depth
              </label>
              <div className="slider-control">
                <input
                  id="extrusion-depth"
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={extrusion}
                  onChange={(e) => setExtrusion(Number(e.target.value))}
                />
                <span className="slider-value">
                  {extrusion.toFixed(0)}
                </span>
              </div>
            </div>
            <div className="control-group">
              <label htmlFor="bevel-smoothness" className="control-label">
                Bevel Smoothness
              </label>
              <div className="slider-control">
                <input
                  id="bevel-smoothness"
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={bevelSegments}
                  onChange={(e) => setBevelSegments(Number(e.target.value))}
                />
                <span className="slider-value">
                  {bevelSegments.toFixed(0)}
                </span>
              </div>
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection title="Material Editor">
              <div className="control-group">
                <label className="control-label">
                  Material Presets
                </label>
                <div className="preset-grid">
                    <PresetButton onClick={() => handlePresetClick('matte')}>Matte</PresetButton>
                    <PresetButton onClick={() => handlePresetClick('plastic')}>Glossy</PresetButton>
                    <PresetButton onClick={() => handlePresetClick('metal')}>Metal</PresetButton>
                    <PresetButton onClick={() => handlePresetClick('glass')}>Glass</PresetButton>
                </div>
              </div>

              <div className="control-group">
                <label htmlFor="model-color" className="control-label">
                  Base Color
                </label>
                <div className="color-control">
                  <input
                    id="model-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="color-picker"
                  />
                   <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="text-input"
                  />
                </div>
              </div>

              <div className="control-group">
              <label htmlFor="roughness-slider" className="control-label">
                  Roughness (Matte vs Glossy)
              </label>
              <div className="slider-control">
                  <input
                  id="roughness-slider"
                  type="range" min="0" max="1" step="0.01"
                  value={roughness}
                  onChange={(e) => setRoughness(Number(e.target.value))}
                  />
                  <span className="slider-value">
                  {roughness.toFixed(2)}
                  </span>
              </div>
              </div>

              <div className="control-group">
              <label htmlFor="metalness-slider" className="control-label">
                  Metalness
              </label>
              <div className="slider-control">
                  <input
                  id="metalness-slider"
                  type="range" min="0" max="1" step="0.01"
                  value={metalness}
                  onChange={(e) => setMetalness(Number(e.target.value))}
                  />
                  <span className="slider-value">
                  {metalness.toFixed(2)}
                  </span>
              </div>
              </div>

              <div className="control-group">
              <label htmlFor="transmission-slider" className="control-label">
                  Transmission (Glass Effect)
              </label>
              <div className="slider-control">
                  <input
                  id="transmission-slider"
                  type="range" min="0" max="1" step="0.01"
                  value={transmission}
                  onChange={(e) => setTransmission(Number(e.target.value))}
                  />
                  <span className="slider-value">
                  {transmission.toFixed(2)}
                  </span>
              </div>
              </div>

              <div className="control-group">
              <label htmlFor="ior-slider" className="control-label">
                  Index of Refraction
              </label>
              <div className="slider-control">
                  <input
                  id="ior-slider"
                  type="range" min="1" max="2.3" step="0.01"
                  value={ior}
                  onChange={(e) => setIor(Number(e.target.value))}
                  />
                  <span className="slider-value">
                  {ior.toFixed(2)}
                  </span>
              </div>
              </div>

              <div className="control-group">
              <label htmlFor="thickness-slider" className="control-label">
                  Thickness (for Glass)
              </label>
              <div className="slider-control">
                  <input
                  id="thickness-slider"
                  type="range" min="0" max="5" step="0.01"
                  value={thickness}
                  onChange={(e) => setThickness(Number(e.target.value))}
                  />
                  <span className="slider-value">
                  {thickness.toFixed(2)}
                  </span>
              </div>
              </div>
          </CollapsibleSection>

          <CollapsibleSection title="Special Effects">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <label htmlFor="glitch-toggle" className="control-label" style={{cursor: 'pointer'}}>
                      Glitch Effect
                  </label>
                  <button
                      type="button"
                      id="glitch-toggle"
                      onClick={() => setIsGlitchEffectEnabled(!isGlitchEffectEnabled)}
                      className="toggle-switch"
                      role="switch"
                      aria-checked={isGlitchEffectEnabled}
                  >
                      <span
                          aria-hidden="true"
                          className="toggle-switch__thumb"
                      />
                  </button>
              </div>
          </CollapsibleSection>
        
          <div className="control-panel__footer">
              <button
                  onClick={onExport}
                  disabled={isLoading}
                  className="btn btn--primary"
              >
                  Export to GLTF
              </button>
              <button
                  onClick={onClear}
                  disabled={isLoading}
                  className="btn btn--secondary"
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