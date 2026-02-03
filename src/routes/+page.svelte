<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { onMount } from 'svelte';
	import Scene from '$lib/components/Scene.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Controls from '$lib/components/Controls.svelte';
	import StartScreen from '$lib/components/StartScreen.svelte';
	import CongratsPopup from '$lib/components/CongratsPopup.svelte';
	import { appStore, isDragging, currentDragAsset, placedAssets } from '$lib/stores';
	import { gameStore, gameStarted, showCongrats, mountedCount, gameCompleted } from '$lib/gameStore';
	import { browser } from '$app/environment';

	let mounted = $state(false);
	let dragging = $derived($isDragging);
	let dragAsset = $derived($currentDragAsset);
	let placedCount = $derived($placedAssets.length);
	let started = $derived($gameStarted);
	let showCongratsPopup = $derived($showCongrats);
	let numMounted = $derived($mountedCount);
	let completed = $derived($gameCompleted);

	let sceneRef: { placeCurrentAsset: () => boolean } | undefined = $state(undefined);

	onMount(() => {
		mounted = true;
	});

	// Watch for all 6 components being mounted
	$effect(() => {
		if (numMounted >= 6 && !completed) {
			gameStore.completeGame();
		}
	});

	function handleMouseMove(event: MouseEvent) {
		if (dragging) {
			appStore.updateDrag(event.clientX, event.clientY);
		}
	}

	function handleMouseUp(event: MouseEvent) {
		if (!dragging) return;

		const target = event.target as HTMLElement;

		if (target.closest('[data-panel]') || event.clientX < 260 || event.clientX > window.innerWidth - 260) {
			appStore.endDrag();
			return;
		}

		if (sceneRef) {
			const placed = sceneRef.placeCurrentAsset();
			if (!placed) {
				appStore.endDrag();
			}
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && dragging) {
			appStore.endDrag();
		}
	}
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} onkeydown={handleKeyDown} />

<div class="relative w-full h-screen overflow-hidden bg-surface-900">
	<!-- ======== BACKGROUND ATMOSPHERE ======== -->
	<!-- Radial glow from center -->
	<div
		class="absolute inset-0 pointer-events-none"
		style="background: radial-gradient(ellipse 60% 50% at 50% 55%, rgba(20, 80, 180, 0.12) 0%, rgba(8, 16, 38, 0.3) 50%, transparent 80%);"
	></div>
	<!-- Top atmospheric fade -->
	<div
		class="absolute inset-x-0 top-0 h-48 pointer-events-none"
		style="background: linear-gradient(to bottom, rgba(10, 20, 50, 0.8) 0%, transparent 100%);"
	></div>
	<!-- Subtle grid background -->
	<div
		class="absolute inset-0 opacity-[0.03] pointer-events-none"
		style="background-image: linear-gradient(rgba(20, 130, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 130, 255, 1) 1px, transparent 1px); background-size: 60px 60px;"
	></div>

	<!-- ======== 3D CANVAS (full width, layered behind UI) ======== -->
	{#if mounted && browser}
		<div class="absolute inset-0">
			<Canvas>
				<Scene bind:this={sceneRef} />
			</Canvas>
		</div>
	{/if}

	<!-- Loading state -->
	{#if !mounted}
		<div class="absolute inset-0 flex items-center justify-center z-50">
			<div class="text-center">
				<div class="w-14 h-14 border-2 border-holo-cyan/30 border-t-holo-cyan rounded-full animate-spin mx-auto mb-4"></div>
				<p class="font-display text-sm tracking-[0.2em] text-holo-pale/60 uppercase">Initializing Garage</p>
			</div>
		</div>
	{/if}

	<!-- ======== HUD OVERLAY ======== -->

	<!-- TOP BAR: Title + Stats -->
	<header class="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-6 py-3 pointer-events-none">
		<!-- Left: Branding -->
		<div class="pointer-events-auto">
			<h1 class="font-display text-xl font-extrabold tracking-[0.2em] uppercase"
				style="color: rgba(0, 220, 255, 0.9); text-shadow: 0 0 20px rgba(0, 220, 255, 0.4), 0 0 40px rgba(20, 100, 255, 0.2);">
				Space42 POC
			</h1>
			<p class="font-body text-[10px] tracking-[0.3em] uppercase text-holo-pale/40 -mt-0.5">Vehicle Customization Studio</p>
		</div>

		<!-- Center: Vehicle Stats -->
		<div class="hud-panel relative rounded-lg px-5 py-2.5 pointer-events-auto hud-corner-tl hud-corner-br">
			<div class="flex items-center gap-3">
				<!-- Hex icon -->
				<div class="w-8 h-8 flex items-center justify-center rounded-md border border-holo-cyan/20"
					style="background: rgba(0, 220, 255, 0.05);">
					<svg class="w-4 h-4 text-holo-cyan/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<div>
					<div class="font-display text-[10px] tracking-[0.15em] text-holo-pale/50 uppercase">Mounted</div>
					<div class="font-mono text-lg text-holo-cyan leading-none" style="text-shadow: 0 0 8px rgba(0, 220, 255, 0.4);">
						{numMounted} / 6
					</div>
				</div>
			</div>
		</div>

		<!-- Right: Progress badge -->
		<div class="pointer-events-auto">
			<div class="hud-panel relative rounded-lg px-4 py-2 text-center hud-corner-tl">
				<div class="font-display text-[9px] tracking-[0.2em] text-holo-pale/40 uppercase">Progress</div>
				<div class="font-display text-2xl font-bold leading-none"
					style="color: {numMounted >= 6 ? 'rgba(0, 255, 136, 1)' : 'rgba(0, 220, 255, 1)'}; text-shadow: 0 0 12px {numMounted >= 6 ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 220, 255, 0.5)'};">
					{Math.round((numMounted / 6) * 100)}%
				</div>
			</div>
		</div>
	</header>

	<!-- LEFT PANEL: Garage Parts -->
	<Sidebar />

	<!-- RIGHT PANEL: Controls / Upgrades -->
	<Controls />

	<!-- BOTTOM: Drag instruction + Zone Info -->
	<div class="fixed bottom-6 inset-x-0 z-20 flex justify-center pointer-events-none">
		{#if dragging && dragAsset}
			<div class="hud-panel rounded-lg px-6 py-3 animate-in max-w-2xl">
				<div class="flex flex-col gap-2">
					<div class="font-display text-xs tracking-[0.2em] uppercase"
						style="color: rgba(0, 220, 255, 0.9); text-shadow: 0 0 10px rgba(0, 220, 255, 0.4);">
						Drag onto car to snap · Click to equip · ESC to cancel
					</div>
					<div style="height: 1px; background: rgba(0, 220, 255, 0.2);"></div>
					<div style="display: flex; gap: 16px; font-size: 12px;">
						<div style="color: rgba(0, 220, 255, 0.8); font-weight: 600;">
							📍 {dragAsset.name}
						</div>
						<div style="color: rgba(0, 220, 255, 0.7); display: flex; gap: 12px; flex-wrap: wrap;">
							{#if dragAsset.validZones && dragAsset.validZones.length > 0}
								Valid zones:
								{#each dragAsset.validZones as zoneId}
									<span>• {zoneId.split('-').join(' ')}</span>
								{/each}
							{:else}
								<span>No zones available</span>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{:else if dragging}
			<div class="hud-panel rounded-lg px-6 py-2.5 animate-in">
				<span class="font-display text-xs tracking-[0.2em] uppercase"
					style="color: rgba(0, 220, 255, 0.9); text-shadow: 0 0 10px rgba(0, 220, 255, 0.4);">
					Drag onto car to snap · Click to equip · ESC to cancel
				</span>
			</div>
		{:else}
			<div class="px-6 py-2">
				<span class="font-display text-[10px] tracking-[0.25em] uppercase text-holo-pale/25">
					Drag part to equip
				</span>
			</div>
		{/if}
	</div>

	<!-- ======== DRAG CURSOR ======== -->
	{#if dragging && dragAsset}
		<div
			class="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
			style="left: {$appStore.drag.mousePosition.x}px; top: {$appStore.drag.mousePosition.y}px;"
		>
			<div class="w-14 h-14 rounded-lg flex items-center justify-center"
				style="background: rgba(0, 220, 255, 0.08); border: 1px solid rgba(0, 220, 255, 0.3); box-shadow: 0 0 25px rgba(0, 220, 255, 0.2), inset 0 0 15px rgba(0, 220, 255, 0.05);">
				<span class="text-2xl" style="filter: drop-shadow(0 0 8px {dragAsset.color});">
					{dragAsset.icon}
				</span>
			</div>
			<div class="text-center mt-1.5">
				<span class="text-[10px] font-display tracking-wider text-holo-cyan/70 bg-surface-800/80 px-2 py-0.5 rounded">
					{dragAsset.name}
				</span>
			</div>
		</div>
	{/if}
</div>

<!-- ======== START SCREEN ======== -->
{#if !started}
	<StartScreen />
{/if}

<!-- ======== CONGRATULATIONS POPUP ======== -->
{#if showCongratsPopup}
	<CongratsPopup />
{/if}
