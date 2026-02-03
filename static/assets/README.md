# GLB Asset Models

Place your `.glb` 3D model files here.

## How to add a new asset

1. Put your `.glb` file in this folder, e.g. `spoiler.glb`
2. Open `src/lib/stores.ts`
3. Add or update an entry in `availableAssets`:

```ts
{
    id: 'my-spoiler',
    name: 'My Spoiler',
    category: 'spoilers',
    icon: '🏎️',
    color: '#ff3366',
    geometry: 'box',       // fallback shape if model fails to load
    scale: 0.8,            // adjust size (model is normalized to 1x1x1 first)
    description: 'Custom spoiler',
    modelPath: '/assets/spoiler.glb',   // <-- path to your GLB file
    // modelRotationOffset: { x: 0, y: Math.PI, z: 0 },  // optional rotation fix
}
```

## Where to get free GLB models

- https://sketchfab.com (filter by free & downloadable)
- https://market.pmnd.rs (Poimandres Market)
- https://polyhaven.com/models
- https://kenney.nl/assets (low-poly CC0)
- https://free3d.com

## Tips

- **Scale**: Models are auto-normalized to fit a 1×1×1 box, then `scale` is applied.
  Use `scale: 0.3` for small badges, `scale: 0.8` for large spoilers.
- **Rotation**: If your model faces the wrong way, use `modelRotationOffset`.
- **Performance**: Keep models under 50k polygons for smooth drag-and-drop.
- **Format**: GLB (binary GLTF) is preferred — it bundles textures in one file.
