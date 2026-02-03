import type { PlacementZone, Asset3D } from './types';

/**
 * All placement zones on the car for component placement validation.
 * Zones are defined in car-local coordinates to work with both GLB and primitive car models.
 *
 * Coordinate system (car-local):
 * - X axis: -1.75 (front) to +1.75 (rear)
 * - Y axis: 0.1 (ground) to 1.25 (roof)
 * - Z axis: -0.9 (left) to +0.9 (right)
 */

export const placementZones: PlacementZone[] = [
	// ============================================
	// HOOD ZONES (top front of car)
	// ============================================
	{
		id: 'hood-center',
		name: 'Hood Center',
		type: 'box',
		center: { x: -1.1, y: 0.75, z: 0 },
		size: { x: 0.8, y: 0.5, z: 1.2 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'hood-left',
		name: 'Hood Left',
		type: 'box',
		center: { x: -1.1, y: 0.75, z: -0.5 },
		size: { x: 0.8, y: 0.3, z: 0.5 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'hood-right',
		name: 'Hood Right',
		type: 'box',
		center: { x: -1.1, y: 0.75, z: 0.5 },
		size: { x: 0.8, y: 0.3, z: 0.5 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},

	// ============================================
	// ROOF ZONES (top of car)
	// ============================================
	{
		id: 'roof-center',
		name: 'Roof Center',
		type: 'box',
		center: { x: 0.1, y: 1.2, z: 0 },
		size: { x: 1.0, y: 0.3, z: 1.0 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'roof-front',
		name: 'Roof Front',
		type: 'box',
		center: { x: -0.5, y: 1.2, z: 0 },
		size: { x: 0.6, y: 0.5, z: 1.0 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'roof-rear',
		name: 'Roof Rear',
		type: 'box',
		center: { x: 0.7, y: 1.2, z: 0 },
		size: { x: 0.6, y: 0.5, z: 1.0 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},

	// ============================================
	// SIDE ZONES (left and right sides)
	// ============================================
	{
		id: 'side-left-front',
		name: 'Side Left Front',
		type: 'box',
		center: { x: -0.8, y: 0.6, z: -0.95 },
		size: { x: 0.6, y: 0.8, z: 0.4 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'side-left-rear',
		name: 'Side Left Rear',
		type: 'box',
		center: { x: 0.8, y: 0.6, z: -0.95 },
		size: { x: 0.6, y: 0.8, z: 0.4 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'side-right-front',
		name: 'Side Right Front',
		type: 'box',
		center: { x: -0.8, y: 0.6, z: 0.95 },
		size: { x: 0.6, y: 0.8, z: 0.4 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'side-right-rear',
		name: 'Side Right Rear',
		type: 'box',
		center: { x: 0.8, y: 0.6, z: 0.95 },
		size: { x: 0.6, y: 0.8, z: 0.4 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},

	// ============================================
	// FRONT ZONES
	// ============================================
	{
		id: 'front-bumper-center',
		name: 'Front Bumper Center',
		type: 'box',
		center: { x: -2.0, y: 0.25, z: 0 },
		size: { x: 0.4, y: 0.6, z: 1.0 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'front-bumper-left',
		name: 'Front Bumper Left',
		type: 'box',
		center: { x: -2.0, y: 0.25, z: -0.5 },
		size: { x: 0.4, y: 0.6, z: 0.5 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'front-bumper-right',
		name: 'Front Bumper Right',
		type: 'box',
		center: { x: -2.0, y: 0.25, z: 0.5 },
		size: { x: 0.4, y: 0.6, z: 0.5 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},

	// ============================================
	// REAR ZONES
	// ============================================
	{
		id: 'rear-bumper-center',
		name: 'Rear Bumper Center',
		type: 'box',
		center: { x: 2.0, y: 0.25, z: 0 },
		size: { x: 0.4, y: 0.6, z: 1.0 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'rear-left-side',
		name: 'Rear Left Side',
		type: 'box',
		center: { x: 1.3, y: 0.6, z: -0.95 },
		size: { x: 0.8, y: 0.8, z: 0.4 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'rear-right-side',
		name: 'Rear Right Side',
		type: 'box',
		center: { x: 1.3, y: 0.6, z: 0.95 },
		size: { x: 0.8, y: 0.8, z: 0.4 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},

	// ============================================
	// BOTTOM ZONES (underneath car)
	// ============================================
	{
		id: 'undercar-center',
		name: 'Under Car Center',
		type: 'box',
		center: { x: 0.0, y: -0.05, z: 0 },
		size: { x: 2.0, y: 0.3, z: 1.0 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'undercar-front',
		name: 'Under Car Front',
		type: 'box',
		center: { x: -1.0, y: -0.05, z: 0 },
		size: { x: 1.0, y: 0.3, z: 1.0 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'undercar-rear',
		name: 'Under Car Rear',
		type: 'box',
		center: { x: 1.0, y: -0.05, z: 0 },
		size: { x: 1.0, y: 0.3, z: 1.0 },
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},

	// ============================================
	// WHEEL ZONES
	// ============================================
	{
		id: 'wheel-front-left',
		name: 'Wheel Front Left',
		type: 'sphere',
		center: { x: -1.1, y: 0.15, z: -0.9 },
		radius: 0.4,
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'wheel-front-right',
		name: 'Wheel Front Right',
		type: 'sphere',
		center: { x: -1.1, y: 0.15, z: 0.9 },
		radius: 0.4,
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'wheel-rear-left',
		name: 'Wheel Rear Left',
		type: 'sphere',
		center: { x: 1.1, y: 0.15, z: -0.9 },
		radius: 0.4,
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	},
	{
		id: 'wheel-rear-right',
		name: 'Wheel Rear Right',
		type: 'sphere',
		center: { x: 1.1, y: 0.15, z: 0.9 },
		radius: 0.4,
		visualIndicator: { color: '#00ff88', opacity: 0.3 }
	}
];

/**
 * Get a zone by its ID
 */
export function getZoneById(id: string): PlacementZone | undefined {
	return placementZones.find(zone => zone.id === id);
}

/**
 * Get all valid zones for an asset
 */
export function getZonesForAsset(asset: Asset3D): PlacementZone[] {
	if (!asset.validZones || asset.validZones.length === 0) {
		return [];
	}
	return asset.validZones
		.map(zoneId => getZoneById(zoneId))
		.filter((zone): zone is PlacementZone => zone !== undefined);
}

/**
 * Get all preferred zones for an asset
 */
export function getPreferredZonesForAsset(asset: Asset3D): PlacementZone[] {
	if (!asset.preferredZones || asset.preferredZones.length === 0) {
		return getZonesForAsset(asset);
	}
	return asset.preferredZones
		.map(zoneId => getZoneById(zoneId))
		.filter((zone): zone is PlacementZone => zone !== undefined);
}

/**
 * Get all placement zones
 */
export function getAllZones(): PlacementZone[] {
	return placementZones;
}

/**
 * Get zones by category (for filtering/visualization)
 */
export function getZonesByCategory(category: 'hood' | 'roof' | 'side' | 'front' | 'rear' | 'undercar' | 'wheels'): PlacementZone[] {
	const categoryMap: Record<string, string[]> = {
		hood: ['hood-center', 'hood-left', 'hood-right'],
		roof: ['roof-center', 'roof-front', 'roof-rear'],
		side: ['side-left-front', 'side-left-rear', 'side-right-front', 'side-right-rear'],
		front: ['front-bumper-center', 'front-bumper-left', 'front-bumper-right'],
		rear: ['rear-bumper-center', 'rear-left-side', 'rear-right-side'],
		undercar: ['undercar-center', 'undercar-front', 'undercar-rear'],
		wheels: ['wheel-front-left', 'wheel-front-right', 'wheel-rear-left', 'wheel-rear-right']
	};

	return (categoryMap[category] || [])
		.map(zoneId => getZoneById(zoneId))
		.filter((zone): zone is PlacementZone => zone !== undefined);
}
