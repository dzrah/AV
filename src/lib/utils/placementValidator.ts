import type { PlacementZone, Asset3D, ZoneValidationResult } from '../types';
import { Vector3 } from 'three';

/**
 * Validates component placement against defined zones
 */
export class PlacementValidator {
	zones: PlacementZone[];

	constructor(zones: PlacementZone[]) {
		this.zones = zones;
	}

	/**
	 * Check if a 3D point is inside a zone
	 */
	isPointInZone(point: { x: number; y: number; z: number }, zone: PlacementZone): boolean {
		const px = point.x;
		const py = point.y;
		const pz = point.z;

		if (zone.type === 'box') {
			if (!zone.size) return false;
			const dx = Math.abs(px - zone.center.x);
			const dy = Math.abs(py - zone.center.y);
			const dz = Math.abs(pz - zone.center.z);
			return dx <= zone.size.x / 2 && dy <= zone.size.y / 2 && dz <= zone.size.z / 2;
		}

		if (zone.type === 'sphere') {
			if (!zone.radius) return false;
			const dx = px - zone.center.x;
			const dy = py - zone.center.y;
			const dz = pz - zone.center.z;
			const distSq = dx * dx + dy * dy + dz * dz;
			return distSq <= zone.radius * zone.radius;
		}

		if (zone.type === 'cylinder') {
			if (!zone.radius || !zone.height) return false;
			const dx = px - zone.center.x;
			const dy = py - zone.center.y;
			const dz = pz - zone.center.z;
			const radialDistSq = dx * dx + dz * dz;
			return radialDistSq <= zone.radius * zone.radius && Math.abs(dy) <= zone.height / 2;
		}

		return false;
	}

	/**
	 * Find all zones containing a point
	 */
	findZonesAtPoint(point: { x: number; y: number; z: number }): PlacementZone[] {
		return this.zones.filter(zone => this.isPointInZone(point, zone));
	}

	/**
	 * Calculate distance from point to zone center
	 */
	distanceToZone(point: { x: number; y: number; z: number }, zone: PlacementZone): number {
		const dx = point.x - zone.center.x;
		const dy = point.y - zone.center.y;
		const dz = point.z - zone.center.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}

	/**
	 * Check if surface normal is compatible with zone constraints
	 */
	isNormalCompatible(normal: { x: number; y: number; z: number } | undefined, zone: PlacementZone): boolean {
		if (!zone.normalConstraints || !normal) return true;

		// Normalize the vectors
		const n1 = new Vector3(normal.x, normal.y, normal.z).normalize();
		const n2 = new Vector3(
			zone.normalConstraints.preferredDirection.x,
			zone.normalConstraints.preferredDirection.y,
			zone.normalConstraints.preferredDirection.z
		).normalize();

		// Calculate dot product
		const dotProduct = Math.abs(n1.dot(n2));
		return dotProduct >= zone.normalConstraints.tolerance;
	}

	/**
	 * Find the closest valid zone for an asset
	 */
	getClosestValidZone(
		asset: Asset3D,
		position: { x: number; y: number; z: number }
	): { zone: PlacementZone; distance: number } | null {
		if (!asset.validZones || asset.validZones.length === 0) return null;

		const validZones = asset.validZones
			.map(zoneId => this.zones.find(z => z.id === zoneId))
			.filter((z): z is PlacementZone => z !== undefined);

		if (validZones.length === 0) return null;

		let closest: { zone: PlacementZone; distance: number } | null = null;

		for (const zone of validZones) {
			const distance = this.distanceToZone(position, zone);
			if (!closest || distance < closest.distance) {
				closest = { zone, distance };
			}
		}

		return closest;
	}

	/**
	 * Validate if an asset can be placed at a specific position
	 */
	validatePlacement(
		asset: Asset3D,
		position: { x: number; y: number; z: number },
		normal?: { x: number; y: number; z: number }
	): ZoneValidationResult {
		// If no zones defined, placement is valid anywhere
		if (!asset.validZones || asset.validZones.length === 0) {
			return {
				isValid: true,
				zone: null,
				distance: 0,
				message: 'No placement restrictions'
			};
		}

		// Find zones containing this position
		const validZones = asset.validZones
			.map(zoneId => this.zones.find(z => z.id === zoneId))
			.filter((z): z is PlacementZone => z !== undefined);

		const zonesAtPoint = validZones.filter(zone => this.isPointInZone(position, zone));

		// If in a valid zone, check normal compatibility
		if (zonesAtPoint.length > 0) {
			// Sort by normal compatibility if normal is provided
			if (normal) {
				zonesAtPoint.sort((a, b) => {
					const aCompat = this.isNormalCompatible(normal, a) ? 1 : 0;
					const bCompat = this.isNormalCompatible(normal, b) ? 1 : 0;
					return bCompat - aCompat;
				});
			}

			const zone = zonesAtPoint[0];
			return {
				isValid: true,
				zone,
				distance: this.distanceToZone(position, zone),
				message: `Placed in ${zone.name}`
			};
		}

		// Not in a valid zone - find closest valid zone
		const closest = this.getClosestValidZone(asset, position);

		return {
			isValid: false,
			zone: null,
			distance: closest?.distance ?? Number.MAX_VALUE,
			message: `Not in valid zone. Try ${closest?.zone.name || 'a valid zone'}`,
			suggestedZone: closest?.zone.id
		};
	}

	/**
	 * Get all zones that could accept an asset
	 */
	getValidZonesForAsset(asset: Asset3D): PlacementZone[] {
		if (!asset.validZones || asset.validZones.length === 0) {
			return [];
		}
		return asset.validZones
			.map(zoneId => this.zones.find(z => z.id === zoneId))
			.filter((z): z is PlacementZone => z !== undefined);
	}
}
