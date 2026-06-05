import { Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { GLTF, OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useBattleStore } from "../store/useBattleStore";
import type {
  CameraPreset,
  Landmark,
  ProjectedPoint,
  ProjectionState,
  TacticalArrow,
  TacticalEffect,
  TacticalRing,
  Vec3
} from "../store/types";

const MODEL_URL = "/models/sa-ban.glb";

type BattleGLTF = GLTF & {
  scene: THREE.Group;
};

interface ModelBounds {
  center: THREE.Vector3;
  size: THREE.Vector3;
  radius: number;
}

function asVec3(position: Vec3) {
  return new THREE.Vector3(position[0], position[1], position[2]);
}

function getPresetOffset(preset: CameraPreset, radius: number) {
  const distance = Math.max(radius, 60);
  if (preset === "TOP") {
    return new THREE.Vector3(0.01, distance * 1.65, 0.01);
  }
  if (preset === "CINE") {
    return new THREE.Vector3(distance * 1.18, distance * 0.38, distance * 0.55);
  }
  return new THREE.Vector3(distance * 1.08, distance * 0.72, distance * 0.95);
}

function findFocusTarget(bounds: ModelBounds, landmarks: Landmark[]) {
  const state = useBattleStore.getState();
  const step = state.steps.find((item) => item.id === state.activeStepId);
  const focusIds = step?.focus ?? [];
  const points = focusIds
    .map((id) => landmarks.find((landmark) => landmark.id === id))
    .filter(Boolean)
    .map((landmark) => asVec3(landmark!.position));

  if (!points.length) {
    return bounds.center.clone();
  }

  const target = points.reduce((sum, point) => sum.add(point), new THREE.Vector3());
  target.divideScalar(points.length);
  target.y = Math.max(bounds.center.y, target.y - 0.35);
  return target;
}

function applyMaterialDefaults(scene: THREE.Group) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) {
      return;
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;
    });
  });
}

function objectMatchesAny(name: string, tokens: string[]) {
  return tokens.some((token) => name.includes(token));
}

function applyLayerVisibility(scene: THREE.Group) {
  const { layers } = useBattleStore.getState();

  scene.traverse((object) => {
    const name = object.name.toLowerCase();
    const parentName = object.parent?.name.toLowerCase() ?? "";
    const isWater = objectMatchesAny(name, ["song", "nuoc", "cau"]);
    const isTerrain = objectMatchesAny(name, ["dat", "tree", "khung"]);
    const isEmbeddedText =
      parentName === "text" ||
      parentName === "group1" ||
      parentName === "group1.001" ||
      objectMatchesAny(name, ["pleime", "ducco", "chupong", "albany", "phumi", "play"]);

    if (isWater) {
      object.visible = layers.rivers;
    } else if (isTerrain) {
      object.visible = layers.terrain;
    } else if (isEmbeddedText) {
      object.visible = layers.landmarks;
    }
  });
}

function getModelBounds(scene: THREE.Group): ModelBounds {
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, size.z) * 0.72;
  return {
    center,
    size,
    radius: Math.max(radius, 40)
  };
}

function syncNamedLandmarks(scene: THREE.Group) {
  const state = useBattleStore.getState();
  const positions: Record<string, Vec3> = {};
  const tmp = new THREE.Vector3();

  scene.updateWorldMatrix(true, true);
  state.landmarks.forEach((landmark) => {
    if (!landmark.nodeName) {
      return;
    }
    const object = scene.getObjectByName(landmark.nodeName);
    if (!object) {
      return;
    }
    object.getWorldPosition(tmp);
    positions[landmark.id] = [tmp.x, tmp.y, tmp.z];
  });

  state.updateLandmarksFromModel(positions);
}

function projectPoint(id: string, position: Vec3, camera: THREE.Camera, size: { width: number; height: number }) {
  const vector = asVec3(position);
  vector.project(camera);
  return {
    id,
    x: (vector.x * 0.5 + 0.5) * size.width,
    y: (-vector.y * 0.5 + 0.5) * size.height,
    visible: vector.z >= -1 && vector.z <= 1,
    depth: vector.z
  } satisfies ProjectedPoint;
}

function projectOffsetPoint(
  id: string,
  base: Vec3,
  offset: THREE.Vector3,
  camera: THREE.Camera,
  size: { width: number; height: number }
) {
  const point = asVec3(base).add(offset);
  return projectPoint(id, [point.x, point.y, point.z], camera, size);
}

function buildProjection(camera: THREE.Camera, size: { width: number; height: number }): ProjectionState {
  const state = useBattleStore.getState();
  const activeStepId = state.activeStepId;
  const activeIndex = state.steps.findIndex((step) => step.id === activeStepId);
  const landmarkMap = new Map(state.landmarks.map((landmark) => [landmark.id, landmark]));
  const projectedPoints: Record<string, ProjectedPoint> = {};

  state.landmarks.forEach((landmark) => {
    projectedPoints[landmark.id] = projectPoint(landmark.id, landmark.position, camera, size);
  });

  const visibleStepIds = new Set(
    state.calibration.enabled && state.calibration.preview
      ? state.steps.map((step) => step.id)
      : state.steps
          .filter((_, index) => index === activeIndex)
          .map((step) => step.id)
  );

  const arrows = state.arrows
    .filter((arrow: TacticalArrow) => visibleStepIds.has(arrow.stepId))
    .map((arrow) => ({
      id: arrow.id,
      team: arrow.team,
      label: arrow.label,
      layer: arrow.layer,
      from: projectedPoints[arrow.from],
      to: projectedPoints[arrow.to],
      curve: arrow.curve
    }))
    .filter((arrow) => arrow.from && arrow.to);

  const rings = state.rings
    .filter((ring: TacticalRing) => visibleStepIds.has(ring.stepId))
    .map((ring) => {
      const landmark = landmarkMap.get(ring.center);
      const center = projectedPoints[ring.center];
      if (!landmark || !center) {
        return undefined;
      }
      const xEdge = projectOffsetPoint(`${ring.id}-x`, landmark.position, new THREE.Vector3(ring.radiusX, 0, 0), camera, size);
      const zEdge = projectOffsetPoint(`${ring.id}-z`, landmark.position, new THREE.Vector3(0, 0, ring.radiusZ), camera, size);
      return {
        id: ring.id,
        team: ring.team,
        center,
        rx: Math.max(16, Math.abs(xEdge.x - center.x)),
        ry: Math.max(12, Math.abs(zEdge.y - center.y)),
        label: ring.label
      };
    })
    .filter(Boolean) as ProjectionState["rings"];

  const effects = state.effects
    .filter((effect: TacticalEffect) => visibleStepIds.has(effect.stepId))
    .map((effect) => ({
      id: effect.id,
      team: effect.team,
      kind: effect.kind,
      point: projectedPoints[effect.at],
      label: effect.label
    }))
    .filter((effect) => effect.point);

  return {
    width: size.width,
    height: size.height,
    points: projectedPoints,
    arrows,
    rings,
    effects
  };
}

function TacticalProjector() {
  const { camera, size } = useThree();
  const setProjection = useBattleStore((state) => state.setProjection);
  const lastProjection = useRef("");

  useFrame(() => {
    const projection = buildProjection(camera, size);
    const compact = JSON.stringify(projection);
    if (compact !== lastProjection.current) {
      lastProjection.current = compact;
      setProjection(projection);
    }
  });

  return null;
}

function CalibrationHandles() {
  const calibration = useBattleStore((state) => state.calibration);
  const landmarks = useBattleStore((state) => state.landmarks);
  const setDraggingLandmark = useBattleStore((state) => state.setDraggingLandmark);

  if (!calibration.enabled) {
    return null;
  }

  return (
    <group name="calibration-handles">
      {landmarks.map((landmark) => (
        <mesh
          key={landmark.id}
          position={landmark.position}
          onPointerDown={(event) => {
            event.stopPropagation();
            setDraggingLandmark(landmark.id);
            const target = event.target as Element | null;
            target?.setPointerCapture?.(event.pointerId);
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
            setDraggingLandmark(undefined);
            const target = event.target as Element | null;
            target?.releasePointerCapture?.(event.pointerId);
          }}
        >
          <sphereGeometry args={[0.9, 18, 18]} />
          <meshStandardMaterial
            color={calibration.selectedLandmarkId === landmark.id ? "#ffe66d" : "#84c25f"}
            emissive={calibration.selectedLandmarkId === landmark.id ? "#d39b21" : "#1c5d35"}
            emissiveIntensity={0.75}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

function ModelLayer() {
  const gltf = useGLTF(MODEL_URL) as BattleGLTF;
  const scene = gltf.scene;
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  const boundsRef = useRef<ModelBounds | null>(null);
  const layers = useBattleStore((state) => state.layers);
  const cameraCommand = useBattleStore((state) => state.cameraCommand);
  const activeStepId = useBattleStore((state) => state.activeStepId);
  const setModelStatus = useBattleStore((state) => state.setModelStatus);
  const updateLandmarkPosition = useBattleStore((state) => state.updateLandmarkPosition);
  const setPlacingLandmark = useBattleStore((state) => state.setPlacingLandmark);
  const setDraggingLandmark = useBattleStore((state) => state.setDraggingLandmark);

  const sceneObject = useMemo(() => scene, [scene]);

  useLayoutEffect(() => {
    applyMaterialDefaults(sceneObject);
    applyLayerVisibility(sceneObject);
    syncNamedLandmarks(sceneObject);
    boundsRef.current = getModelBounds(sceneObject);
    setModelStatus("ready");
  }, [sceneObject, setModelStatus]);

  useEffect(() => {
    applyLayerVisibility(sceneObject);
  }, [layers, sceneObject]);

  useEffect(() => {
    const handlePointerUp = () => setDraggingLandmark(undefined);
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [setDraggingLandmark]);

  useEffect(() => {
    const bounds = boundsRef.current;
    const controls = controlsRef.current;
    if (!bounds || !controls) {
      return;
    }

    const target = findFocusTarget(bounds, useBattleStore.getState().landmarks);
    const offset = getPresetOffset(cameraCommand.preset, bounds.radius);
    const destination = target.clone().add(offset);

    camera.near = 0.08;
    camera.far = Math.max(3000, bounds.radius * 30);
    camera.updateProjectionMatrix();

    controls.minDistance = 3;
    controls.maxDistance = Math.max(500, bounds.radius * 8);
    controls.target.copy(target);
    controls.update();

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);
    gsap.to(camera.position, {
      x: destination.x,
      y: destination.y,
      z: destination.z,
      duration: 1.05,
      ease: "power3.out",
      onUpdate: () => camera.updateProjectionMatrix()
    });
    gsap.to(controls.target, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: 1.05,
      ease: "power3.out",
      onUpdate: () => controls.update()
    });
  }, [camera, cameraCommand.nonce, cameraCommand.preset, activeStepId]);

  const handlePlaceLandmark = (event: ThreeEvent<PointerEvent>) => {
    const state = useBattleStore.getState();
    if (!state.calibration.enabled || !state.calibration.placingLandmark) {
      return;
    }
    event.stopPropagation();
    updateLandmarkPosition(
      state.calibration.selectedLandmarkId,
      [event.point.x, event.point.y, event.point.z],
      true
    );
    setPlacingLandmark(false);
  };

  const handleDragMove = (event: ThreeEvent<PointerEvent>) => {
    const state = useBattleStore.getState();
    const dragId = state.calibration.draggingLandmarkId;
    if (!state.calibration.enabled || !dragId || !modelRef.current) {
      return;
    }
    event.stopPropagation();
    const raycaster = new THREE.Raycaster();
    raycaster.ray.copy(event.ray);
    const hits = raycaster.intersectObject(modelRef.current, true);
    const hit = hits.find((item) => item.object.name !== "calibration-handles");
    if (!hit) {
      return;
    }
    updateLandmarkPosition(dragId, [hit.point.x, hit.point.y, hit.point.z], true);
  };

  return (
    <>
      <primitive
        ref={modelRef}
        object={sceneObject}
        onPointerDown={handlePlaceLandmark}
        onPointerMove={handleDragMove}
      />
      <CalibrationHandles />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableRotate
        enablePan
        enableZoom
        zoomSpeed={0.85}
        panSpeed={0.78}
        rotateSpeed={0.5}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

export function SceneLoadingMessage() {
  return (
    <Html center>
      <div className="model-status-card">
        <strong>Đang tải sa bàn 3D</strong>
        <span>Đang đọc `public/models/sa-ban.glb`...</span>
      </div>
    </Html>
  );
}

export function Scene3D() {
  return (
    <>
      <color attach="background" args={["#080c07"]} />
      <fog attach="fog" args={["#080c07", 90, 360]} />
      <ambientLight intensity={0.72} color="#dad7ba" />
      <hemisphereLight intensity={1.05} color="#fff0c6" groundColor="#1e2c1b" />
      <directionalLight
        position={[80, 130, 95]}
        intensity={2.15}
        color="#ffe0a5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-80, 45, -70]} intensity={0.58} color="#7fa0c8" />
      <Environment preset="warehouse" />
      <ModelLayer />
      <TacticalProjector />
    </>
  );
}

useGLTF.preload(MODEL_URL);
