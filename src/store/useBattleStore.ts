import { create } from "zustand";
import { DEFAULT_LANDMARKS } from "../data/landmarks";
import { DEFAULT_ARROWS, DEFAULT_EFFECTS, DEFAULT_RINGS, SCENARIO_STEPS } from "../data/scenario";
import type {
  CameraPreset,
  Landmark,
  LayerKey,
  ProjectionState,
  TacticalArrow,
  TacticalEffect,
  TacticalLayer,
  TacticalRing,
  Team,
  Vec3
} from "./types";

const CALIBRATION_STORAGE_KEY = "playme-ia-drang-calibration-v1";

const DEFAULT_LAYERS: Record<LayerKey, boolean> = {
  friendlyFlags: true,
  enemyFlags: true,
  advanceArrows: true,
  counterArrows: true,
  timelines: true,
  landmarks: true,
  routes: true,
  rivers: true,
  terrain: true
};

const EMPTY_PROJECTION: ProjectionState = {
  width: 0,
  height: 0,
  points: {},
  arrows: [],
  rings: [],
  effects: []
};

export interface CameraCommand {
  preset: CameraPreset;
  nonce: number;
}

export interface CalibrationState {
  unlocked: boolean;
  enabled: boolean;
  selectedLandmarkId: string;
  placingLandmark: boolean;
  draggingLandmarkId?: string;
  selectedArrowId: string;
  preview: boolean;
  copyStatus?: string;
}

interface StoredCalibration {
  version: 1;
  savedAt: string;
  landmarks: Landmark[];
  arrows: TacticalArrow[];
}

interface BattleState {
  steps: typeof SCENARIO_STEPS;
  activeStepId: string;
  layers: Record<LayerKey, boolean>;
  landmarks: Landmark[];
  arrows: TacticalArrow[];
  rings: TacticalRing[];
  effects: TacticalEffect[];
  cameraPreset: CameraPreset;
  cameraCommand: CameraCommand;
  isPlaying: boolean;
  uiHidden: boolean;
  infoOpen: boolean;
  layerPanelCollapsed: boolean;
  projection: ProjectionState;
  calibration: CalibrationState;
  modelStatus: "loading" | "ready" | "error";
  modelError?: string;
  setActiveStep: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleLayer: (key: LayerKey) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setUiHidden: (hidden: boolean) => void;
  setInfoOpen: (open: boolean) => void;
  setLayerPanelCollapsed: (collapsed: boolean) => void;
  setProjection: (projection: ProjectionState) => void;
  unlockCalibration: () => void;
  setCalibrationEnabled: (enabled: boolean) => void;
  setSelectedLandmark: (id: string) => void;
  addLandmark: (name?: string) => void;
  setPlacingLandmark: (placing: boolean) => void;
  setDraggingLandmark: (id?: string) => void;
  updateLandmarkPosition: (id: string, position: Vec3, calibrated?: boolean) => void;
  updateLandmarkOffset: (id: string, offset: [number, number]) => void;
  updateLandmarksFromModel: (positions: Record<string, Vec3>) => void;
  setSelectedArrow: (id: string) => void;
  updateArrow: (id: string, patch: Partial<TacticalArrow>) => void;
  addArrow: (arrow?: Partial<TacticalArrow>) => void;
  setCalibrationPreview: (preview: boolean) => void;
  setCalibrationCopyStatus: (status?: string) => void;
  saveCalibration: () => string;
  loadCalibration: () => boolean;
  exportCalibration: () => string;
  setModelStatus: (status: "loading" | "ready" | "error", error?: string) => void;
}

function getStepIndex(stepId: string) {
  return SCENARIO_STEPS.findIndex((step) => step.id === stepId);
}

function clampStepIndex(index: number) {
  const max = SCENARIO_STEPS.length - 1;
  return Math.min(max, Math.max(0, index));
}

function makeCameraCommand(preset: CameraPreset, nonce: number): CameraCommand {
  return { preset, nonce: nonce + 1 };
}

function mergeLandmarks(base: Landmark[], stored: StoredCalibration["landmarks"]) {
  const storedById = new Map(stored.map((landmark) => [landmark.id, landmark]));
  const merged = base.map((landmark) => {
    const saved = storedById.get(landmark.id);
    return saved
      ? {
          ...landmark,
          name: saved.name ?? landmark.name,
          position: saved.position,
          labelOffset: saved.labelOffset ?? landmark.labelOffset,
          team: saved.team ?? landmark.team,
          type: saved.type ?? landmark.type,
          calibrated: saved.calibrated ?? true
        }
      : landmark;
  });
  const baseIds = new Set(base.map((landmark) => landmark.id));
  const custom = stored.filter((landmark) => !baseIds.has(landmark.id));
  return [...merged, ...custom];
}

function buildCalibrationPayload(state: Pick<BattleState, "landmarks" | "arrows">): StoredCalibration {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    landmarks: state.landmarks,
    arrows: state.arrows
  };
}

export const useBattleStore = create<BattleState>((set, get) => ({
  steps: SCENARIO_STEPS,
  activeStepId: SCENARIO_STEPS[0].id,
  layers: DEFAULT_LAYERS,
  landmarks: DEFAULT_LANDMARKS,
  arrows: DEFAULT_ARROWS,
  rings: DEFAULT_RINGS,
  effects: DEFAULT_EFFECTS,
  cameraPreset: "ISO",
  cameraCommand: { preset: "ISO", nonce: 0 },
  isPlaying: false,
  uiHidden: false,
  infoOpen: true,
  layerPanelCollapsed: false,
  projection: EMPTY_PROJECTION,
  calibration: {
    unlocked: false,
    enabled: false,
    selectedLandmarkId: DEFAULT_LANDMARKS[0].id,
    placingLandmark: false,
    selectedArrowId: DEFAULT_ARROWS[0].id,
    preview: true
  },
  modelStatus: "loading",
  setActiveStep: (stepId) =>
    set((state) => ({
      activeStepId: stepId,
      cameraCommand: makeCameraCommand(state.cameraPreset, state.cameraCommand.nonce)
    })),
  nextStep: () =>
    set((state) => {
      const nextIndex = (getStepIndex(state.activeStepId) + 1) % SCENARIO_STEPS.length;
      return {
        activeStepId: SCENARIO_STEPS[nextIndex].id,
        cameraCommand: makeCameraCommand(state.cameraPreset, state.cameraCommand.nonce)
      };
    }),
  previousStep: () =>
    set((state) => {
      const current = getStepIndex(state.activeStepId);
      const nextIndex = current <= 0 ? SCENARIO_STEPS.length - 1 : current - 1;
      return {
        activeStepId: SCENARIO_STEPS[nextIndex].id,
        cameraCommand: makeCameraCommand(state.cameraPreset, state.cameraCommand.nonce)
      };
    }),
  setCameraPreset: (preset) =>
    set((state) => ({
      cameraPreset: preset,
      cameraCommand: makeCameraCommand(preset, state.cameraCommand.nonce)
    })),
  toggleLayer: (key) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [key]: !state.layers[key]
      }
    })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setUiHidden: (hidden) => set({ uiHidden: hidden }),
  setInfoOpen: (open) => set({ infoOpen: open }),
  setLayerPanelCollapsed: (collapsed) => set({ layerPanelCollapsed: collapsed }),
  setProjection: (projection) => set({ projection }),
  unlockCalibration: () =>
    set((state) => ({
      calibration: {
        ...state.calibration,
        unlocked: true
      }
    })),
  setCalibrationEnabled: (enabled) =>
    set((state) => ({
      calibration: {
        ...state.calibration,
        unlocked: true,
        enabled,
        placingLandmark: enabled ? state.calibration.placingLandmark : false,
        draggingLandmarkId: undefined
      }
    })),
  setSelectedLandmark: (id) =>
    set((state) => ({
      calibration: {
        ...state.calibration,
        selectedLandmarkId: id
      }
    })),
  addLandmark: (name) =>
    set((state) => {
      const base =
        state.landmarks.find((landmark) => landmark.id === state.calibration.selectedLandmarkId) ??
        state.landmarks[0];
      const id = `CUSTOM_${Date.now()}`;
      const nextLandmark: Landmark = {
        id,
        name: name?.trim() || "Landmark mới",
        position: [base.position[0] + 2, base.position[1], base.position[2] + 2],
        labelOffset: [10, -22],
        team: "neutral",
        type: "route",
        calibrated: true
      };
      return {
        landmarks: [...state.landmarks, nextLandmark],
        calibration: {
          ...state.calibration,
          selectedLandmarkId: id,
          placingLandmark: true
        }
      };
    }),
  setPlacingLandmark: (placing) =>
    set((state) => ({
      calibration: {
        ...state.calibration,
        placingLandmark: placing
      }
    })),
  setDraggingLandmark: (id) =>
    set((state) => ({
      calibration: {
        ...state.calibration,
        draggingLandmarkId: id
      }
    })),
  updateLandmarkPosition: (id, position, calibrated = true) =>
    set((state) => ({
      landmarks: state.landmarks.map((landmark) =>
        landmark.id === id ? { ...landmark, position, calibrated } : landmark
      )
    })),
  updateLandmarkOffset: (id, offset) =>
    set((state) => ({
      landmarks: state.landmarks.map((landmark) =>
        landmark.id === id ? { ...landmark, labelOffset: offset, calibrated: true } : landmark
      )
    })),
  updateLandmarksFromModel: (positions) =>
    set((state) => ({
      landmarks: state.landmarks.map((landmark) => {
        if (landmark.calibrated || !positions[landmark.id]) {
          return landmark;
        }
        return {
          ...landmark,
          position: positions[landmark.id]
        };
      })
    })),
  setSelectedArrow: (id) =>
    set((state) => ({
      calibration: {
        ...state.calibration,
        selectedArrowId: id
      }
    })),
  updateArrow: (id, patch) =>
    set((state) => ({
      arrows: state.arrows.map((arrow) => (arrow.id === id ? { ...arrow, ...patch } : arrow))
    })),
  addArrow: (arrow) =>
    set((state) => {
      const activeStep = state.activeStepId;
      const from = arrow?.from ?? state.calibration.selectedLandmarkId;
      const fallbackTo =
        state.landmarks.find((landmark) => landmark.id !== from)?.id ?? state.landmarks[0].id;
      const nextArrow: TacticalArrow = {
        id: `arrow-custom-${Date.now()}`,
        stepId: arrow?.stepId ?? activeStep,
        from,
        to: arrow?.to ?? fallbackTo,
        team: (arrow?.team as Team) ?? "friendly",
        label: arrow?.label ?? "Mũi mới",
        curve: arrow?.curve ?? 0.18,
        layer: (arrow?.layer as TacticalLayer) ?? "advance"
      };
      return {
        arrows: [...state.arrows, nextArrow],
        calibration: {
          ...state.calibration,
          selectedArrowId: nextArrow.id
        }
      };
    }),
  setCalibrationPreview: (preview) =>
    set((state) => ({
      calibration: {
        ...state.calibration,
        preview
      }
    })),
  setCalibrationCopyStatus: (status) =>
    set((state) => ({
      calibration: {
        ...state.calibration,
        copyStatus: status
      }
    })),
  saveCalibration: () => {
    const payload = buildCalibrationPayload(get());
    const json = JSON.stringify(payload, null, 2);
    window.localStorage.setItem(CALIBRATION_STORAGE_KEY, json);
    set((state) => ({
      calibration: {
        ...state.calibration,
        copyStatus: "Saved to localStorage"
      }
    }));
    return json;
  },
  loadCalibration: () => {
    const raw = window.localStorage.getItem(CALIBRATION_STORAGE_KEY);
    if (!raw) {
      return false;
    }
    try {
      const parsed = JSON.parse(raw) as StoredCalibration;
      set((state) => ({
        landmarks: mergeLandmarks(state.landmarks, parsed.landmarks ?? []),
        arrows: parsed.arrows?.length ? parsed.arrows : state.arrows,
        calibration: {
          ...state.calibration,
          copyStatus: "Loaded saved calibration"
        }
      }));
      return true;
    } catch (error) {
      console.warn("Unable to load calibration", error);
      return false;
    }
  },
  exportCalibration: () => JSON.stringify(buildCalibrationPayload(get()), null, 2),
  setModelStatus: (status, error) => set({ modelStatus: status, modelError: error })
}));

export function getActiveStep() {
  const state = useBattleStore.getState();
  return state.steps[clampStepIndex(getStepIndex(state.activeStepId))];
}
