<script lang="ts">
  import { carColor } from '$lib/stores';
  import { markerStore } from '$lib/markerStore';
  import type { MarkerData } from '$lib/types';
  import { T } from '@threlte/core';
  import { interactivity, useGltf } from '@threlte/extras';
  import * as THREE from 'three';

  interactivity();

  // List of marker names to look for in the model
  const MARKER_NAMES = [
    'Light_Pod',
    'Cristal_ORB',
    'Neon_Ring',
    'Pyramid',
    'Roof_Box',
    'Star_Badge',
  ];

  let {
    onSurfaceHit,
    onPointerLeave,
    onPointerEnter,
  }: {
    onSurfaceHit?: (
      point: THREE.Vector3,
      localNormal: THREE.Vector3,
      worldNormal: THREE.Vector3
    ) => void;
    onPointerLeave?: () => void;
    onPointerEnter?: () => void;
  } = $props();

  let carGroup = $state<THREE.Group | undefined>(undefined);

  // Get car color from store (used for fallback primitive car)
  let color = $derived($carColor);

  // Try to load GLTF model from /static/car.glb
  const gltf = useGltf('/concept_car_02.glb');

  // Check if model is loaded successfully
  let modelLoaded = $derived($gltf && !('error' in $gltf) && $gltf.scene);

  // Dynamic car bounding box center (in carGroup local space)
  // This is exported so Scene.svelte can use it for outward direction checks
  let carBoundsCenter = $state<THREE.Vector3>(new THREE.Vector3(0, 0.6, 0));
  let carScale = $state(1);

  function handlePointerMove(event: {
    point: THREE.Vector3;
    face?: { normal: THREE.Vector3 };
    object?: THREE.Object3D;
  }) {
    if (event.face && onSurfaceHit && event.object) {
      const localNormal = event.face.normal.clone();

      // Transform normal from object space to world space
      const worldNormal = localNormal.clone();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(
        event.object.matrixWorld
      );
      worldNormal.applyMatrix3(normalMatrix).normalize();

      onSurfaceHit(event.point.clone(), localNormal, worldNormal);
    }
  }

  function handlePointerLeave() {
    onPointerLeave?.();
  }

  function handlePointerEnter() {
    onPointerEnter?.();
  }

  // Setup loaded GLTF model - enable shadows, compute bounds, auto-scale, find markers
  $effect(() => {
    if (modelLoaded && $gltf?.scene) {
      const scene = $gltf.scene;

      // Enable shadows
      scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Compute bounding box to auto-scale and auto-center
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Auto-scale: normalize so the car is ~4 units long (reasonable scene size)
      const maxDim = Math.max(size.x, size.y, size.z);
      carScale = maxDim > 0 ? 4 / maxDim : 1;

      // Compute the center in the scaled/positioned local space
      // After centering: model bottom at y=0, top at size.y * carScale
      // So the volumetric center is at halfHeight * carScale
      const halfHeight = center.y - box.min.y; // = size.y / 2
      carBoundsCenter = new THREE.Vector3(0, halfHeight * carScale, 0);

      // Find marker empties in the model and store their transforms
      const discoveredMarkers = new Map<string, MarkerData>();

      for (const markerName of MARKER_NAMES) {
        const markerObj = scene.getObjectByName(markerName);
        if (markerObj) {
          // Get the marker's local position relative to the scene
          // We need to account for the centering offset we apply
          const localPos = markerObj.position.clone();

          // Apply the same centering offset we use for the model
          // (subtract center.x and center.z, subtract box.min.y for ground)
          const adjustedPos = new THREE.Vector3(
            (localPos.x - center.x) * carScale,
            (localPos.y - box.min.y) * carScale,
            (localPos.z - center.z) * carScale
          );

          // Get rotation as Euler angles
          const euler = new THREE.Euler().setFromQuaternion(markerObj.quaternion);

          discoveredMarkers.set(markerName, {
            name: markerName,
            position: { x: adjustedPos.x, y: adjustedPos.y, z: adjustedPos.z },
            rotation: { x: euler.x, y: euler.y, z: euler.z },
            scale: {
              x: markerObj.scale.x * carScale,
              y: markerObj.scale.y * carScale,
              z: markerObj.scale.z * carScale
            },
          });

          console.log(`Found marker: ${markerName}`, {
            position: adjustedPos,
            rotation: { x: euler.x, y: euler.y, z: euler.z },
          });
        }
      }

      if (discoveredMarkers.size > 0) {
        console.log(`Discovered ${discoveredMarkers.size} markers in car model`);
        markerStore.setMarkers(discoveredMarkers);
      } else {
        console.log('No markers found in car model. Make sure empties are named correctly.');
      }
    }
  });

  // Export for Scene.svelte
  export function getCarMesh(): THREE.Group | undefined {
    return carGroup;
  }

  export function getCarCenter(): THREE.Vector3 {
    return carBoundsCenter;
  }
</script>

{#if modelLoaded && $gltf?.scene}
  <!-- ============================================ -->
  <!-- GLTF/GLB MODEL LOADED                       -->
  <!-- Auto-scaled and centered, no hardcoded rot.  -->
  <!-- ============================================ -->
  {@const scene = $gltf.scene}
  {@const box = new THREE.Box3().setFromObject(scene)}
  {@const center = box.getCenter(new THREE.Vector3())}
  <T.Group
    bind:ref={carGroup}
    onpointerleave={handlePointerLeave}
    onpointerenter={handlePointerEnter}
    onpointermove={handlePointerMove}
    scale={carScale}
  >
    <!-- Offset to center the model at origin, sitting on ground plane (y=0) -->
    <T.Group
      position.x={-center.x}
      position.y={-box.min.y}
      position.z={-center.z}
    >
      <T is={scene} />
    </T.Group>
  </T.Group>
{:else}
  <!-- ============================================ -->
  <!-- FALLBACK: Primitive-based car               -->
  <!-- Add car.glb to /static folder to replace    -->
  <!-- ============================================ -->
  <T.Group
    bind:ref={carGroup}
    onpointerleave={handlePointerLeave}
    onpointerenter={handlePointerEnter}
  >
    <!-- Main car body - lower section -->
    <T.Mesh
      position.y={0.4}
      onpointermove={handlePointerMove}
      castShadow
      receiveShadow
    >
      <T.BoxGeometry args={[3.5, 0.6, 1.6]} />
      <T.MeshStandardMaterial {color} metalness={0.8} roughness={0.2} />
    </T.Mesh>

    <!-- Car body - upper cabin -->
    <T.Mesh
      position={[0.1, 0.9, 0]}
      onpointermove={handlePointerMove}
      castShadow
      receiveShadow
    >
      <T.BoxGeometry args={[2, 0.6, 1.4]} />
      <T.MeshStandardMaterial {color} metalness={0.8} roughness={0.2} />
    </T.Mesh>

    <!-- Front hood slope -->
    <T.Mesh
      position={[-1.1, 0.7, 0]}
      rotation.z={-0.3}
      onpointermove={handlePointerMove}
      castShadow
    >
      <T.BoxGeometry args={[0.8, 0.3, 1.4]} />
      <T.MeshStandardMaterial {color} metalness={0.8} roughness={0.2} />
    </T.Mesh>

    <!-- Rear trunk slope -->
    <T.Mesh
      position={[1.2, 0.7, 0]}
      rotation.z={0.3}
      onpointermove={handlePointerMove}
      castShadow
    >
      <T.BoxGeometry args={[0.7, 0.3, 1.4]} />
      <T.MeshStandardMaterial {color} metalness={0.8} roughness={0.2} />
    </T.Mesh>

    <!-- Windshield -->
    <T.Mesh
      position={[-0.65, 0.95, 0]}
      rotation.z={-0.5}
      onpointermove={handlePointerMove}
    >
      <T.BoxGeometry args={[0.6, 0.05, 1.2]} />
      <T.MeshStandardMaterial
        color="#1a1a2e"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.7}
      />
    </T.Mesh>

    <!-- Rear windshield -->
    <T.Mesh
      position={[0.85, 0.95, 0]}
      rotation.z={0.5}
      onpointermove={handlePointerMove}
    >
      <T.BoxGeometry args={[0.5, 0.05, 1.2]} />
      <T.MeshStandardMaterial
        color="#1a1a2e"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.7}
      />
    </T.Mesh>

    <!-- Side windows - left -->
    <T.Mesh position={[0.1, 0.95, 0.72]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[1.4, 0.4, 0.05]} />
      <T.MeshStandardMaterial
        color="#1a1a2e"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.6}
      />
    </T.Mesh>

    <!-- Side windows - right -->
    <T.Mesh position={[0.1, 0.95, -0.72]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[1.4, 0.4, 0.05]} />
      <T.MeshStandardMaterial
        color="#1a1a2e"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.6}
      />
    </T.Mesh>

    <!-- Front bumper -->
    <T.Mesh position={[-1.8, 0.25, 0]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[0.2, 0.35, 1.5]} />
      <T.MeshStandardMaterial color="#0f0f1a" metalness={0.6} roughness={0.4} />
    </T.Mesh>

    <!-- Rear bumper -->
    <T.Mesh position={[1.8, 0.25, 0]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[0.2, 0.35, 1.5]} />
      <T.MeshStandardMaterial color="#0f0f1a" metalness={0.6} roughness={0.4} />
    </T.Mesh>

    <!-- Roof - for placing items on top -->
    <T.Mesh position={[0.1, 1.22, 0]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[1.8, 0.04, 1.3]} />
      <T.MeshStandardMaterial {color} metalness={0.8} roughness={0.2} />
    </T.Mesh>

    <!-- Headlights -->
    <T.Mesh position={[-1.78, 0.45, 0.5]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[0.08, 0.15, 0.3]} />
      <T.MeshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.5}
      />
    </T.Mesh>
    <T.Mesh position={[-1.78, 0.45, -0.5]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[0.08, 0.15, 0.3]} />
      <T.MeshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.5}
      />
    </T.Mesh>

    <!-- Tail lights -->
    <T.Mesh position={[1.78, 0.45, 0.55]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[0.08, 0.12, 0.25]} />
      <T.MeshStandardMaterial
        color="#ff0033"
        emissive="#ff0033"
        emissiveIntensity={0.8}
      />
    </T.Mesh>
    <T.Mesh position={[1.78, 0.45, -0.55]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[0.08, 0.12, 0.25]} />
      <T.MeshStandardMaterial
        color="#ff0033"
        emissive="#ff0033"
        emissiveIntensity={0.8}
      />
    </T.Mesh>

    <!-- Wheels -->
    <!-- Front left wheel -->
    <T.Group position={[-1.1, 0.2, 0.9]}>
      <T.Mesh rotation.x={Math.PI / 2}>
        <T.CylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <T.MeshStandardMaterial
          color="#111111"
          metalness={0.3}
          roughness={0.8}
        />
      </T.Mesh>
      <T.Mesh rotation.x={Math.PI / 2} position.y={0.05}>
        <T.CylinderGeometry args={[0.18, 0.18, 0.22, 6]} />
        <T.MeshStandardMaterial
          color="#888888"
          metalness={0.9}
          roughness={0.2}
        />
      </T.Mesh>
    </T.Group>

    <!-- Front right wheel -->
    <T.Group position={[-1.1, 0.2, -0.9]}>
      <T.Mesh rotation.x={Math.PI / 2}>
        <T.CylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <T.MeshStandardMaterial
          color="#111111"
          metalness={0.3}
          roughness={0.8}
        />
      </T.Mesh>
      <T.Mesh rotation.x={Math.PI / 2} position.y={-0.05}>
        <T.CylinderGeometry args={[0.18, 0.18, 0.22, 6]} />
        <T.MeshStandardMaterial
          color="#888888"
          metalness={0.9}
          roughness={0.2}
        />
      </T.Mesh>
    </T.Group>

    <!-- Rear left wheel -->
    <T.Group position={[1.1, 0.2, 0.9]}>
      <T.Mesh rotation.x={Math.PI / 2}>
        <T.CylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <T.MeshStandardMaterial
          color="#111111"
          metalness={0.3}
          roughness={0.8}
        />
      </T.Mesh>
      <T.Mesh rotation.x={Math.PI / 2} position.y={0.05}>
        <T.CylinderGeometry args={[0.18, 0.18, 0.22, 6]} />
        <T.MeshStandardMaterial
          color="#888888"
          metalness={0.9}
          roughness={0.2}
        />
      </T.Mesh>
    </T.Group>

    <!-- Rear right wheel -->
    <T.Group position={[1.1, 0.2, -0.9]}>
      <T.Mesh rotation.x={Math.PI / 2}>
        <T.CylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <T.MeshStandardMaterial
          color="#111111"
          metalness={0.3}
          roughness={0.8}
        />
      </T.Mesh>
      <T.Mesh rotation.x={Math.PI / 2} position.y={-0.05}>
        <T.CylinderGeometry args={[0.18, 0.18, 0.22, 6]} />
        <T.MeshStandardMaterial
          color="#888888"
          metalness={0.9}
          roughness={0.2}
        />
      </T.Mesh>
    </T.Group>

    <!-- Grille -->
    <T.Mesh position={[-1.76, 0.35, 0]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[0.05, 0.2, 0.8]} />
      <T.MeshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
    </T.Mesh>

    <!-- Side skirts -->
    <T.Mesh position={[0, 0.15, 0.82]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[3.2, 0.1, 0.08]} />
      <T.MeshStandardMaterial color="#0a0a12" metalness={0.5} roughness={0.5} />
    </T.Mesh>
    <T.Mesh position={[0, 0.15, -0.82]} onpointermove={handlePointerMove}>
      <T.BoxGeometry args={[3.2, 0.1, 0.08]} />
      <T.MeshStandardMaterial color="#0a0a12" metalness={0.5} roughness={0.5} />
    </T.Mesh>
  </T.Group>
{/if}
