import { writable, derived } from 'svelte/store';
import type { MarkerData, AttachedComponent } from './types';
import { availableAssets } from './stores';

interface MarkerState {
	markers: Map<string, MarkerData>;
	attachedComponents: AttachedComponent[];
	markersReady: boolean;
}

function createMarkerStore() {
	const { subscribe, set, update } = writable<MarkerState>({
		markers: new Map(),
		attachedComponents: [],
		markersReady: false,
	});

	return {
		subscribe,

		// Set all discovered markers from the car model
		setMarkers: (markers: Map<string, MarkerData>) => {
			update(state => {
				// Auto-attach components that have matching markers
				const attachedComponents: AttachedComponent[] = [];

				for (const asset of availableAssets) {
					if (asset.markerName && markers.has(asset.markerName)) {
						attachedComponents.push({
							assetId: asset.id,
							markerName: asset.markerName,
							visible: false, // Components hidden by default
						});
					}
				}

				return {
					...state,
					markers,
					attachedComponents,
					markersReady: true,
				};
			});
		},

		// Toggle visibility of a component
		toggleComponent: (assetId: string) => {
			update(state => ({
				...state,
				attachedComponents: state.attachedComponents.map(comp =>
					comp.assetId === assetId
						? { ...comp, visible: !comp.visible }
						: comp
				),
			}));
		},

		// Set visibility of a specific component
		setComponentVisibility: (assetId: string, visible: boolean) => {
			update(state => ({
				...state,
				attachedComponents: state.attachedComponents.map(comp =>
					comp.assetId === assetId
						? { ...comp, visible }
						: comp
				),
			}));
		},

		// Show all components
		showAll: () => {
			update(state => ({
				...state,
				attachedComponents: state.attachedComponents.map(comp => ({
					...comp,
					visible: true,
				})),
			}));
		},

		// Hide all components
		hideAll: () => {
			update(state => ({
				...state,
				attachedComponents: state.attachedComponents.map(comp => ({
					...comp,
					visible: false,
				})),
			}));
		},

		// Get marker data by name
		getMarker: (name: string): MarkerData | undefined => {
			let result: MarkerData | undefined;
			subscribe(state => {
				result = state.markers.get(name);
			})();
			return result;
		},

		// Reset all markers
		reset: () => {
			set({
				markers: new Map(),
				attachedComponents: [],
				markersReady: false,
			});
		},
	};
}

export const markerStore = createMarkerStore();

// Derived stores for convenience
export const markers = derived(markerStore, $state => $state.markers);
export const attachedComponents = derived(markerStore, $state => $state.attachedComponents);
export const markersReady = derived(markerStore, $state => $state.markersReady);

// Get visible attached components with their marker data
export const visibleComponents = derived(markerStore, $state => {
	return $state.attachedComponents
		.filter(comp => comp.visible)
		.map(comp => {
			const marker = $state.markers.get(comp.markerName);
			const asset = availableAssets.find(a => a.id === comp.assetId);
			return {
				...comp,
				marker,
				asset,
			};
		})
		.filter(comp => comp.marker && comp.asset);
});
