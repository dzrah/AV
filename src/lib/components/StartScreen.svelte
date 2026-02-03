<script lang="ts">
	import { gameStore } from '$lib/gameStore';

	function handleStart() {
		gameStore.startGame();
	}
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center bg-surface-900">
	<!-- Background effects -->
	<div
		class="absolute inset-0 pointer-events-none"
		style="background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(20, 80, 180, 0.15) 0%, rgba(8, 16, 38, 0.4) 50%, transparent 80%);"
	></div>

	<!-- Animated grid background -->
	<div
		class="absolute inset-0 opacity-[0.05] pointer-events-none"
		style="background-image: linear-gradient(rgba(20, 130, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 130, 255, 1) 1px, transparent 1px); background-size: 60px 60px; animation: gridMove 20s linear infinite;"
	></div>

	<!-- Glowing orbs -->
	<div class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-20"
		style="background: radial-gradient(circle, rgba(0, 220, 255, 0.8) 0%, transparent 70%); animation: pulse 4s ease-in-out infinite;"></div>
	<div class="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-[80px] opacity-15"
		style="background: radial-gradient(circle, rgba(100, 64, 220, 0.8) 0%, transparent 70%); animation: pulse 5s ease-in-out infinite 1s;"></div>

	<!-- Content -->
	<div class="relative z-10 text-center max-w-2xl px-8">
		<!-- Logo/Title -->
		<div class="mb-8">
			<h1 class="font-display text-6xl md:text-7xl font-extrabold tracking-[0.3em] uppercase mb-4"
				style="color: rgba(0, 220, 255, 0.95); text-shadow: 0 0 40px rgba(0, 220, 255, 0.6), 0 0 80px rgba(20, 100, 255, 0.3), 0 0 120px rgba(0, 220, 255, 0.2);">
				GIMIFY
			</h1>
			<div class="h-[2px] w-48 mx-auto mb-4"
				style="background: linear-gradient(90deg, transparent, rgba(0, 220, 255, 0.6), transparent);"></div>
			<p class="font-body text-lg tracking-[0.4em] uppercase text-holo-pale/50">
				Autonomous Vehicle Retrofit Simulator
			</p>
		</div>

		<!-- Description -->
		<div class="mb-12 space-y-4">
			<p class="font-body text-base text-holo-pale/60 leading-relaxed">
				Transform a standard vehicle into an autonomous machine by mounting
				<span class="text-holo-cyan font-semibold">6 critical components</span>
				at their designated positions.
			</p>
			<div class="flex justify-center gap-6 text-sm text-holo-pale/40">
				<span class="flex items-center gap-2">
					<span class="w-2 h-2 rounded-full bg-holo-cyan/60"></span>
					Sensors
				</span>
				<span class="flex items-center gap-2">
					<span class="w-2 h-2 rounded-full bg-holo-purple/60"></span>
					Processors
				</span>
				<span class="flex items-center gap-2">
					<span class="w-2 h-2 rounded-full bg-holo-magenta/60"></span>
					Controllers
				</span>
			</div>
		</div>

		<!-- Start Button -->
		<button
			onclick={handleStart}
			class="group relative px-12 py-5 font-display text-xl tracking-[0.3em] uppercase
				   transition-all duration-300 hover:scale-105 active:scale-95"
			style="color: rgba(0, 220, 255, 1);"
		>
			<!-- Button glow -->
			<div class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				style="background: rgba(0, 220, 255, 0.1); box-shadow: 0 0 40px rgba(0, 220, 255, 0.3), inset 0 0 20px rgba(0, 220, 255, 0.1);"></div>

			<!-- Button border -->
			<div class="absolute inset-0 rounded-lg border-2 border-holo-cyan/50 group-hover:border-holo-cyan transition-colors duration-300"></div>

			<!-- Corner accents -->
			<div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-holo-cyan rounded-tl-lg"></div>
			<div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-holo-cyan rounded-tr-lg"></div>
			<div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-holo-cyan rounded-bl-lg"></div>
			<div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-holo-cyan rounded-br-lg"></div>

			<span class="relative z-10" style="text-shadow: 0 0 20px rgba(0, 220, 255, 0.8);">
				Start Mission
			</span>
		</button>

		<!-- Instructions hint -->
		<p class="mt-8 font-mono text-xs text-holo-pale/30 tracking-wider">
			Press START to begin retrofitting
		</p>
	</div>
</div>

<style>
	@keyframes gridMove {
		0% { transform: translate(0, 0); }
		100% { transform: translate(60px, 60px); }
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.15; transform: scale(1); }
		50% { opacity: 0.25; transform: scale(1.1); }
	}
</style>
