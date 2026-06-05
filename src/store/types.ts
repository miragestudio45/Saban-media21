export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export type Team = "friendly" | "enemy" | "relief" | "neutral";
export type CameraPreset = "TOP" | "ISO" | "CINE";

export type LayerKey =
  | "friendlyFlags"
  | "enemyFlags"
  | "advanceArrows"
  | "counterArrows"
  | "timelines"
  | "landmarks"
  | "routes"
  | "rivers"
  | "terrain";

export type TacticalLayer = "advance" | "counter" | "routes";

export interface Landmark {
  id: string;
  name: string;
  nodeName?: string;
  raw?: Vec3;
  sourceGroup?: "text" | "place";
  position: Vec3;
  labelOffset: Vec2;
  team: Team;
  type: "base" | "landing-zone" | "terrain" | "village" | "route" | "ambush";
  calibrated?: boolean;
}

export interface TacticalArrow {
  id: string;
  stepId: string;
  from: string;
  to: string;
  team: Team;
  label: string;
  curve: number;
  layer: TacticalLayer;
}

export interface TacticalRing {
  id: string;
  stepId: string;
  center: string;
  team: Team;
  radiusX: number;
  radiusZ: number;
  label?: string;
}

export type TacticalEffectKind = "explosion" | "smoke" | "drop";

export interface TacticalEffect {
  id: string;
  stepId: string;
  at: string;
  kind: TacticalEffectKind;
  team: Team;
  label?: string;
}

export interface ForceSummary {
  friendly: string;
  enemy: string;
  note: string;
}

export interface TimelineStep {
  id: string;
  index: number;
  date: string;
  shortDate: string;
  title: string;
  headline: string;
  description: string;
  friendlyForces: string;
  enemyForces: string;
  focus: string[];
  summaryTitle: string;
  summary: ForceSummary;
}

export interface ProjectedPoint {
  id: string;
  x: number;
  y: number;
  visible: boolean;
  depth: number;
}

export interface ProjectedArrow {
  id: string;
  team: Team;
  label: string;
  layer: TacticalLayer;
  from: ProjectedPoint;
  to: ProjectedPoint;
  curve: number;
}

export interface ProjectedRing {
  id: string;
  team: Team;
  center: ProjectedPoint;
  rx: number;
  ry: number;
  label?: string;
}

export interface ProjectedEffect {
  id: string;
  team: Team;
  kind: TacticalEffectKind;
  point: ProjectedPoint;
  label?: string;
}

export interface ProjectionState {
  width: number;
  height: number;
  points: Record<string, ProjectedPoint>;
  arrows: ProjectedArrow[];
  rings: ProjectedRing[];
  effects: ProjectedEffect[];
}
