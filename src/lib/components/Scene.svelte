<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls, Grid } from '@threlte/extras';
	import { interactivity } from '@threlte/extras';
	import * as THREE from 'three';
	import Car from './Car.svelte';
	import PlacedAsset from './PlacedAsset.svelte';
	import MarkerComponent from './MarkerComponent.svelte';
	import DragPreview from './DragPreview.svelte';
	import ZoneHighlight from './ZoneHighlight.svelte';
	import ZoneEmitters from './ZoneEmitters.svelte';
	import { appStore, placedAssets, isDragging, currentDragAsset } from '$lib/stores';
	import { visibleComponents } from '$lib/markerStore';
	import type { Asset3D, ZoneValidationResult, PlacementZone } from '$lib/types';
	import { get } from 'svelte/store';
	import { PlacementValidator } from '$lib/utils/placementValidator';
	import { getAllZones, getZonesForAsset } from '$lib/placementZones';

	interactivity();

	const { camera, renderer, scene } = useThrelte();

	// Enable tone mapping and generate environment map for glass materials
	$effect(() => {
		if (renderer && scene) {
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 1.2;

			// Generate a simple environment map for glass refraction/reflection.
			// Without this, transmission materials appear completely black.
			const pmremGenerator = new THREE.PMREMGenerator(renderer);
			pmremGenerator.compileEquirectangularShader();

			// Create a simple gradient environment scene
			const envScene = new THREE.Scene();
			// Upper hemisphere - cool blue
			const hemiLight = new THREE.HemisphereLight(0x4080c0, 0x101830, 1.0);
			envScene.add(hemiLight);
			// Add some fill
			const dirLight = new THREE.DirectionalLight(0xc0d8ff, 0.5);
			dirLight.position.set(1, 1, 1);
			envScene.add(dirLight);

			const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
			scene.environment = envMap;
			pmremGenerator.dispose();
			envScene.clear();
		}
	});

	// Car group reference for coordinate transformation and raycasting
	let carGroupRef: THREE.Group | undefined = $state(undefined);

	// Track state - in LOCAL car coordinates
	let carRotation = $state(0);
	let dragLocalPos = $state<{ x: number; y: number; z: number } | null>(null);
	let surfaceNormal = $state<{ x: number; y: number; z: number } | null>(null);
	
	// Surface snapping state
	let isSnappedToCar = $state(false);
	let lastSnappedPos = $state<{ x: number; y: number; z: number } | null>(null);
	let lastSnappedNormal = $state<{ x: number; y: number; z: number } | null>(null);

	// Raycaster for continuous surface detection
	const raycaster = new THREE.Raycaster();
	const mouseNDC = new THREE.Vector2();

	// Placement validation
	const validator = new PlacementValidator(getAllZones());
	let validationResult = $state<ZoneValidationResult | null>(null);
	let displayZones = $state<PlacementZone[]>([]);

	// Auto rotation
	let autoRotate = $derived($appStore.autoRotate);
	let showGrid = $derived($appStore.showGrid);
	let selectedAssetId = $derived($appStore.selectedAssetId);
	let dragging = $derived($isDragging);
	let dragAsset = $derived($currentDragAsset);
	let placed = $derived($placedAssets);
	let markerComponents = $derived($visibleComponents);

	// Car center - dynamically computed from loaded model's bounding box
	// Updated when Car component loads a new model
	let carCenter = $state(new THREE.Vector3(0, 0.6, 0));
	let carComponentRef: { getCarCenter: () => THREE.Vector3 } | undefined = $state(undefined);

	useTask((delta) => {
		if (autoRotate && !dragging) {
			carRotation += delta * 0.2;
		}

		// Update car center from the loaded model
		if (carComponentRef) {
			carCenter = carComponentRef.getCarCenter();
		}

		// Update zone display when dragging
		if (dragging && dragAsset) {
			displayZones = getZonesForAsset(dragAsset);
			updateSurfacePosition();
		} else {
			displayZones = [];
		}
	});

	// Get the EXACT offset needed to place asset on surface
	// For GLB models: GlbModel normalizes to a 1x1x1 box then applies scale, so half-extent = scale * 0.5
	// For primitives: these values match the actual geometry sizes precisely
	function getAssetRadius(asset: Asset3D | null): number {
		if (!asset) return 0.3;
		
		const scale = asset.scale;
		const tiny = 0.02; // Minimal gap to prevent z-fighting
		
		// GLB models are normalized to fit in a 1x1x1 box
		if (asset.modelPath) {
			return scale * 0.5 + tiny;
		}
		
		// Each geometry has specific dimensions - calculate exact offset
		switch (asset.geometry) {
			case 'box':
				// Box is 1x1x1, half-extent is 0.5
				return scale * 0.5 + tiny;
			case 'sphere':
				// Sphere radius is 0.5
				return scale * 0.5 + tiny;
			case 'cone':
				// Cone: radius 0.5, height 1 - use radius for side placement
				return scale * 0.5 + tiny;
			case 'cylinder':
				// Cylinder: radius 0.3, height 1
				return scale * 0.3 + tiny;
			case 'torus':
				// Torus: main radius 0.4, tube radius 0.15
				// Total extent is 0.4 + 0.15 = 0.55
				return scale * 0.55 + tiny;
			case 'dodecahedron':
				// Dodecahedron radius 0.5
				return scale * 0.5 + tiny;
			case 'octahedron':
				// Octahedron radius 0.5
				return scale * 0.5 + tiny;
			case 'tetrahedron':
				// Tetrahedron radius 0.5
				return scale * 0.5 + tiny;
			default:
				return scale * 0.5 + tiny;
		}
	}

	// Convert world position to car's local coordinates
	function worldToLocal(worldPos: THREE.Vector3): THREE.Vector3 {
		if (!carGroupRef) {
			return worldPos.clone();
		}
		carGroupRef.updateMatrixWorld(true);
		return carGroupRef.worldToLocal(worldPos.clone());
	}

	// Calculate outward direction from car center
	function getOutwardDirection(localPoint: THREE.Vector3): THREE.Vector3 {
		const outward = localPoint.clone().sub(carCenter);
		if (outward.length() < 0.1) {
			return new THREE.Vector3(0, 1, 0);
		}
		return outward.normalize();
	}

	// Get ONLY car body meshes for raycasting (exclude preview, placed assets, and transparent meshes)
	function getCarMeshes(): THREE.Mesh[] {
		const meshes: THREE.Mesh[] = [];
		if (carGroupRef) {
			carGroupRef.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					// Check parent hierarchy for preview/placed asset markers
					let isExcluded = false;
					let parent: THREE.Object3D | null = child;
					while (parent) {
						if (parent.userData?.isPreview || parent.userData?.isPlacedAsset) {
							isExcluded = true;
							break;
						}
						parent = parent.parent;
					}
					
					// Also exclude transparent meshes (windows, etc.)
					const material = child.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
					const isTransparent = material && material.transparent && material.opacity < 0.9;
					
					if (!isExcluded && !isTransparent) {
						meshes.push(child);
					}
				}
			});
		}
		return meshes;
	}

	// Calculate rotation to align asset's base (bottom) with the surface
	// Uses a lookAt-style construction for STABLE orientation:
	//   - +Y aligns with surface normal (asset sits on surface)
	//   - Forward direction stays as close to car-forward (Z) as possible
	// This prevents random yaw changes when switching car models
	function calculateSurfaceRotation(surfaceNormal: THREE.Vector3): { x: number; y: number; z: number } {
		const normal = surfaceNormal.clone().normalize();
		
		// Pick a reference "forward" direction
		// Prefer world Z (car forward); if normal is nearly parallel to Z, use X instead
		let forward = new THREE.Vector3(0, 0, 1);
		if (Math.abs(normal.dot(forward)) > 0.95) {
			forward = new THREE.Vector3(1, 0, 0);
		}
		
		// Build orthonormal basis: right = forward × normal, then recompute forward
		const right = new THREE.Vector3().crossVectors(forward, normal).normalize();
		forward = new THREE.Vector3().crossVectors(normal, right).normalize();
		
		// Build rotation matrix with columns: right (X), normal (Y), forward (Z)
		const mat = new THREE.Matrix4();
		mat.makeBasis(right, normal, forward);
		
		const quaternion = new THREE.Quaternion();
		quaternion.setFromRotationMatrix(mat);
		
		const euler = new THREE.Euler();
		euler.setFromQuaternion(quaternion, 'XYZ');
		
		return { x: euler.x, y: euler.y, z: euler.z };
	}

	// Store the current rotation for the dragged asset
	let dragRotation = $state<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

	// Update surface position based on current mouse position
	function updateSurfacePosition() {
		if (!carGroupRef || !camera.current || !renderer) return;
		
		const appState = get(appStore);
		const mousePos = appState.drag.mousePosition;
		
		// Convert mouse position to normalized device coordinates (-1 to +1)
		const canvas = renderer.domElement;
		const rect = canvas.getBoundingClientRect();
		mouseNDC.x = ((mousePos.x - rect.left) / rect.width) * 2 - 1;
		mouseNDC.y = -((mousePos.y - rect.top) / rect.height) * 2 + 1;
		
		// Update raycaster with actual camera
		raycaster.setFromCamera(mouseNDC, camera.current);
		
		// Get ONLY car body meshes and raycast against them
		const carMeshes = getCarMeshes();
		const intersects = raycaster.intersectObjects(carMeshes, false);
		
		if (intersects.length > 0) {
			// Found intersection - snap to surface!
			const hit = intersects[0];
			const worldHitPoint = hit.point.clone();
			
			// Convert to local coordinates
			const localHitPoint = worldToLocal(worldHitPoint);
			
			// Get the surface normal - use face normal for precision
			let normalDir: THREE.Vector3;
			
			if (hit.face && hit.face.normal) {
				// Transform face normal from object space to world space, then to local car space
				const worldNormal = hit.face.normal.clone();
				
				// Apply object's rotation to the normal
				const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
				worldNormal.applyMatrix3(normalMatrix).normalize();
				
				// Convert world normal to carGroupRef's LOCAL space
				// Use the full inverse of carGroupRef's world matrix (not just quaternion)
				// This correctly handles any nested rotations inside the car model
				const inverseMatrix = new THREE.Matrix4().copy(carGroupRef.matrixWorld).invert();
				const localNormalMatrix = new THREE.Matrix3().getNormalMatrix(inverseMatrix);
				normalDir = worldNormal.applyMatrix3(localNormalMatrix).normalize();
				
				// Ensure normal points outward (away from car center)
				const toPoint = localHitPoint.clone().sub(carCenter);
				if (normalDir.dot(toPoint) < 0) {
					normalDir.negate();
				}
			} else {
				// Fallback to outward direction from center
				normalDir = getOutwardDirection(localHitPoint);
			}
			
			// Calculate exact offset for this asset
			const totalOffset = getAssetRadius(dragAsset);
			
			// Position asset exactly on surface: hit point + (normal * offset)
			const finalLocalPos = localHitPoint.clone().add(
				normalDir.clone().multiplyScalar(totalOffset)
			);
			
			// Calculate rotation to align base with surface
			dragRotation = calculateSurfaceRotation(normalDir);

			// Update state
			dragLocalPos = { x: finalLocalPos.x, y: finalLocalPos.y, z: finalLocalPos.z };
			surfaceNormal = { x: normalDir.x, y: normalDir.y, z: normalDir.z };
			isSnappedToCar = true;
			lastSnappedPos = { ...dragLocalPos };
			lastSnappedNormal = { ...surfaceNormal };

			// Validate placement at the SURFACE hit point, not at the offset position
			// This allows zones to work correctly without needing to account for asset thickness
			if (dragAsset) {
				const localHitCoords = { x: localHitPoint.x, y: localHitPoint.y, z: localHitPoint.z };
				validationResult = validator.validatePlacement(dragAsset, localHitCoords, surfaceNormal);
			}
			
		} else if (lastSnappedPos) {
			// No intersection but we were snapped before - keep last position
			// but mark as not currently over car
			isSnappedToCar = false;
			dragLocalPos = lastSnappedPos;
		}
	}

	// Handle surface hit from Threlte interactivity (backup)
	function handleSurfaceHit(point: THREE.Vector3, localNormal: THREE.Vector3, worldNormal: THREE.Vector3) {
		// The continuous raycasting in useTask handles most of this now
		// This serves as a backup / initial hit detection
		if (dragging && dragAsset && !isSnappedToCar) {
			const localHitPoint = worldToLocal(point);
			
			// Use the world normal, transformed to local car space
			let normalDir: THREE.Vector3;
			if (carGroupRef) {
				const inverseMatrix = new THREE.Matrix4().copy(carGroupRef.matrixWorld).invert();
				const localNormalMatrix = new THREE.Matrix3().getNormalMatrix(inverseMatrix);
				normalDir = worldNormal.clone().applyMatrix3(localNormalMatrix).normalize();
				
				// Ensure normal points outward
				const toPoint = localHitPoint.clone().sub(carCenter);
				if (normalDir.dot(toPoint) < 0) {
					normalDir.negate();
				}
			} else {
				normalDir = getOutwardDirection(localHitPoint);
			}
			
			const totalOffset = getAssetRadius(dragAsset);
			
			const finalLocalPos = localHitPoint.clone().add(
				normalDir.clone().multiplyScalar(totalOffset)
			);
			
			// Calculate rotation to align base with surface
			dragRotation = calculateSurfaceRotation(normalDir);
			
			dragLocalPos = { x: finalLocalPos.x, y: finalLocalPos.y, z: finalLocalPos.z };
			surfaceNormal = { x: normalDir.x, y: normalDir.y, z: normalDir.z };
			isSnappedToCar = true;
			lastSnappedPos = { ...dragLocalPos };
			lastSnappedNormal = { ...surfaceNormal };
		}
	}

	function handleCarPointerLeave() {
		// Keep tracking via raycaster even when pointer "leaves" individual meshes
	}

	// Snap position to nearest valid zone center if close enough
	function getSnappedPosition(asset: Asset3D, position: { x: number; y: number; z: number }) {
		if (!asset.validZones || asset.validZones.length === 0) {
			return position;
		}

		// Get all valid zones for this asset
		const validZones: PlacementZone[] = [];
		for (const zoneId of asset.validZones) {
			const zone = getAllZones().find(z => z.id === zoneId);
			if (zone) {
				validZones.push(zone);
			}
		}

		if (validZones.length === 0) {
			return position;
		}

		// Find the closest valid zone center
		let closestZone: PlacementZone | null = null;
		let closestDistance = Infinity;

		for (const zone of validZones) {
			const dx = position.x - zone.center.x;
			const dy = position.y - zone.center.y;
			const dz = position.z - zone.center.z;
			const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestZone = zone;
			}
		}

		// Snap to closest zone if within snap distance (3.0 units)
		const snapDistance = 3.0;
		if (closestZone && closestDistance < snapDistance) {
			return closestZone.center;
		}

		// Otherwise return original position
		return position;
	}

	function handleSceneClick(event: MouseEvent) {
		if (dragging && dragLocalPos && dragAsset && isSnappedToCar) {
			// Snap to zone center if in a valid zone
			const snappedPos = getSnappedPosition(dragAsset, dragLocalPos);
			appStore.placeAsset(dragAsset, snappedPos, dragRotation);
			resetDragState();
		} else if (dragging && lastSnappedPos && dragAsset) {
			// Also snap to zone when using last snapped position
			const snappedPos = getSnappedPosition(dragAsset, lastSnappedPos);
			appStore.placeAsset(dragAsset, snappedPos, dragRotation);
			resetDragState();
		} else if (dragging) {
			appStore.endDrag();
			resetDragState();
		} else if (!dragging) {
			appStore.selectAsset(null);
		}
	}

	function resetDragState() {
		dragLocalPos = null;
		surfaceNormal = null;
		dragRotation = { x: 0, y: 0, z: 0 };
		isSnappedToCar = false;
		lastSnappedPos = null;
		lastSnappedNormal = null;
		validationResult = null;
		displayZones = [];
	}

	function handlePointerMissed() {
		if (!dragging) {
			appStore.selectAsset(null);
		}
	}

	function handleGroundPointerMove(e: { point?: THREE.Vector3 }) {
		// Let the continuous raycaster handle surface tracking
		// This just catches when completely off the car
		if (dragging && e.point && !isSnappedToCar && !lastSnappedPos) {
			const localPos = worldToLocal(e.point);
			dragLocalPos = { x: localPos.x, y: 0.8, z: localPos.z };
		}
	}

	function handleCarPointerEnter() {
		if (dragging) {
			isSnappedToCar = true;
		}
	}

	// Exported function to place the current dragged asset
	export function placeCurrentAsset(): boolean {
		if (dragging && dragAsset) {
			if (dragLocalPos && isSnappedToCar) {
				appStore.placeAsset(dragAsset, dragLocalPos, dragRotation);
				resetDragState();
				appStore.endDrag();
				return true;
			} else if (lastSnappedPos) {
				appStore.placeAsset(dragAsset, lastSnappedPos, dragRotation);
				resetDragState();
				appStore.endDrag();
				return true;
			}
		}
		resetDragState();
		return false;
	}
</script>

<!-- Environment map for glass/transmission materials -->
<!-- Generated programmatically in the script via PMREMGenerator -->

<!-- Camera -->
<T.PerspectiveCamera makeDefault position={[6, 3.5, 6]} fov={50}>
	<OrbitControls
		enableDamping
		dampingFactor={0.05}
		minDistance={4}
		maxDistance={15}
		maxPolarAngle={Math.PI / 2.1}
		enablePan={false}
		enabled={!dragging}
	/>
</T.PerspectiveCamera>

<!-- Lighting - bright showroom with cool tint -->
<T.AmbientLight intensity={0.6} color="#b0c8ff" />
<T.DirectionalLight
	position={[8, 12, 8]}
	intensity={2.5}
	castShadow
	color="#e0eaff"
	shadow.mapSize.width={2048}
	shadow.mapSize.height={2048}
	shadow.camera.near={0.5}
	shadow.camera.far={50}
	shadow.camera.left={-10}
	shadow.camera.right={10}
	shadow.camera.top={10}
	shadow.camera.bottom={-10}
/>
<!-- Fill from opposite side -->
<T.DirectionalLight position={[-6, 10, -4]} intensity={1.2} color="#80a0e0" />
<!-- Front fill -->
<T.DirectionalLight position={[0, 6, 10]} intensity={0.8} color="#c0d4ff" />

<!-- Point lights surrounding the car for even illumination -->
<T.PointLight position={[0, 5, 0]} intensity={1.0} color="#ffffff" distance={15} />
<T.PointLight position={[4, 2, 4]} intensity={0.6} color="#80c0ff" distance={12} />
<T.PointLight position={[-4, 2, -4]} intensity={0.6} color="#80c0ff" distance={12} />
<T.PointLight position={[4, 2, -4]} intensity={0.4} color="#a0b0ff" distance={12} />
<T.PointLight position={[-4, 2, 4]} intensity={0.4} color="#a0b0ff" distance={12} />
<!-- Accent lights for holographic feel -->
<T.PointLight position={[0, 0.5, 3]} intensity={0.3} color="#00dcff" distance={8} />
<T.PointLight position={[0, 0.5, -3]} intensity={0.3} color="#6440dc" distance={8} />

<!-- Hemisphere light for soft ambient fill -->
<T.HemisphereLight intensity={0.5} color="#c0d8ff" groundColor="#1a2040" />

<!-- Ground plane - dark reflective floor -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={-0.01} receiveShadow>
	<T.PlaneGeometry args={[50, 50]} />
	<T.MeshStandardMaterial color="#060a14" metalness={0.95} roughness={0.3} />
</T.Mesh>

<!-- ======== HOLOGRAPHIC PLATFORM RINGS ======== -->
<!-- Outer ring glow -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={0.005}>
	<T.RingGeometry args={[3.8, 4.2, 64]} />
	<T.MeshBasicMaterial color="#1482ff" transparent opacity={0.08} side={2} />
</T.Mesh>
<!-- Main ring -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={0.01}>
	<T.RingGeometry args={[3.5, 3.55, 64]} />
	<T.MeshBasicMaterial color="#00dcff" transparent opacity={0.25} side={2} />
</T.Mesh>
<!-- Inner ring -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={0.01}>
	<T.RingGeometry args={[2.8, 2.83, 64]} />
	<T.MeshBasicMaterial color="#1482ff" transparent opacity={0.15} side={2} />
</T.Mesh>
<!-- Inner subtle disc -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={0.003}>
	<T.CircleGeometry args={[3.5, 64]} />
	<T.MeshBasicMaterial color="#1040a0" transparent opacity={0.03} side={2} />
</T.Mesh>
<!-- Decorative middle ring -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={0.008}>
	<T.RingGeometry args={[2.0, 2.02, 64]} />
	<T.MeshBasicMaterial color="#6440dc" transparent opacity={0.12} side={2} />
</T.Mesh>

<!-- Grid -->
{#if showGrid}
	<Grid
		position.y={0.02}
		cellColor="#1a3060"
		sectionColor="#1e4080"
		cellSize={1}
		sectionSize={5}
		fadeDistance={20}
		fadeStrength={1.5}
		infiniteGrid
	/>
{/if}

<!-- Car with rotation -->
<T.Group name="carGroup" rotation.y={carRotation} onpointermissed={handlePointerMissed} bind:ref={carGroupRef} onclick={handleSceneClick}>
	<Car
		bind:this={carComponentRef}
		onSurfaceHit={handleSurfaceHit}
		onPointerLeave={handleCarPointerLeave}
		onPointerEnter={handleCarPointerEnter}
	/>

	<!-- Zone highlights - DISABLED due to performance -->
	<ZoneHighlight
		zones={displayZones}
		visible={false}
		dragAsset={dragAsset}
	/>

	<!-- Emissive zone highlights - DISABLED (not aligned with Blender empties) -->
	<ZoneEmitters
		visible={false}
		{dragAsset}
		carCenter={{ x: carCenter.x, y: carCenter.y, z: carCenter.z }}
	/>

	<!-- Placed assets (in LOCAL car coordinates) -->
	{#each placed as asset (asset.id)}
		<PlacedAsset placedAsset={asset} isSelected={selectedAssetId === asset.id} />
	{/each}

	<!-- Marker-attached components (positioned at Blender empties) -->
	{#each markerComponents as comp (comp.assetId)}
		{#if comp.asset && comp.marker}
			<MarkerComponent
				asset={comp.asset}
				marker={comp.marker}
				visible={comp.visible}
			/>
		{/if}
	{/each}

	<!-- Drag preview (in LOCAL car coordinates) - snapped to surface -->
	{#if dragging && dragAsset && dragLocalPos}
		<DragPreview
			asset={dragAsset}
			position={dragLocalPos}
			rotation={dragRotation}
			visible={true}
			isSnapped={isSnappedToCar}
			hasSnappedBefore={lastSnappedPos !== null}
			validationResult={validationResult}
			surfaceNormal={surfaceNormal}
		/>
	{/if}
</T.Group>

<!-- Invisible interaction plane for drag detection when not over car -->
<T.Mesh
	rotation.x={-Math.PI / 2}
	position.y={0.5}
	visible={false}
	onpointermove={handleGroundPointerMove}
	onclick={handleSceneClick}
>
	<T.PlaneGeometry args={[20, 20]} />
	<T.MeshBasicMaterial transparent opacity={0} />
</T.Mesh>
