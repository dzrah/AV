import type { Vector3, Euler } from 'three';

export interface Asset3D {
	id: string;
	name: string;
	category: AssetCategory;
	icon: string;
	color: string;
	geometry: GeometryType;
	scale: number;
	description?: string;
	/** Path to a GLB model file in /static/assets/ — when set, renders this model instead of a primitive */
	modelPath?: string;
	/** Rotation offset in radians to correct model orientation (applied on top of surface alignment) */
	modelRotationOffset?: { x: number; y: number; z: number };
	/** Valid placement zones for this component */
	validZones?: string[];
	/** Preferred zones (subset of validZones) - best fit locations */
	preferredZones?: string[];
	/** Validation mode: 'strict' = only allow valid zones, 'warning' = allow all but show feedback */
	validationMode?: 'strict' | 'warning';
	/** Name of the empty object in Blender that marks where this component should attach */
	markerName?: string;
}

export type AssetCategory = 'spoilers' | 'decals' | 'accessories' | 'lights' | 'wheels' | 'engine' | 'interior' | 'styling';

export interface PlacementZone {
	id: string;
	name: string;
	type: 'box' | 'sphere' | 'cylinder';
	center: { x: number; y: number; z: number };
	size?: { x: number; y: number; z: number }; // For box zones
	radius?: number; // For sphere/cylinder zones
	height?: number; // For cylinder zones
	normalConstraints?: {
		preferredDirection: { x: number; y: number; z: number };
		tolerance: number; // Dot product threshold (0-1)
	};
	visualIndicator?: {
		color: string;
		opacity: number;
	};
}

export interface ZoneValidationResult {
	isValid: boolean;
	zone: PlacementZone | null;
	distance: number; // Distance to zone center
	message: string;
	suggestedZone?: string; // ID of closest valid zone
}

export type GeometryType = 
	| 'box' 
	| 'sphere' 
	| 'cone' 
	| 'cylinder' 
	| 'torus' 
	| 'dodecahedron'
	| 'octahedron'
	| 'tetrahedron';

export interface PlacedAsset {
	id: string;
	assetId: string;
	position: { x: number; y: number; z: number };
	rotation: { x: number; y: number; z: number };
	scale: number;
	color: string;
}

export interface DragState {
	isDragging: boolean;
	asset: Asset3D | null;
	mousePosition: { x: number; y: number };
	worldPosition: { x: number; y: number; z: number } | null;
	surfaceNormal: { x: number; y: number; z: number } | null;
	validationResult?: ZoneValidationResult | null;
}

export interface CarState {
	rotation: number;
	color: string;
	placedAssets: PlacedAsset[];
}

export interface AppState {
	drag: DragState;
	car: CarState;
	selectedAssetId: string | null;
	showGrid: boolean;
	autoRotate: boolean;
}

/** Marker data from Blender empty objects */
export interface MarkerData {
	name: string;
	position: { x: number; y: number; z: number };
	rotation: { x: number; y: number; z: number };
	scale: { x: number; y: number; z: number };
}

/** Component attachment state - tracks which components are attached to which markers */
export interface AttachedComponent {
	assetId: string;
	markerName: string;
	visible: boolean;
}
