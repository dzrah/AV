<script lang="ts">
	import { T } from '@threlte/core';
	import type { Asset3D, GeometryType, ZoneValidationResult } from '$lib/types';
	import GlbModel from './GlbModel.svelte';

	let {
		asset,
		position,
		rotation = { x: 0, y: 0, z: 0 },
		visible = true,
		isSnapped = false,
		hasSnappedBefore = false,
		validationResult = null,
		surfaceNormal = null
	}: {
		asset: Asset3D;
		position: { x: number; y: number; z: number };
		rotation?: { x: number; y: number; z: number };
		visible?: boolean;
		isSnapped?: boolean;
		hasSnappedBefore?: boolean;
		validationResult?: ZoneValidationResult | null;
		surfaceNormal?: { x: number; y: number; z: number } | null;
	} = $props();

	const geometry = $derived(asset.geometry);
	const hasModel = $derived(!!asset.modelPath);

	// Determine colors based on validation result
	const isValidPlacement = $derived(validationResult?.isValid ?? false);
	const previewColor = $derived(isSnapped ? asset.color : (hasSnappedBefore ? asset.color : '#ff6666'));
	const opacity = $derived(isSnapped ? 0.9 : (hasSnappedBefore ? 0.6 : 0.3));

	// Emissive glow effect for valid placements (simplified)
	const emissiveIntensity = $derived(isSnapped && isValidPlacement ? 0.8 : (isSnapped ? 0.5 : 0.2));

	// Ring color: green for valid, red for invalid, orange for previously snapped
	const ringColor = $derived.by(() => {
		if (isSnapped) {
			return isValidPlacement ? '#00ff88' : '#ff4444';
		}
		if (hasSnappedBefore) {
			return '#ffaa00';
		}
		return '#ff4444';
	});

	// Ring position and rotation - simple fixed values
	const ringPosition = { x: 0, y: -0.05, z: 0 };
	const ringRotation = { x: -Math.PI / 2, y: 0, z: 0 };
</script>

{#if visible}
	<T.Group 
		position={[position.x, position.y, position.z]} 
		rotation={[rotation.x, rotation.y, rotation.z]}
		userData={{ isPreview: true }}
	>
		{#if hasModel && asset.modelPath}
			<!-- GLB Model preview -->
			<T.Group
				rotation={[
					asset.modelRotationOffset?.x ?? 0,
					asset.modelRotationOffset?.y ?? 0,
					asset.modelRotationOffset?.z ?? 0
				]}
			>
				<GlbModel
					src={asset.modelPath}
					scale={asset.scale}
					color={previewColor}
					opacity={opacity}
					emissive={previewColor}
					emissiveIntensity={emissiveIntensity}
					disableRaycast={true}
					castShadow={false}
				/>
			</T.Group>
		{:else}
			<!-- Primitive geometry preview -->
			<T.Mesh scale={asset.scale} raycast={null}>
				{#if geometry === 'box'}
					<T.BoxGeometry args={[1, 1, 1]} />
				{:else if geometry === 'sphere'}
					<T.SphereGeometry args={[0.5, 32, 32]} />
				{:else if geometry === 'cone'}
					<T.ConeGeometry args={[0.5, 1, 16]} />
				{:else if geometry === 'cylinder'}
					<T.CylinderGeometry args={[0.3, 0.3, 1, 16]} />
				{:else if geometry === 'torus'}
					<T.TorusGeometry args={[0.4, 0.15, 16, 32]} />
				{:else if geometry === 'dodecahedron'}
					<T.DodecahedronGeometry args={[0.5]} />
				{:else if geometry === 'octahedron'}
					<T.OctahedronGeometry args={[0.5]} />
				{:else if geometry === 'tetrahedron'}
					<T.TetrahedronGeometry args={[0.5]} />
				{/if}

				<T.MeshStandardMaterial
					color={previewColor}
					metalness={0.8}
					roughness={0.2}
					transparent
					opacity={opacity}
					emissive={previewColor}
					emissiveIntensity={emissiveIntensity}
				/>
			</T.Mesh>
		{/if}

		<!-- Snap indicator rings -->
		{#if isSnapped}
			<T.Mesh rotation={[ringRotation.x, ringRotation.y, ringRotation.z]} position={[ringPosition.x, ringPosition.y, ringPosition.z]} raycast={null}>
				<T.RingGeometry args={[0.3, 0.5, 32]} />
				<T.MeshBasicMaterial color={ringColor} transparent opacity={isValidPlacement ? 1.0 : 0.8} side={2} />
			</T.Mesh>
			<T.Mesh rotation={[ringRotation.x, ringRotation.y, ringRotation.z]} position={[ringPosition.x * 1.2, ringPosition.y * 1.2, ringPosition.z * 1.2]} raycast={null}>
				<T.RingGeometry args={[0.5, 0.7, 32]} />
				<T.MeshBasicMaterial color={ringColor} transparent opacity={isValidPlacement ? 0.6 : 0.4} side={2} />
			</T.Mesh>
		{:else if hasSnappedBefore}
			<T.Mesh rotation={[ringRotation.x, ringRotation.y, ringRotation.z]} position={[ringPosition.x, ringPosition.y, ringPosition.z]} raycast={null}>
				<T.RingGeometry args={[0.2, 0.3, 32]} />
				<T.MeshBasicMaterial color="#ffaa00" transparent opacity={0.5} side={2} />
			</T.Mesh>
		{:else}
			<T.Mesh rotation={[ringRotation.x, ringRotation.y, ringRotation.z]} position={[ringPosition.x, ringPosition.y, ringPosition.z]} raycast={null}>
				<T.RingGeometry args={[0.15, 0.22, 32]} />
				<T.MeshBasicMaterial color="#ff4444" transparent opacity={0.4} side={2} />
			</T.Mesh>
		{/if}

		<!-- Wireframe outline when snapped (only for primitive shapes) -->
		{#if isSnapped && !hasModel}
			<T.Mesh scale={asset.scale * 1.05} raycast={null}>
				{#if geometry === 'box'}
					<T.BoxGeometry args={[1, 1, 1]} />
				{:else if geometry === 'sphere'}
					<T.SphereGeometry args={[0.5, 16, 16]} />
				{:else if geometry === 'cone'}
					<T.ConeGeometry args={[0.5, 1, 8]} />
				{:else if geometry === 'cylinder'}
					<T.CylinderGeometry args={[0.3, 0.3, 1, 8]} />
				{:else if geometry === 'torus'}
					<T.TorusGeometry args={[0.4, 0.15, 8, 16]} />
				{:else if geometry === 'dodecahedron'}
					<T.DodecahedronGeometry args={[0.5]} />
				{:else if geometry === 'octahedron'}
					<T.OctahedronGeometry args={[0.5]} />
				{:else if geometry === 'tetrahedron'}
					<T.TetrahedronGeometry args={[0.5]} />
				{/if}
				<T.MeshBasicMaterial color="#00ffff" wireframe transparent opacity={0.4} />
			</T.Mesh>
		{/if}
	</T.Group>
{/if}
