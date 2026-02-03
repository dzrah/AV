# GIMIFY - 3D Car Customization Studio

A SvelteKit + Threlte (Three.js) application for placing 3D assets on a car model.

## Getting Started

```bash
npm install
npm run dev
```

## Adding Your Own Car Model (e.g., Kia)

The app supports loading custom GLTF/GLB 3D car models. To use your own model:

### Step 1: Get a Car Model

Download a car model in **GLB** or **GLTF** format from:
- [Sketchfab](https://sketchfab.com) - Search for "Kia" or any car, filter by "Downloadable"
- [Free3D](https://free3d.com/3d-models/car)
- [CGTrader](https://www.cgtrader.com/free-3d-models/car) - Filter by free models
- [TurboSquid](https://www.turbosquid.com/Search/3D-Models/free/car/gltf)

### Step 2: Add the Model

1. Rename your downloaded model to `car.glb`
2. Place it in the `/static` folder:
   ```
   gimify-car/
   ├── static/
   │   ├── car.glb        <-- Your car model here
   │   └── favicon.png
   ```

### Step 3: Adjust Scale/Position (if needed)

If your model appears too big, small, or mispositioned, edit `src/lib/components/Car.svelte`:

```svelte
<T.Group 
  scale={[1.5, 1.5, 1.5]}     <!-- Adjust scale -->
  position.y={0}               <!-- Adjust height -->
  rotation.y={Math.PI / 2}     <!-- Adjust rotation -->
>
```

### Step 4: Adjust Car Center (for surface snapping)

If assets aren't snapping correctly to the car surface, edit `src/lib/components/Scene.svelte`:

```typescript
// Approximate center of the car body for outward direction calculation
const CAR_CENTER = new THREE.Vector3(0, 0.6, 0);
```

Adjust the Y value based on your car's height (e.g., `0.8` for taller cars, `0.5` for lower cars).

## Features

- **Drag & Drop**: Drag assets from sidebar onto the car
- **Surface Snapping**: Assets stick to car surface with proper orientation
- **Auto Rotation**: Car rotates automatically (pause during drag)
- **Multiple Asset Types**: Boxes, spheres, cones, cylinders, and more
- **Visual Feedback**: Color-coded snap indicators

## Controls

- **Drag** an asset from the right sidebar
- **Move** cursor over car to see preview snap to surface
- **Click/Release** to place the asset
- **Double-click** a placed asset to remove it
- **ESC** to cancel drag operation

## Recommended Model Specifications

For best performance:
- **Polygon count**: Under 100k polygons
- **Format**: GLB (binary) preferred over GLTF
- **Textures**: Embedded in GLB, or PBR-ready
- **Scale**: Real-world scale (meters) works best

## File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── Car.svelte         # Car model (GLTF or fallback primitives)
│   │   ├── Scene.svelte       # Main 3D scene with raycasting
│   │   ├── DragPreview.svelte # Asset preview during drag
│   │   ├── PlacedAsset.svelte # Placed asset component
│   │   ├── Sidebar.svelte     # Asset catalog sidebar
│   │   └── Controls.svelte    # UI controls
│   ├── stores.ts              # Svelte stores for state
│   └── types.ts               # TypeScript types
├── routes/
│   └── +page.svelte           # Main page
└── static/
    └── car.glb                # Your car model (optional)
```

## Tech Stack

- **SvelteKit** - Framework
- **Threlte** - Three.js for Svelte
- **Three.js** - 3D graphics
- **TailwindCSS** - Styling

## License

MIT
