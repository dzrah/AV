import { writable, derived } from 'svelte/store';
import { placedAssets } from './stores';

interface GameState {
	started: boolean;
	completed: boolean;
	showCongrats: boolean;
}

function createGameStore() {
	const { subscribe, set, update } = writable<GameState>({
		started: false,
		completed: false,
		showCongrats: false,
	});

	return {
		subscribe,

		startGame: () => {
			update(state => ({
				...state,
				started: true,
			}));
		},

		completeGame: () => {
			update(state => ({
				...state,
				completed: true,
				showCongrats: true,
			}));
		},

		closeCongrats: () => {
			update(state => ({
				...state,
				showCongrats: false,
			}));
		},

		reset: () => {
			set({
				started: false,
				completed: false,
				showCongrats: false,
			});
		},
	};
}

export const gameStore = createGameStore();

// Derived stores
export const gameStarted = derived(gameStore, $state => $state.started);
export const gameCompleted = derived(gameStore, $state => $state.completed);
export const showCongrats = derived(gameStore, $state => $state.showCongrats);

// Track how many components are placed on the car (dragged from sidebar)
export const mountedCount = derived(placedAssets, $placed => $placed.length);

// Check if all 6 components are mounted
export const allMounted = derived(mountedCount, $count => $count >= 6);
