import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import Slider from './Slider';
import Button from './Button';
import EffectToggle from './EffectToggle';
import * as styles from '../styles';
import CubeIcon from './icons/CubeIcon';
import UploadIcon from './icons/UploadIcon';
import SettingsIcon from './icons/SettingsIcon';
import PaletteIcon from './icons/PaletteIcon';
import SparklesIcon from './icons/SparklesIcon';
import BloomIcon from './icons/BloomIcon';
import PixelationIcon from './icons/PixelationIcon';
import ChromaticAberrationIcon from './icons/ChromaticAberrationIcon';
import ScanLinesIcon from './icons/ScanLinesIcon';

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
  isGlitchEffectEnabled: boolean;
  setIsGlitchEffectEnabled: (value: boolean) => void;
  isBloomEffectEnabled: boolean;
  setIsBloomEffectEnabled: (value: boolean) => void;
  isPixelationEffectEnabled: boolean;
  setIsPixelationEffectEnabled: (value: boolean) => void;
  isChromaticAberrationEnabled: boolean;
  setIsChromaticAberrationEnabled: (value: boolean) => void;
  isScanLinesEnabled: boolean;
  setIsScanLinesEnabled: (value: boolean) => void;
  onExport: () => void;
}

type Tab = 'upload' | 'geometry' | 'material' | 'effects';

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  useEffect(() => {
    if (props.hasModel && !props.error && activeTab === 'upload') {
      setActiveTab('geometry');
    }
    if (!props.hasModel) {
      setActiveTab('upload');
    }
  }, [props.hasModel, props.error, activeTab]);

  const handlePresetClick = (preset: 'matte' | 'plastic' | 'metal' | 'glass') => {
    switch (preset) {
        case 'matte':
            props.setColor('#cccccc'); props.setRoughness(1.0); props.setMetalness(0.0); props.setTransmission(0.0);
            break;
        case 'plastic':
            props.setColor('#ffffff'); props.setRoughness(0.1); props.setMetalness(0.1); props.setTransmission(0.0);
            break;
        case 'metal':
            props.setColor('#FFD700'); props.setRoughness(0.2); props.setMetalness(1.0); props.setTransmission(0.0);
            break;
        case 'glass':
            props.setColor('#ffffff'); props.setRoughness(0.05); props.setMetalness(0.0); props.setTransmission(1.0); props.setIor(1.5); props.setThickness(1.5);
            break;
    }
  }
  
  const TabButton = ({ tab, icon, label }: { tab: Tab; icon: React.ReactNode; label: string }) => {
    const isActive = activeTab === tab;

    const baseStyle: React.CSSProperties = {
        position: 'relative',
        width: '48px', height: '48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none',
        borderRadius: styles.radii.md, cursor: 'pointer',
        color: isActive ? styles.colors.accent : styles.colors.textSecondary,
        transition: styles.transitions.fast,
    };
    
    const hoverStyle: React.CSSProperties = {
        color: styles.colors.textPrimary,
        background: 'rgba(255,255,255,0.1)',
    };
    
    const activeIndicatorStyle: React.CSSProperties = {
        position: 'absolute',
        left: 0, top: '50%', transform: 'translateY(-50%)',
        width: '4px', height: '24px',
        backgroundColor: styles.colors.accent,
        borderRadius: `0 ${styles.radii.sm} ${styles.radii.sm} 0`,
        transition: styles.transitions.fast,
        opacity: isActive ? 1 : 0,
    };

    return (
      <button 
        style={baseStyle}
        onMouseEnter={(e) => e.currentTarget.style.color = hoverStyle.color}
        onMouseLeave={(e) => e.currentTarget.style.color = isActive ? styles.colors.accent : styles.colors.textSecondary}
        onClick={() => setActiveTab(tab)}
        aria-label={label}
        title={label}
      >
        <div style={activeIndicatorStyle}></div>
        {icon}
      </button>
    );
  };
  
  const renderContent = () => {
    const tabContent = {
        'upload': (
            <>
                <h2 style={styles.typography.h2}>Load SVG Model</h2>
                <FileUpload onFileLoad={props.onFileLoad} disabled={props.isLoading} />
                {props.error && <p style={errorTextStyle}>{props.error}</p>}
            </>
        ),
        'geometry': (
            <>
                <h2 style={styles.typography.h2}>Adjust Properties</h2>
                <Slider label="Extrusion Depth" id="extrusion-depth" min={1} max={100} step={1} value={props.extrusion} onChange={props.setExtrusion} />
                <Slider label="Bevel Smoothness" id="bevel-smoothness" min={0} max={10} step={1} value={props.bevelSegments} onChange={props.setBevelSegments} />
            </>
        ),
        'material': (
            <>
                <h2 style={styles.typography.h2}>Material Editor</h2>
                <div style={controlGroupStyle}>
                    <label style={styles.typography.label}>Material Presets</label>
                    <div style={presetGridStyle}>
                        <Button variant="secondary" onClick={() => handlePresetClick('matte')}>Matte</Button>
                        <Button variant="secondary" onClick={() => handlePresetClick('plastic')}>Glossy</Button>
                        <Button variant="secondary" onClick={() => handlePresetClick('metal')}>Metal</Button>
                        <Button variant="secondary" onClick={() => handlePresetClick('glass')}>Glass</Button>
                    </div>
                </div>
                <div style={controlGroupStyle}>
                    <label htmlFor="model-color" style={styles.typography.label}>Base Color</label>
                    <div style={colorControlStyle}>
                      <input id="model-color" type="color" value={props.color} onChange={(e) => props.setColor(e.target.value)} style={colorPickerStyle} />
                       <input type="text" value={props.color} onChange={(e) => props.setColor(e.target.value)} style={textInputStyle} />
                    </div>
                </div>
                <Slider label="Roughness" id="roughness-slider" min={0} max={1} step={0.01} value={props.roughness} onChange={props.setRoughness} decimals={2} />
                <Slider label="Metalness" id="metalness-slider" min={0} max={1} step={0.01} value={props.metalness} onChange={props.setMetalness} decimals={2} />
                <Slider label="Transmission" id="transmission-slider" min={0} max={1} step={0.01} value={props.transmission} onChange={props.setTransmission} decimals={2} />
                <Slider label="Index of Refraction" id="ior-slider" min={1} max={2.3} step={0.01} value={props.ior} onChange={props.setIor} decimals={2} />
                <Slider label="Thickness" id="thickness-slider" min={0} max={5} step={0.01} value={props.thickness} onChange={props.setThickness} decimals={2} />
            </>
        ),
        'effects': (
             <>
                <h2 style={styles.typography.h2}>Special Effects</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <EffectToggle
                    id="glitch-toggle"
                    icon={<SparklesIcon style={{ width: 24, height: 24 }} />}
                    title="Glitch"
                    description="Adds a digital distortion and flickering effect."
                    isEnabled={props.isGlitchEffectEnabled}
                    onToggle={props.setIsGlitchEffectEnabled}
                  />
                  <EffectToggle
                      id="bloom-toggle"
                      icon={<BloomIcon style={{ width: 24, height: 24 }} />}
                      title="Bloom"
                      description="Makes bright areas of the scene glow."
                      isEnabled={props.isBloomEffectEnabled}
                      onToggle={props.setIsBloomEffectEnabled}
                  />
                  <EffectToggle
                      id="chromatic-aberration-toggle"
                      icon={<ChromaticAberrationIcon style={{ width: 24, height: 24 }} />}
                      title="Chromatic Aberration"
                      description="Mimics lens distortion by splitting colors."
                      isEnabled={props.isChromaticAberrationEnabled}
                      onToggle={props.setIsChromaticAberrationEnabled}
                  />
                  <EffectToggle
                      id="pixelation-toggle"
                      icon={<PixelationIcon style={{ width: 24, height: 24 }} />}
                      title="Pixelation"
                      description="Renders the scene in a low-resolution, retro style."
                      isEnabled={props.isPixelationEffectEnabled}
                      onToggle={props.setIsPixelationEffectEnabled}
                  />
                  <EffectToggle
                      id="scanlines-toggle"
                      icon={<ScanLinesIcon style={{ width: 24, height: 24 }} />}
                      title="Scan Lines"
                      description="Overlays horizontal lines for a CRT monitor look."
                      isEnabled={props.isScanLinesEnabled}
                      onToggle={props.setIsScanLinesEnabled}
                  />
                </div>
            </>
        )
    };
    return props.hasModel ? tabContent[activeTab] : tabContent['upload'];
  };

  return (
    <aside style={panelContainerStyle}>
        <div style={sidebarStyle}>
             <div style={logoGroupStyle}>
                <CubeIcon style={{ height: '32px', width: '32px', color: styles.colors.accent }} />
            </div>
            <nav style={navStyle}>
                <TabButton tab="upload" label="Upload Model" icon={<UploadIcon style={{width: 24, height: 24}} />} />
                {props.hasModel && (
                    <>
                        <TabButton tab="geometry" label="Geometry Settings" icon={<SettingsIcon style={{width: 24, height: 24}} />} />
                        <TabButton tab="material" label="Material Editor" icon={<PaletteIcon style={{width: 24, height: 24}} />} />
                        <TabButton tab="effects" label="Special Effects" icon={<SparklesIcon style={{width: 24, height: 24}} />} />
                    </>
                )}
            </nav>
        </div>
        <div style={contentAreaStyle} className="custom-scrollbar">
            <div style={headerStyle}>
                <h1 style={titleStyle}>SVG to 3D</h1>
            </div>
            <div style={contentInnerStyle}>
                {renderContent()}
            </div>
            {props.hasModel && (
                <div style={footerStyle}>
                    <Button onClick={props.onExport} disabled={props.isLoading} variant="primary">Export to GLTF</Button>
                    <Button onClick={props.onClear} disabled={props.isLoading} variant="secondary">Clear Model</Button>
                </div>
            )}
        </div>
    </aside>
  );
};

const panelContainerStyle: React.CSSProperties = {
  width: '380px',
  flexShrink: 0,
  height: '100vh',
  display: 'flex',
  backgroundColor: styles.colors.surface,
  borderRight: `1px solid ${styles.colors.glassBorder}`,
  boxShadow: styles.shadows.soft,
  backdropFilter: 'blur(12px)',
  zIndex: 10,
};

const sidebarStyle: React.CSSProperties = {
    width: '64px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${styles.spacing.md} 0`,
    borderRight: `1px solid ${styles.colors.glassBorder}`,
    background: 'rgba(0,0,0,0.1)'
};

const logoGroupStyle: React.CSSProperties = {
    marginBottom: styles.spacing.lg
};

const navStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: styles.spacing.xs,
};

const contentAreaStyle: React.CSSProperties = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
};

const headerStyle: React.CSSProperties = {
    padding: `${styles.spacing.lg} ${styles.spacing.lg} ${styles.spacing.md}`,
};

const titleStyle: React.CSSProperties = {
  ...styles.typography.h1,
  background: `linear-gradient(to right, ${styles.colors.textPrimary}, ${styles.colors.textSecondary})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: 0,
};

const contentInnerStyle: React.CSSProperties = {
    padding: `0 ${styles.spacing.lg}`,
    display: 'flex',
    flexDirection: 'column',
    gap: styles.spacing.lg,
};


const errorTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#ff8080',
  margin: `${styles.spacing.sm} 0 0`,
  textAlign: 'center'
};

const controlGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: styles.spacing.xs };
const presetGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: styles.spacing.xs };
const colorControlStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: styles.spacing.sm };
const textInputStyle: React.CSSProperties = {
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    border: `1px solid ${styles.colors.glassBorder}`,
    borderRadius: styles.radii.md,
    padding: styles.spacing.xs,
    textAlign: 'center',
    ...styles.typography.mono,
    color: styles.colors.textPrimary,
    outline: 'none',
};

const colorPickerStyle: React.CSSProperties = {
    WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none',
    width: '36px', height: '36px', padding: 0, border: 'none',
    backgroundColor: 'transparent', borderRadius: styles.radii.md, cursor: 'pointer', overflow: 'hidden',
};
const footerStyle: React.CSSProperties = {
    marginTop: 'auto', 
    padding: `${styles.spacing.lg}`,
    borderTop: `1px solid ${styles.colors.glassBorder}`,
    display: 'flex', flexDirection: 'column', gap: styles.spacing.sm,
    background: 'rgba(0,0,0,0.15)'
};


export default ControlPanel;