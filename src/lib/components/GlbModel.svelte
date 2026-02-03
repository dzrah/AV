<script lang="ts">
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import * as THREE from 'three';

	let {
		src,
		scale = 1,
		color,
		opacity = 1,
		emissive,
		emissiveIntensity = 0,
		wireframe = false,
		castShadow = true,
		disableRaycast = false,
		preserveOriginalMaterials = false
	}: {
		src: string;
		scale?: number;
		color?: string;
		opacity?: number;
		emissive?: string;
		emissiveIntensity?: number;
		wireframe?: boolean;
		castShadow?: boolean;
		disableRaycast?: boolean;
		preserveOriginalMaterials?: boolean;
	} = $props();

	const gltf = useGltf(src);

	// Each instance gets its own clone
	let clone = $state<THREE.Object3D | null>(null);
	let normalizeScale = $state(1);
	let cx = $state(0);
	let cy = $state(0);
	let cz = $state(0);

	/**
	 * Detect if a material is a glass/transmission material.
	 * Glass materials use MeshPhysicalMaterial with transmission > 0.
	 */
	function isGlassMaterial(mat: THREE.Material): boolean {
		if (mat instanceof THREE.MeshPhysicalMaterial) {
			return mat.transmission > 0;
		}
		return false;
	}

	/**
	 * Clone material array or single material for a mesh.
	 * Each mesh gets its own material instance so we never mutate the cache.
	 */
	function cloneMeshMaterials(mesh: THREE.Mesh): void {
		if (Array.isArray(mesh.material)) {
			mesh.material = mesh.material.map((m) => m.clone());
		} else {
			mesh.material = mesh.material.clone();
		}
	}

	/**
	 * Apply visual overrides to a material without destroying glass properties.
	 * - Glass materials: only apply emissive (for selection glow), skip color/wireframe
	 * - Solid materials: apply all requested overrides
	 */
	function applyOverrides(mat: THREE.Material): void {
		const isGlass = isGlassMaterial(mat);
		const isPhysical = mat instanceof THREE.MeshPhysicalMaterial;
		const isStandard = mat instanceof THREE.MeshStandardMaterial;

		if (!isStandard && !isPhysical) return; // Only override PBR materials

		const pbr = mat as THREE.MeshStandardMaterial;

		// --- Color override: skip for glass (preserves transmission look) ---
		if (color && !isGlass) {
			pbr.color = new THREE.Color(color);
		}

		// --- Opacity override ---
		if (opacity < 1) {
			if (isGlass && isPhysical) {
				// For glass, scale transmission down to simulate opacity fade
				const phys = mat as THREE.MeshPhysicalMaterial;
				phys.transmission = phys.transmission * opacity;
			} else {
				pbr.transparent = true;
				pbr.opacity = opacity;
			}
		}

		// --- Emissive override: safe for all materials including glass ---
		if (emissive) {
			pbr.emissive = new THREE.Color(emissive);
			pbr.emissiveIntensity = emissiveIntensity;
		}

		// --- Wireframe: skip for glass (would hide the glass effect) ---
		if (wireframe && !isGlass) {
			pbr.wireframe = true;
		}
	}

	$effect(() => {
		const data = $gltf;
		if (!data?.scene) {
			clone = null;
			return;
		}

		// Always clone the scene graph so we never mutate the useGltf cache
		const sceneClone = data.scene.clone(true);

		// Calculate bounding box for normalization
		const box = new THREE.Box3().setFromObject(sceneClone);
		const size = box.getSize(new THREE.Vector3());
		const center = box.getCenter(new THREE.Vector3());
		const maxDim = Math.max(size.x, size.y, size.z);

		normalizeScale = maxDim > 0 ? 1 / maxDim : 1;
		cx = -center.x;
		cy = -center.y;
		cz = -center.z;

		const needsOverrides = !preserveOriginalMaterials && (color || opacity < 1 || emissive || wireframe);

		// Setup meshes on the clone
		sceneClone.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = castShadow;
				child.receiveShadow = true;

				if (disableRaycast) {
					child.raycast = () => {};
				}

				// ALWAYS clone materials per-instance to avoid cache corruption.
				// scene.clone(true) clones the scene graph but shares material refs.
				cloneMeshMaterials(child);

				// Apply visual overrides if needed
				if (needsOverrides) {
					if (Array.isArray(child.material)) {
						child.material.forEach((m) => applyOverrides(m));
					} else {
						applyOverrides(child.material);
					}
				}

				// Ensure glass materials render correctly:
				// Transmission materials need specific render order and depth settings
				const mats = Array.isArray(child.material) ? child.material : [child.material];
				for (const mat of mats) {
					if (isGlassMaterial(mat)) {
						child.renderOrder = 1; // Render after opaque objects
						const phys = mat as THREE.MeshPhysicalMaterial;
						phys.depthWrite = false;
						phys.transparent = true;
						// Ensure transmission settings are active
						if (phys.thickness === 0) phys.thickness = 0.5;
					}
				}
			}
		});

		clone = sceneClone;
	});
</script>

{#if clone}
	<T.Group scale={normalizeScale * scale}>
		<T.Group position.x={cx} position.y={cy} position.z={cz}>
			<T is={clone} />
		</T.Group>
	</T.Group>
{:else}
	<!-- Loading fallback -->
	<T.Mesh scale={scale * 0.3} raycast={null}>
		<T.SphereGeometry args={[0.5, 8, 8]} />
		<T.MeshStandardMaterial
			color={color ?? '#888888'}
			transparent
			opacity={0.4}
			wireframe
		/>
	</T.Mesh>
{/if}
