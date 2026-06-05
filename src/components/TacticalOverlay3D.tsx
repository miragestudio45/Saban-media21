import { useMemo } from "react";
import { useBattleStore } from "../store/useBattleStore";
import type { ProjectedArrow, ProjectedPoint, Team } from "../store/types";

const TEAM_COLORS: Record<Team, string> = {
  friendly: "#d93b35",
  enemy: "#2f67b2",
  relief: "#d7a323",
  neutral: "#c9c8a8"
};

function shouldShowArrow(arrow: ProjectedArrow) {
  const { layers } = useBattleStore.getState();
  if (arrow.layer === "advance") {
    return layers.advanceArrows;
  }
  if (arrow.layer === "counter") {
    return layers.counterArrows;
  }
  return layers.routes;
}

function pointVisible(point?: ProjectedPoint) {
  return Boolean(point && point.visible);
}

function makeCurvePath(from: ProjectedPoint, to: ProjectedPoint, curve: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;
  const controlX = (from.x + to.x) / 2 + normalX * length * curve;
  const controlY = (from.y + to.y) / 2 + normalY * length * curve;
  return {
    d: `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(
      1
    )} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
    labelX: controlX,
    labelY: controlY
  };
}

function MarkerDefs() {
  return (
    <defs>
      <filter id="arrow-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {(Object.entries(TEAM_COLORS) as [Team, string][]).map(([team, color]) => (
        <marker
          key={team}
          id={`arrow-${team}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

function ArrowLayer() {
  const projection = useBattleStore((state) => state.projection);
  const layers = useBattleStore((state) => state.layers);

  const arrows = useMemo(
    () =>
      projection.arrows.filter(
        (arrow) => pointVisible(arrow.from) && pointVisible(arrow.to) && shouldShowArrow(arrow)
      ),
    [projection.arrows, layers]
  );

  return (
    <>
      {arrows.map((arrow) => {
        const path = makeCurvePath(arrow.from, arrow.to, arrow.curve);
        return (
          <g key={arrow.id} className={`tactical-arrow tactical-arrow--${arrow.team}`}>
            <path
              d={path.d}
              markerEnd={`url(#arrow-${arrow.team})`}
              filter="url(#arrow-glow)"
              style={{ stroke: TEAM_COLORS[arrow.team] }}
            />
            {arrow.label && (
              <text x={path.labelX} y={path.labelY - 7} style={{ fill: TEAM_COLORS[arrow.team] }}>
                {arrow.label}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

function RingLayer() {
  const rings = useBattleStore((state) => state.projection.rings);
  const show = useBattleStore((state) => state.layers.timelines);

  if (!show) {
    return null;
  }

  return (
    <>
      {rings
        .filter((ring) => pointVisible(ring.center))
        .map((ring) => (
          <g key={ring.id} className={`tactical-ring tactical-ring--${ring.team}`}>
            <ellipse
              cx={ring.center.x}
              cy={ring.center.y}
              rx={ring.rx}
              ry={ring.ry}
              style={{ stroke: TEAM_COLORS[ring.team] }}
            />
            {ring.label && (
              <text x={ring.center.x} y={ring.center.y - ring.ry - 8} style={{ fill: TEAM_COLORS[ring.team] }}>
                {ring.label}
              </text>
            )}
          </g>
        ))}
    </>
  );
}

function EffectLayer() {
  const effects = useBattleStore((state) => state.projection.effects);
  const show = useBattleStore((state) => state.layers.timelines);

  if (!show) {
    return null;
  }

  return (
    <div className="effect-layer" aria-hidden="true">
      {effects
        .filter((effect) => pointVisible(effect.point))
        .map((effect) => (
          <div
            key={effect.id}
            className={`effect-marker effect-marker--${effect.kind} effect-marker--${effect.team}`}
            style={{
              left: `${effect.point.x}px`,
              top: `${effect.point.y}px`
            }}
          >
            {effect.kind === "explosion" && (
              <>
                <span />
                <span />
                <span />
              </>
            )}
            {effect.kind === "drop" && (
              <>
                <i />
                <i />
                <i />
              </>
            )}
            {effect.label && <b>{effect.label}</b>}
          </div>
        ))}
    </div>
  );
}

function LandmarkLayer() {
  const projection = useBattleStore((state) => state.projection);
  const landmarks = useBattleStore((state) => state.landmarks);
  const layers = useBattleStore((state) => state.layers);
  const calibrationEnabled = useBattleStore((state) => state.calibration.enabled);

  if (!layers.landmarks) {
    return null;
  }

  return (
    <div className={`landmark-layer ${calibrationEnabled ? "is-calibrating" : ""}`} aria-hidden="true">
      {landmarks.map((landmark) => {
        const point = projection.points[landmark.id];
        if (!pointVisible(point)) {
          return null;
        }
        if (landmark.team === "friendly" && !layers.friendlyFlags) {
          return null;
        }
        if (landmark.team === "enemy" && !layers.enemyFlags) {
          return null;
        }

        return (
          <div
            key={landmark.id}
            className={`landmark-label landmark-label--${landmark.team} landmark-label--${landmark.type}`}
            style={{
              left: `${point.x + landmark.labelOffset[0]}px`,
              top: `${point.y + landmark.labelOffset[1]}px`
            }}
          >
            <span className="landmark-pin" />
            <span className="landmark-name">{landmark.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export function TacticalOverlay3D() {
  const projection = useBattleStore((state) => state.projection);
  const uiHidden = useBattleStore((state) => state.uiHidden);

  if (uiHidden || projection.width <= 0 || projection.height <= 0) {
    return null;
  }

  return (
    <div className="tactical-overlay" aria-hidden="true">
      <svg className="tactical-svg" width={projection.width} height={projection.height}>
        <MarkerDefs />
        <RingLayer />
        <ArrowLayer />
      </svg>
      <EffectLayer />
      <LandmarkLayer />
    </div>
  );
}
