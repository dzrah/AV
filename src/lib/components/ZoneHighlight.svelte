<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import type { PlacementZone, Asset3D } from '$lib/types';
	import { PlacementValidator } from '$lib/utils/placementValidator';
	import { getAllZones } from '$lib/placementZones';
	import * as THREE from 'three';

	interface Props {
		zones: PlacementZone[];
		visible?: boolean;
		dragAsset?: Asset3D | null;
	}

	let { zones = [], visible = false, dragAsset = null }: Props = $props();

	const { scene } = useThrelte();

	// Create validator for checking if zone is valid for this asset
	const validator = new PlacementValidator(getAllZones());

	// Determine if a zone is valid for the current asset
	function isZoneValidForAsset(zone: PlacementZone): boolean {
		if (!dragAsset || !dragAsset.validZones) return false;
		return dragAsset.validZones.includes(zone.id);
	}

	// Zone color: green for valid, red for invalid
	function getZoneColor(zone: PlacementZone): string {
		return isZoneValidForAsset(zone) ? '#00ff88' : '#ff4444';
	}

	// Car center in car-local coordinates
	const carCenter = { x: 0, y: 0.6, z: 0 };

	// Get car meshes for raycasting (excluding preview and placed assets)
	function getCarMeshes(): THREE.Mesh[] {
		const meshes: THREE.Mesh[] = [];
		const carGroup = scene.getObjectByName('carGroup');
		if (!carGroup) return meshes;

		carGroup.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				let isExcluded = false;
				let parent: THREE.Object3D | null = child;
				while (parent) {
					if (parent.userData?.isPreview || parent.userData?.isPlacedAsset) {
						isExcluded = true;
						break;
					}
					parent = parent.parent;
				}

				const material = child.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
				const isTransparent = material && material.transparent && material.opacity < 0.9;

				if (!isExcluded && !isTransparent) {
					meshes.push(child);
				}
			}
		});
		return meshes;
	}

	// Find surface position for a zone - offset radially away from car center
	function getSurfacePosition(zone: PlacementZone): { x: number; y: number; z: number } {
		// Calculate direction from car center to zone center
		const dx = zone.center.x - carCenter.x;
		const dy = zone.center.y - carCenter.y;
		const dz = zone.center.z - carCenter.z;
		const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

		// If at car center, return zone center
		if (dist < 0.1) return zone.center;

		// Normalize direction
		const nx = dx / dist;
		const ny = dy / dist;
		const nz = dz / dist;

		// Offset zone outward from car center to position on surface
		// Use larger offset to ensure visibility on surface and avoid clipping
		const surfaceOffset = 0.15;
		return {
			x: zone.center.x + nx * surfaceOffset,
			y: zone.center.y + ny * surfaceOffset,
			z: zone.center.z + nz * surfaceOffset
		};
	}

	// Calculate zone normal direction for proper rendering
	function getZoneNormal(zone: PlacementZone): { x: number; y: number; z: number } {
		const dx = zone.center.x - carCenter.x;
		const dy = zone.center.y - carCenter.y;
		const dz = zone.center.z - carCenter.z;
		const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

		if (dist < 0.1) {
			return { x: 0, y: 1, z: 0 };
		}

		return {
			x: dx / dist,
			y: dy / dist,
			z: dz / dist
		};
	}
</script>

{#if visible && zones.length > 0}
	{#each zones as zone (zone.id)}
		{@const isValid = isZoneValidForAsset(zone)}
		{#if isValid}
			{@const zoneColor = getZoneColor(zone)}
			{@const surfacePos = getSurfacePosition(zone)}
			<!-- Ultra-minimal glowing dot indicator -->
			<T.Mesh
				position={[zone.center.x, zone.center.y, zone.center.z]}
				raycast={null}
			>
				<T.SphereGeometry args={[0.15, 4, 4]} />
				<T.MeshBasicMaterial
					color={zoneColor}
					transparent
					opacity={0.8}
					emissive={zoneColor}
					emissiveIntensity={0.7}
				/>
			</T.Mesh>
		{/if}
	{/each}
{/if}
