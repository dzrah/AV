<script lang="ts">
	import { T } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import type { PlacedAsset, GeometryType } from '$lib/types';
	import { availableAssets, appStore } from '$lib/stores';
	import GlbModel from './GlbModel.svelte';

	interactivity();

	let { placedAsset, isSelected = false }: { placedAsset: PlacedAsset; isSelected?: boolean } = $props();

	const assetDef = $derived(availableAssets.find((a) => a.id === placedAsset.assetId));
	const geometry = $derived(assetDef?.geometry ?? 'box');
	const hasModel = $derived(!!assetDef?.modelPath);

	function handleClick(e: { stopPropagation?: () => void }) {
		e.stopPropagation?.();
		appStore.selectAsset(placedAsset.id);
	}

	function handleDoubleClick(e: { stopPropagation?: () => void }) {
		e.stopPropagation?.();
		appStore.removeAsset(placedAsset.id);
	}
</script>

<T.Group
	position={[placedAsset.position.x, placedAsset.position.y, placedAsset.position.z]}
	rotation={[placedAsset.rotation.x, placedAsset.rotation.y, placedAsset.rotation.z]}
	userData={{ isPlacedAsset: true }}
	onclick={handleClick}
	ondblclick={handleDoubleClick}
>
	{#if hasModel && assetDef?.modelPath}
		<!-- GLB Model (GlbModel clones internally per instance) -->
		<T.Group
			rotation={[
				assetDef.modelRotationOffset?.x ?? 0,
				assetDef.modelRotationOffset?.y ?? 0,
				assetDef.modelRotationOffset?.z ?? 0
			]}
		>
			<GlbModel
				src={assetDef.modelPath}
				scale={placedAsset.scale}
				emissive={isSelected ? placedAsset.color : undefined}
				emissiveIntensity={isSelected ? 0.4 : 0}
			/>
		</T.Group>
	{:else}
		<!-- Primitive geometry fallback -->
		<T.Mesh scale={placedAsset.scale} castShadow>
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
				color={placedAsset.color}
				metalness={0.6}
				roughness={0.3}
				emissive={placedAsset.color}
				emissiveIntensity={isSelected ? 0.5 : 0.15}
			/>
		</T.Mesh>
	{/if}

	<!-- Selection indicator -->
	{#if isSelected}
		<T.Mesh scale={placedAsset.scale * 1.3}>
			<T.SphereGeometry args={[0.5, 16, 16]} />
			<T.MeshBasicMaterial color="#00ffff" wireframe opacity={0.5} transparent />
		</T.Mesh>
	{/if}
</T.Group>
