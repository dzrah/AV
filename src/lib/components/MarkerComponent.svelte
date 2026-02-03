<script lang="ts">
	import { T } from '@threlte/core';
	import type { Asset3D, MarkerData } from '$lib/types';
	import GlbModel from './GlbModel.svelte';

	let {
		asset,
		marker,
		visible = true,
	}: {
		asset: Asset3D;
		marker: MarkerData;
		visible?: boolean;
	} = $props();

	const geometry = $derived(asset.geometry ?? 'box');
	const hasModel = $derived(!!asset.modelPath);
</script>

{#if visible}
	<T.Group
		position={[marker.position.x, marker.position.y, marker.position.z]}
		rotation={[marker.rotation.x, marker.rotation.y, marker.rotation.z]}
		userData={{ isMarkerComponent: true, assetId: asset.id }}
	>
		{#if hasModel && asset.modelPath}
			<!-- GLB Model -->
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
				/>
			</T.Group>
		{:else}
			<!-- Primitive geometry -->
			<T.Mesh scale={asset.scale} castShadow>
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
					color={asset.color}
					metalness={0.6}
					roughness={0.3}
					emissive={asset.color}
					emissiveIntensity={0.15}
				/>
			</T.Mesh>
		{/if}
	</T.Group>
{/if}
