<script lang="ts">
	import type { Asset3D } from '$lib/types';
	import { appStore } from '$lib/stores';

	let { asset }: { asset: Asset3D } = $props();

	function handleDragStart(event: DragEvent) {
		event.dataTransfer?.setData('text/plain', asset.id);
		appStore.startDrag(asset, event.clientX, event.clientY);
	}

	function handleDragEnd(event: DragEvent) {}

	function handleMouseDown(event: MouseEvent) {
		appStore.startDrag(asset, event.clientX, event.clientY);
	}
</script>

<div
	class="asset-card group"
	draggable="true"
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	onmousedown={handleMouseDown}
	role="button"
	tabindex="0"
>
	<!-- 3D Model badge -->
	{#if asset.modelPath}
		<div class="absolute top-1.5 left-1.5 z-10">
			<span class="font-display text-[8px] tracking-wider text-holo-cyan/70 bg-holo-cyan/10 border border-holo-cyan/20 px-1 py-px rounded">
				3D
			</span>
		</div>
	{/if}

	<!-- Color dot -->
	<div class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full z-10"
		style="background-color: {asset.color}; box-shadow: 0 0 6px {asset.color}80;">
	</div>

	<!-- Icon -->
	<div class="flex items-center justify-center h-10 mb-1.5">
		<span class="text-2xl group-hover:scale-110 transition-transform duration-200"
			style="filter: drop-shadow(0 0 6px {asset.color}80);">
			{asset.icon}
		</span>
	</div>

	<!-- Name -->
	<h4 class="font-display text-[10px] font-semibold text-holo-pale/80 truncate text-center tracking-wide uppercase">
		{asset.name}
	</h4>

	<!-- Hover overlay -->
	<div class="absolute inset-0 flex items-center justify-center rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
		style="background: rgba(0, 220, 255, 0.04);">
		<span class="text-[8px] font-display text-holo-cyan/60 uppercase tracking-[0.2em]">Drag</span>
	</div>
</div>

<style>
	.asset-card {
		user-select: none;
		-webkit-user-drag: element;
	}
</style>
