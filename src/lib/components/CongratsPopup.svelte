<script lang="ts">
	import { onMount } from 'svelte';
	import { gameStore } from '$lib/gameStore';

	let audioRef: HTMLAudioElement | undefined = $state(undefined);
	let showConfetti = $state(false);

	onMount(() => {
		// Play success sound
		if (audioRef) {
			audioRef.volume = 0.5;
			audioRef.play().catch(() => {
				// Audio autoplay might be blocked
			});
		}

		// Trigger confetti animation
		showConfetti = true;

		// Auto-close after 8 seconds
		const timer = setTimeout(() => {
			// gameStore.closeCongrats();
		}, 8000);

		return () => clearTimeout(timer);
	});

	function handleClose() {
		gameStore.closeCongrats();
	}
</script>

<!-- Success sound - using a data URL for a simple chime -->
<audio bind:this={audioRef} preload="auto">
	<!-- Using Web Audio API synthesized sound via base64 encoded WAV -->
	<source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2LkZeWkYuEfXd0d3+Ij5SXl5KMhX57en6EjJKXl5OOiIN/fX+EipCVlpSOiYWBgISIjZKVlZKOioaDhIiMkJSVlJGMiIaFh4qOkpSUko+LiIaGiIuOkZOTkY6LiIeHiYuOkZKSj4yJh4eIioyOkJGQjo2KiIiJi42PkJCOjIqIiImKjI6PkI+NjImIiYqMjY+Pjo2LioiJiouNjo6OjYuKiYmKi4yNjY2MjIuKiouMjIyMjIyLioqLi4yMjIyMi4uLi4uLjIyMi4uLi4uLi4uLi4yMi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLgA==" type="audio/wav" />
</audio>

<div class="fixed inset-0 z-[200] flex items-center justify-center">
	<!-- Backdrop -->
	<button
		class="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn border-none cursor-default"
		onclick={handleClose}
		aria-label="Close congratulations popup"
	></button>

	<!-- Confetti particles -->
	{#if showConfetti}
		<div class="absolute inset-0 pointer-events-none overflow-hidden">
			{#each Array(50) as _, i}
				<div
					class="absolute w-3 h-3 rounded-sm"
					style="
						left: {Math.random() * 100}%;
						top: -20px;
						background: {['#00dcff', '#6440dc', '#ff0066', '#ffd700', '#00ff88'][i % 5]};
						animation: confettiFall {2 + Math.random() * 3}s ease-out forwards;
						animation-delay: {Math.random() * 0.5}s;
						transform: rotate({Math.random() * 360}deg);
					"
				></div>
			{/each}
		</div>
	{/if}

	<!-- Popup content -->
	<div class="relative z-10 max-w-lg mx-4 animate-scaleIn">
		<!-- Glow effect -->
		<div class="absolute -inset-8 rounded-3xl blur-2xl opacity-50"
			style="background: radial-gradient(circle, rgba(0, 220, 255, 0.4) 0%, rgba(100, 64, 220, 0.3) 50%, transparent 70%);"></div>

		<!-- Card -->
		<div class="relative bg-surface-800/95 rounded-2xl border border-holo-cyan/30 p-8 text-center"
			style="box-shadow: 0 0 60px rgba(0, 220, 255, 0.2), inset 0 0 30px rgba(0, 220, 255, 0.05);">

			<!-- Trophy icon -->
			<div class="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full"
				style="background: linear-gradient(135deg, rgba(0, 220, 255, 0.2) 0%, rgba(100, 64, 220, 0.2) 100%); border: 2px solid rgba(0, 220, 255, 0.4);">
				<span class="text-5xl" style="filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));">
					🏆
				</span>
			</div>

			<!-- Title -->
			<h2 class="font-display text-3xl font-bold tracking-[0.2em] uppercase mb-4"
				style="color: rgba(0, 220, 255, 1); text-shadow: 0 0 30px rgba(0, 220, 255, 0.6);">
				Congratulations!
			</h2>

			<!-- Message -->
			<p class="font-body text-lg text-holo-pale/80 mb-2 leading-relaxed">
				You have successfully mounted all
				<span class="text-holo-cyan font-bold">6 components</span>!
			</p>
			<p class="font-body text-base text-holo-pale/60 mb-6">
				You are now an <span class="text-holo-purple font-semibold">expert</span> in retrofitting cars into
				<span class="text-holo-cyan font-semibold">Autonomous Vehicles</span>!
			</p>

			<!-- Badge -->
			<div class="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8"
				style="background: linear-gradient(90deg, rgba(0, 220, 255, 0.1) 0%, rgba(100, 64, 220, 0.1) 100%); border: 1px solid rgba(0, 220, 255, 0.3);">
				<span class="text-2xl">🎖️</span>
				<span class="font-display text-sm tracking-[0.2em] uppercase text-holo-cyan">
					AV Retrofit Expert
				</span>
			</div>

			<!-- Close button -->
			<button
				onclick={handleClose}
				class="block w-full py-4 rounded-lg font-display text-base tracking-[0.2em] uppercase
					   border border-holo-cyan/40 hover:border-holo-cyan hover:bg-holo-cyan/10
					   text-holo-cyan transition-all duration-300"
			>
				Continue
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes confettiFall {
		0% {
			transform: translateY(0) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: translateY(100vh) rotate(720deg);
			opacity: 0;
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out forwards;
	}

	.animate-scaleIn {
		animation: scaleIn 0.4s ease-out forwards;
	}
</style>
