<script lang="ts">
	import { availableAssets, appStore, placedAssets } from '$lib/stores';
	import AssetCard from './AssetCard.svelte';
	import type { AssetCategory } from '$lib/types';

	const categories: { id: AssetCategory; label: string; icon: string }[] = [
		{ id: 'spoilers', label: 'Body Kits', icon: '🏎️' },
		{ id: 'decals', label: 'Decals', icon: '⭐' },
		{ id: 'accessories', label: 'Accessories', icon: '📦' },
		{ id: 'lights', label: 'Lights', icon: '💡' }
	];

	let selectedCategory = $state<AssetCategory | 'all'>('all');
	let searchQuery = $state('');

	const filteredAssets = $derived(
		availableAssets.filter((asset) => {
			const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
			const matchesSearch =
				!searchQuery ||
				asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				asset.category.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		})
	);

	const placedCount = $derived($placedAssets.length);

	function handleClearAll() {
		if (placedCount > 0) {
			appStore.clearAll();
		}
	}
</script>

<aside
	data-panel="left"
	class="fixed left-0 top-0 bottom-0 w-[240px] z-20 flex flex-col"
	style="pointer-events: auto;"
>
	<!-- Panel background with gradient edge -->
	<div class="absolute inset-0 hud-panel rounded-none border-l-0 border-y-0"
		style="border-right-color: rgba(30, 120, 255, 0.15); clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%);">
	</div>

	<!-- Content -->
	<div class="relative flex flex-col h-full">
		<!-- Header -->
		<header class="px-4 pt-16 pb-3">
			<div class="hud-header flex items-center gap-2">
				<svg class="w-4 h-4 text-holo-cyan/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
						d="M11.42 15.17l-5.59-3.24a.5.5 0 00-.48.01l-.72.4a.5.5 0 00-.25.43v6.46c0 .17.09.34.25.43l5.59 3.24a.5.5 0 00.5 0l5.59-3.24a.5.5 0 00.25-.43v-6.46a.5.5 0 00-.25-.43l-.72-.4a.5.5 0 00-.48-.01l-5.59 3.24a.5.5 0 01-.5 0z" />
				</svg>
				<span>Garage Parts</span>
			</div>
		</header>

		<!-- Asset grid -->
		<div class="flex-1 px-4 pb-4 overflow-y-auto">
			<div class="grid grid-cols-2 gap-2">
				{#each filteredAssets as asset, i (asset.id)}
					<div class="animate-in" style="animation-delay: {i * 40}ms;">
						<AssetCard {asset} />
					</div>
				{/each}
			</div>

			{#if filteredAssets.length === 0}
				<div class="flex flex-col items-center justify-center h-32 text-holo-pale/25">
					<span class="text-3xl mb-2">🔍</span>
					<p class="font-body text-xs">No parts found</p>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<footer class="relative px-4 py-3 border-t border-holo-blue/10">
			<div class="flex items-center justify-between">
				<div class="font-mono text-[10px] text-holo-pale/40">
					<span class="text-holo-cyan" style="text-shadow: 0 0 6px rgba(0, 220, 255, 0.3);">{placedCount}</span>
					equipped
				</div>
				<button
					class="hud-btn text-[9px] {placedCount > 0 ? 'hover:border-red-400/40 hover:text-red-300/80' : 'opacity-30 cursor-not-allowed'}"
					disabled={placedCount === 0}
					onclick={handleClearAll}
				>
					Clear All
				</button>
			</div>
		</footer>
	</div>
</aside>

<style>
	aside ::-webkit-scrollbar {
		width: 3px;
	}
	aside ::-webkit-scrollbar-track {
		background: transparent;
	}
	aside ::-webkit-scrollbar-thumb {
		background: rgba(20, 130, 255, 0.2);
		border-radius: 2px;
	}
</style>
