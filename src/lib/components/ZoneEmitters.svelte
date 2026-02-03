<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import type { Asset3D, PlacementZone } from '$lib/types';
	import { getAllZones } from '$lib/placementZones';
	import * as THREE from 'three';

	let {
		visible = false,
		dragAsset = null,
		carCenter = { x: 0, y: 0.6, z: 0 }
	}: {
		visible?: boolean;
		dragAsset?: Asset3D | null;
		carCenter?: { x: number; y: number; z: number };
	} = $props();

	const { scene } = useThrelte();

	const surfaceOffset = 0.15; // Push zones outward onto the surface
	const zoneIndicatorRadius = 0.15; // Small indicator radius, not based on zone size

	// Pre-created zone meshes - maps zone.id to mesh object
	let zoneMeshes = $state<Map<string, THREE.Mesh>>(new Map());
	let zonesInitialized = $state(false);

	// Calculate surface position for a zone - offset outward from car center
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
		return {
			x: zone.center.x + nx * surfaceOffset,
			y: zone.center.y + ny * surfaceOffset,
			z: zone.center.z + nz * surfaceOffset
		};
	}

	// Initialize all zone meshes once
	function initializeZoneMeshes() {
		if (zonesInitialized) return;

		const allZones = getAllZones();

		allZones.forEach(zone => {
			// Create small circular disc geometry - fixed size indicator
			const geometry = new THREE.CylinderGeometry(zoneIndicatorRadius, zoneIndicatorRadius, 0.01, 16);
			const material = new THREE.MeshBasicMaterial({
				color: 0x00ff88,
				transparent: true,
				opacity: 0.6,
				depthWrite: false,
				depthTest: true,
				side: THREE.DoubleSide
			});
			// MeshBasicMaterial uses color for emissive-like effect
			material.color.setHex(0x00ff88);

			const mesh = new THREE.Mesh(geometry, material);

			// Position mesh at surface offset, not at zone center
			const surfacePos = getSurfacePosition(zone);
			mesh.position.set(surfacePos.x, surfacePos.y, surfacePos.z);
			mesh.raycast = () => null as any; // Disable raycasting for this mesh
			mesh.visible = false; // Start hidden

			scene.add(mesh);
			zoneMeshes.set(zone.id, mesh);
		});

		zonesInitialized = true;
	}

	// Update zone visibility based on current drag asset
	function updateZoneVisibility() {
		if (!zoneMeshes.size) {
			initializeZoneMeshes();
		}

		// Hide all zones first
		zoneMeshes.forEach(mesh => {
			mesh.visible = false;
		});

		// Show only valid zones for current asset if dragging
		if (visible && dragAsset?.validZones) {
			dragAsset.validZones.forEach(zoneId => {
				const mesh = zoneMeshes.get(zoneId);
				if (mesh) {
					mesh.visible = true;
				}
			});
		}
	}

	// Watch for changes to visible and dragAsset
	$effect(() => {
		updateZoneVisibility();
	});

	// Cleanup on unmount
	$effect.pre(() => {
		return () => {
			// Remove all zone meshes from scene when component is destroyed
			zoneMeshes.forEach(mesh => {
				scene.remove(mesh);
				(mesh.geometry as THREE.BufferGeometry).dispose();
				(mesh.material as THREE.MeshBasicMaterial).dispose();
			});
			zoneMeshes.clear();
		};
	});
</script>

<!-- No dynamic rendering - zones are pre-created and managed via visibility -->
