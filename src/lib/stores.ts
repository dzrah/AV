import { derived, writable } from 'svelte/store';
import type { AppState, Asset3D, DragState, PlacedAsset, GeometryType } from './types';

// Map geometry types to icons
function getIconForGeometry(geometry: GeometryType): string {
  const iconMap: Record<GeometryType, string> = {
    box: '📦',
    sphere: '🔵',
    cone: '🔺',
    cylinder: '🔶',
    torus: '◯',
    dodecahedron: '💠',
    octahedron: '⬠',
    tetrahedron: '🔺',
  };
  return iconMap[geometry] || '🎨';
}

// Available 3D assets catalog
// Assets with `modelPath` render as GLB 3D models
// Assets without `modelPath` render as primitive shapes (fallback)
// Put your .glb files in /static/assets/ and reference them as '/assets/filename.glb'
export const availableAssets: Asset3D[] = [
  // === GLB MODEL ASSETS ===
  // To add your own: place .glb file in /static/assets/ and add an entry here

  // Decals / Ornaments
  {
    id: 'star-decal',
    name: 'Star Badge',
    category: 'decals',
    icon: getIconForGeometry('dodecahedron'),
    color: '#ffd700',
    geometry: 'dodecahedron',
    scale: 0.3,
    description: 'Premium star badge',
    validZones: ['roof-center'],
    preferredZones: ['roof-center'],
    validationMode: 'strict',
    markerName: 'Star_Badge',
  },
  {
    id: 'crystal-orb',
    name: 'Crystal Orb',
    category: 'decals',
    icon: getIconForGeometry('sphere'),
    color: '#9933ff',
    geometry: 'sphere',
    scale: 0.25,
    description: 'Mystical crystal ornament',
    validZones: ['roof-front'],
    preferredZones: ['roof-front'],
    validationMode: 'strict',
    markerName: 'Cristal_ORB',
  },
  // Accessories
  {
    id: 'roof-box',
    name: 'Roof Box',
    category: 'accessories',
    icon: getIconForGeometry('box'),
    color: '#ff6600',
    geometry: 'box',
    scale: 0.6,
    description: 'Cargo roof box',
    validZones: ['hood-center'],
    preferredZones: ['hood-center'],
    validationMode: 'strict',
    markerName: 'Roof_Box',
  },
  // Lights
  {
    id: 'neon-ring',
    name: 'Neon Ring',
    category: 'lights',
    icon: getIconForGeometry('torus'),
    color: '#00ffff',
    geometry: 'torus',
    scale: 0.35,
    description: 'Glowing neon ring',
    validZones: ['rear-bumper-center'],
    preferredZones: ['rear-bumper-center'],
    validationMode: 'strict',
    markerName: 'Neon_Ring',
  },
  {
    id: 'light-pod',
    name: 'Light Pod',
    category: 'lights',
    icon: getIconForGeometry('octahedron'),
    color: '#ffff00',
    geometry: 'octahedron',
    scale: 0.3,
    description: 'LED light pod',
    validZones: ['side-left-front'],
    preferredZones: ['side-left-front'],
    validationMode: 'strict',
    markerName: 'Light_Pod',
  },
  // Geometric shapes
  {
    id: 'pyramid',
    name: 'Pyramid',
    category: 'decals',
    icon: getIconForGeometry('tetrahedron'),
    color: '#ff0066',
    geometry: 'tetrahedron',
    scale: 0.35,
    description: 'Geometric pyramid',
    validZones: ['side-right-front'],
    preferredZones: ['side-right-front'],
    validationMode: 'strict',
    markerName: 'Pyramid',
  },
];

// Initial drag state
const initialDragState: DragState = {
  isDragging: false,
  asset: null,
  mousePosition: { x: 0, y: 0 },
  worldPosition: null,
  surfaceNormal: null,
};

// App state store
function createAppStore() {
  const { subscribe, set, update } = writable<AppState>({
    drag: initialDragState,
    car: {
      rotation: 0,
      color: '#1a1a2e',
      placedAssets: [],
    },
    selectedAssetId: null,
    showGrid: true,
    autoRotate: true,
  });

  return {
    subscribe,
    set,
    update,

    // Drag actions
    startDrag: (asset: Asset3D, mouseX: number, mouseY: number) => {
      update(state => ({
        ...state,
        drag: {
          isDragging: true,
          asset,
          mousePosition: { x: mouseX, y: mouseY },
          worldPosition: null,
          surfaceNormal: null,
        },
        autoRotate: false,
      }));
    },

    updateDrag: (
      mouseX: number,
      mouseY: number,
      worldPos?: { x: number; y: number; z: number },
      normal?: { x: number; y: number; z: number }
    ) => {
      update(state => ({
        ...state,
        drag: {
          ...state.drag,
          mousePosition: { x: mouseX, y: mouseY },
          worldPosition: worldPos ?? state.drag.worldPosition,
          surfaceNormal: normal ?? state.drag.surfaceNormal,
        },
      }));
    },

    endDrag: () => {
      update(state => ({
        ...state,
        drag: initialDragState,
        autoRotate: true,
      }));
    },

    // Place asset on car
    placeAsset: (
      asset: Asset3D,
      position: { x: number; y: number; z: number },
      rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
    ) => {
      const placedAsset: PlacedAsset = {
        id: `${asset.id}-${Date.now()}`,
        assetId: asset.id,
        position,
        rotation,
        scale: asset.scale,
        color: asset.color,
      };

      update(state => ({
        ...state,
        car: {
          ...state.car,
          placedAssets: [...state.car.placedAssets, placedAsset],
        },
        drag: initialDragState,
        autoRotate: true,
      }));
    },

    // Remove placed asset
    removeAsset: (placedAssetId: string) => {
      update(state => ({
        ...state,
        car: {
          ...state.car,
          placedAssets: state.car.placedAssets.filter(
            a => a.id !== placedAssetId
          ),
        },
      }));
    },

    // Select asset for editing
    selectAsset: (assetId: string | null) => {
      update(state => ({
        ...state,
        selectedAssetId: assetId,
      }));
    },

    // Toggle settings
    toggleGrid: () => {
      update(state => ({
        ...state,
        showGrid: !state.showGrid,
      }));
    },

    toggleAutoRotate: () => {
      update(state => ({
        ...state,
        autoRotate: !state.autoRotate,
      }));
    },

    // Change car color
    setCarColor: (color: string) => {
      update(state => ({
        ...state,
        car: {
          ...state.car,
          color,
        },
      }));
    },

    // Clear all placed assets
    clearAll: () => {
      update(state => ({
        ...state,
        car: {
          ...state.car,
          placedAssets: [],
        },
        selectedAssetId: null,
      }));
    },
  };
}

export const appStore = createAppStore();

// Derived stores for convenience
export const isDragging = derived(appStore, $app => $app.drag.isDragging);
export const currentDragAsset = derived(appStore, $app => $app.drag.asset);
export const placedAssets = derived(appStore, $app => $app.car.placedAssets);
export const carColor = derived(appStore, $app => $app.car.color);
