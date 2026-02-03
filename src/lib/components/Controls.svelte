<script lang="ts">
	import { appStore, carColor } from '$lib/stores';

	const carColors = [
		{ name: 'Midnight', color: '#0a1628' },
		{ name: 'Racing Red', color: '#dc2626' },
		{ name: 'Ocean Blue', color: '#1e60d0' },
		{ name: 'Forest', color: '#16a34a' },
		{ name: 'Sunset', color: '#ea580c' },
		{ name: 'Violet', color: '#7c3aed' },
		{ name: 'Gold', color: '#ca8a04' },
		{ name: 'Silver', color: '#8899aa' },
		{ name: 'Cyber Pink', color: '#ec4899' },
		{ name: 'Teal', color: '#14b8a6' }
	];

	let showGrid = $derived($appStore.showGrid);
	let autoRotate = $derived($appStore.autoRotate);
	let currentColor = $derived($carColor);
</script>

<aside
	data-panel="right"
	class="fixed right-0 top-0 bottom-0 w-[240px] z-20 flex flex-col"
	style="pointer-events: auto;"
>
	<!-- Panel background -->
	<div class="absolute inset-0 hud-panel rounded-none border-r-0 border-y-0"
		style="border-left-color: rgba(30, 120, 255, 0.15); clip-path: polygon(5% 0, 100% 0, 100% 100%, 0 100%);">
	</div>

	<div class="relative flex flex-col h-full">
		<!-- Header -->
		<header class="px-5 pt-16 pb-3">
			<div class="hud-header flex items-center gap-2">
				<svg class="w-4 h-4 text-holo-cyan/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				<span>Settings</span>
			</div>
		</header>

		<!-- Toggles Section -->
		<div class="px-5 pb-4">
			<div class="flex items-center gap-2 mb-3">
				<div class="w-1 h-3 rounded-full bg-holo-purple/40"></div>
				<span class="font-display text-[9px] tracking-[0.15em] text-holo-pale/50 uppercase">Display</span>
			</div>

			<div class="space-y-3">
				<!-- Auto Rotate -->
				<div class="flex items-center justify-between group">
					<span class="font-body text-xs text-holo-pale/50 group-hover:text-holo-pale/80 transition-colors">
						Auto Rotate
					</span>
					<button
						class="hud-toggle {autoRotate ? 'on' : ''}"
						aria-label="Toggle auto rotate"
						onclick={() => appStore.toggleAutoRotate()}
					>
						<div class="hud-toggle-knob"></div>
					</button>
				</div>

				<!-- Show Grid -->
				<div class="flex items-center justify-between group">
					<span class="font-body text-xs text-holo-pale/50 group-hover:text-holo-pale/80 transition-colors">
						Show Grid
					</span>
					<button
						class="hud-toggle {showGrid ? 'on' : ''}"
						aria-label="Toggle grid visibility"
						onclick={() => appStore.toggleGrid()}
					>
						<div class="hud-toggle-knob"></div>
					</button>
				</div>
			</div>
		</div>

		<!-- Divider -->
		<div class="mx-5 border-t border-holo-blue/10 mb-4"></div>

		<!-- Controls Section -->
		<div class="px-5 pb-4">
			<div class="flex items-center gap-2 mb-3">
				<div class="w-1 h-3 rounded-full bg-holo-magenta/30"></div>
				<span class="font-display text-[9px] tracking-[0.15em] text-holo-pale/50 uppercase">Controls</span>
			</div>

			<div class="space-y-1.5">
				{#each [
					{ key: 'Drag', desc: 'Move part onto car' },
					{ key: 'Click', desc: 'Place at position' },
					{ key: 'DblClick', desc: 'Remove placed part' },
					{ key: 'ESC', desc: 'Cancel drag' },
					{ key: 'Scroll', desc: 'Zoom in/out' }
				] as item}
					<div class="flex items-center gap-2">
						<span class="font-mono text-[9px] text-holo-cyan/50 w-14 shrink-0">{item.key}</span>
						<span class="font-body text-[10px] text-holo-pale/30">{item.desc}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Spacer -->
		<div class="flex-1"></div>

		<!-- Footer decoration -->
		<footer class="relative px-5 py-3 border-t border-holo-blue/10">
			<div class="flex items-center justify-between">
				<span class="font-mono text-[9px] text-holo-pale/20">v0.1.0</span>
				<div class="flex gap-1">
					{#each Array(3) as _, i}
						<div class="w-1.5 h-1.5 rounded-full"
							style="background: rgba(0, 220, 255, {0.15 + i * 0.1}); animation: pulseGlow 2s ease-in-out {i * 0.3}s infinite;">
						</div>
					{/each}
				</div>
			</div>
		</footer>
	</div>
</aside>
