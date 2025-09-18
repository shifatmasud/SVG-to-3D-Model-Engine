# SVG to 3D Model Engine

A powerful web-based tool that instantly converts your 2D SVG vector graphics into interactive 3D models using React and Three.js.

**[🚀 View Live Demo](https://comfortable-whoever-839576.framer.app/)**



---

## TL;DR / ELI5

*   **TL;DR:** Upload an SVG, get a 3D model. Tweak its shape, materials, and lighting in real-time. Add cool visual effects and export your creation as a GLB file.

*   **ELI5 (Explain Like I'm 5):** Imagine you have a flat sticker. This tool is like a magic machine that puffs up your sticker into a 3D toy you can spin around on your computer. You can change its color, make it shiny like metal or clear like glass, and then save the 3D toy to use in video games or animations!

## ✨ Key Features

-   **Instant SVG to 3D Conversion:** Drag-and-drop or upload any SVG file to generate a 3D mesh.
-   **Real-time Customization:**
    -   **Geometry:** Control extrusion depth and bevel smoothness.
    -   **Materials:** Full PBR material editor (color, roughness, metalness, transmission for glass effects). Includes handy presets for Matte, Glossy, Metal, and Glass.
    -   **Scene:** Adjust lighting with presets (Studio, Dramatic, Soft), change the background color, and toggle a floor grid.
-   **Post-Processing Effects:** Add a layer of polish with special effects like Bloom, Glitch, Chromatic Aberration, Pixelation, and Scan Lines.
-   **GLB Export:** Download your final creation as a binary GLTF (`.glb`) file, ready for use in other 3D applications, game engines, or web viewers.
-   **Interactive 3D Viewer:** An intuitive orbit-controlled scene to inspect your model from any angle.

## 🛠️ How It Works (Context Map)

The application follows a straightforward, component-based architecture:

1.  **`index.html` / `index.tsx`**: The entry point which mounts the main React application.
2.  **`flat.tsx` (Main App Component)**: This is the core of the application.
    -   It holds all the state for the 3D model, material properties, scene settings, and effects using `useState` hooks.
    -   It orchestrates the two main parts of the UI: the `ControlPanel` and the `ThreeScene`.
3.  **`ControlPanel` (Component Logic)**: The left sidebar UI.
    -   It provides all the controls (sliders, color pickers, buttons, toggles) for the user to interact with.
    -   When a user changes a setting, it calls a state update function passed down via props from the main app component.
4.  **`ThreeScene` (Component Logic)**: The main 3D viewport on the right.
    -   It receives all the state variables (SVG data, extrusion, color, etc.) as props.
    -   It uses `useEffect` hooks to react to changes in these props.
    -   When `svgData` or geometry props change, it calls the `createModelFromSVG` service to rebuild the 3D model.
    -   When material or scene props change, it updates the corresponding Three.js materials, lights, or background color.
    -   It uses `EffectComposer` to layer on post-processing shaders, enabling or disabling them based on the effect toggle states.
5.  **`createModelFromSVG` (Service Logic)**:
    -   Uses `SVGLoader` from Three.js to parse the SVG file string into paths and shapes.
    -   Creates a 3D mesh for each shape using `ExtrudeGeometry`.
    -   Applies a shared `MeshPhysicalMaterial` that can be updated in real-time.

## 🌳 Directory Tree

```
.
├── README.md
├── flat.tsx
├── index.html
├── index.tsx
├── metadata.json
├── styles.ts
├── services/
│   └── svgTo3D.ts
└── components/
    ├── App.tsx
    ├── Button.tsx
    ├── CollapsibleSection.tsx
    ├── ControlPanel.tsx
    ├── EffectToggle.tsx
    ├── FileUpload.tsx
    ├── Header.tsx
    ├── Loader.tsx
    ├── Slider.tsx
    ├── ThreeScene.tsx
    ├── Toggle.tsx
    └── icons/
        ├── BloomIcon.tsx
        ├── ChevronDownIcon.tsx
        ├── ChromaticAberrationIcon.tsx
        ├── CubeIcon.tsx
        ├── GridIcon.tsx
        ├── LayoutIcon.tsx
        ├── PaletteIcon.tsx
        ├── PixelationIcon.tsx
        ├── ScanLinesIcon.tsx
        ├── SettingsIcon.tsx
        ├── SparklesIcon.tsx
        ├── SpinnerIcon.tsx
        ├── UploadIcon.tsx
        └── VectorPenIcon.tsx
```
