import { Copy, Crosshair, Eye, EyeOff, Plus, Save, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useBattleStore } from "../store/useBattleStore";
import type { TacticalArrow, TacticalLayer, Team } from "../store/types";

const TEAM_OPTIONS: { value: Team; label: string }[] = [
  { value: "friendly", label: "Quân ta" },
  { value: "enemy", label: "Địch / Không kỵ" },
  { value: "relief", label: "Giải tỏa" }
];

const LAYER_OPTIONS: { value: TacticalLayer; label: string }[] = [
  { value: "advance", label: "Hướng tiến công" },
  { value: "counter", label: "Hướng phản kích" },
  { value: "routes", label: "Đường hành quân" }
];

function formatPosition(position: [number, number, number]) {
  return position.map((value) => value.toFixed(3)).join(", ");
}

function ArrowEditor({ arrow }: { arrow: TacticalArrow }) {
  const landmarks = useBattleStore((state) => state.landmarks);
  const steps = useBattleStore((state) => state.steps);
  const updateArrow = useBattleStore((state) => state.updateArrow);

  return (
    <div className="calibration-grid">
      <label>
        Step
        <select value={arrow.stepId} onChange={(event) => updateArrow(arrow.id, { stepId: event.target.value })}>
          {steps.map((step) => (
            <option key={step.id} value={step.id}>
              {step.shortDate} - {step.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        From
        <select value={arrow.from} onChange={(event) => updateArrow(arrow.id, { from: event.target.value })}>
          {landmarks.map((landmark) => (
            <option key={landmark.id} value={landmark.id}>
              {landmark.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        To
        <select value={arrow.to} onChange={(event) => updateArrow(arrow.id, { to: event.target.value })}>
          {landmarks.map((landmark) => (
            <option key={landmark.id} value={landmark.id}>
              {landmark.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Team
        <select value={arrow.team} onChange={(event) => updateArrow(arrow.id, { team: event.target.value as Team })}>
          {TEAM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Layer
        <select
          value={arrow.layer}
          onChange={(event) => updateArrow(arrow.id, { layer: event.target.value as TacticalLayer })}
        >
          {LAYER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Label
        <input value={arrow.label} onChange={(event) => updateArrow(arrow.id, { label: event.target.value })} />
      </label>
      <label className="range-field">
        Curve
        <input
          type="range"
          min="-0.65"
          max="0.65"
          step="0.01"
          value={arrow.curve}
          onChange={(event) => updateArrow(arrow.id, { curve: Number(event.target.value) })}
        />
        <span>{arrow.curve.toFixed(2)}</span>
      </label>
    </div>
  );
}

export function CalibrationMode() {
  const calibration = useBattleStore((state) => state.calibration);
  const landmarks = useBattleStore((state) => state.landmarks);
  const arrows = useBattleStore((state) => state.arrows);
  const selectedLandmark = useMemo(
    () => landmarks.find((landmark) => landmark.id === calibration.selectedLandmarkId) ?? landmarks[0],
    [landmarks, calibration.selectedLandmarkId]
  );
  const selectedArrow = arrows.find((arrow) => arrow.id === calibration.selectedArrowId) ?? arrows[0];
  const setCalibrationEnabled = useBattleStore((state) => state.setCalibrationEnabled);
  const setSelectedLandmark = useBattleStore((state) => state.setSelectedLandmark);
  const addLandmark = useBattleStore((state) => state.addLandmark);
  const setPlacingLandmark = useBattleStore((state) => state.setPlacingLandmark);
  const setSelectedArrow = useBattleStore((state) => state.setSelectedArrow);
  const addArrow = useBattleStore((state) => state.addArrow);
  const saveCalibration = useBattleStore((state) => state.saveCalibration);
  const exportCalibration = useBattleStore((state) => state.exportCalibration);
  const setCopyStatus = useBattleStore((state) => state.setCalibrationCopyStatus);
  const setPreview = useBattleStore((state) => state.setCalibrationPreview);
  const updateLandmarkOffset = useBattleStore((state) => state.updateLandmarkOffset);
  const [exportText, setExportText] = useState("");
  const [newLandmarkName, setNewLandmarkName] = useState("");

  if (!calibration.unlocked) {
    return null;
  }

  if (!calibration.enabled) {
    return (
      <button className="calibrate-pill" type="button" onClick={() => setCalibrationEnabled(true)}>
        <SlidersHorizontal size={15} />
        CALIBRATE
      </button>
    );
  }

  const copyJson = async () => {
    const json = exportCalibration();
    setExportText(json);
    try {
      await navigator.clipboard.writeText(json);
      setCopyStatus("Copied JSON");
    } catch {
      setCopyStatus("JSON ready below");
    }
  };

  return (
    <aside className="panel calibration-panel">
      <header className="panel-header">
        <span>CALIBRATION / CĂN CHỈNH</span>
        <button type="button" onClick={() => setCalibrationEnabled(false)} aria-label="Đóng calibration">
          <X size={16} />
        </button>
      </header>

      <section>
        <div className="calibration-section-title">Landmark</div>
        <label>
          Điểm neo
          <select value={selectedLandmark.id} onChange={(event) => setSelectedLandmark(event.target.value)}>
            {landmarks.map((landmark) => (
              <option key={landmark.id} value={landmark.id}>
                {landmark.name}
              </option>
            ))}
          </select>
        </label>
        <div className="coordinate-readout">{formatPosition(selectedLandmark.position)}</div>
        <div className="button-row">
          <button
            className={calibration.placingLandmark ? "is-active" : ""}
            type="button"
            onClick={() => setPlacingLandmark(!calibration.placingLandmark)}
          >
            <Crosshair size={14} />
            Place selected landmark
          </button>
        </div>
        <div className="offset-controls">
          <label>
            Label X
            <input
              type="number"
              value={selectedLandmark.labelOffset[0]}
              onChange={(event) =>
                updateLandmarkOffset(selectedLandmark.id, [Number(event.target.value), selectedLandmark.labelOffset[1]])
              }
            />
          </label>
          <label>
            Label Y
            <input
              type="number"
              value={selectedLandmark.labelOffset[1]}
              onChange={(event) =>
                updateLandmarkOffset(selectedLandmark.id, [selectedLandmark.labelOffset[0], Number(event.target.value)])
              }
            />
          </label>
        </div>
        <div className="new-landmark-row">
          <input
            value={newLandmarkName}
            onChange={(event) => setNewLandmarkName(event.target.value)}
            placeholder="Tên landmark mới"
          />
          <button
            type="button"
            onClick={() => {
              addLandmark(newLandmarkName);
              setNewLandmarkName("");
            }}
          >
            <Plus size={14} />
            Add landmark
          </button>
        </div>
        <p className="calibration-hint">
          Click lên sa bàn để đặt điểm. Kéo chấm tròn nhỏ trên sa bàn để tinh chỉnh theo bề mặt model.
        </p>
      </section>

      <section>
        <div className="calibration-section-title">Arrow</div>
        <label>
          Mũi tên
          <select value={selectedArrow.id} onChange={(event) => setSelectedArrow(event.target.value)}>
            {arrows.map((arrow) => (
              <option key={arrow.id} value={arrow.id}>
                {arrow.label} / {arrow.id}
              </option>
            ))}
          </select>
        </label>
        {selectedArrow && <ArrowEditor arrow={selectedArrow} />}
        <button className="wide-action" type="button" onClick={() => addArrow()}>
          <Plus size={14} />
          Add arrow from selection
        </button>
      </section>

      <section>
        <div className="calibration-section-title">Export</div>
        <div className="button-row">
          <button
            type="button"
            onClick={() => {
              const json = saveCalibration();
              setExportText(json);
            }}
          >
            <Save size={14} />
            Save to localStorage
          </button>
          <button type="button" onClick={copyJson}>
            <Copy size={14} />
            Copy JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setPreview(!calibration.preview);
              setCopyStatus(!calibration.preview ? "Preview on" : "Preview off");
            }}
            title="Bật/tắt preview tất cả mũi tên trong chế độ calibration"
          >
            {calibration.preview ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
        {calibration.copyStatus && <div className="copy-status">{calibration.copyStatus}</div>}
        {exportText && <textarea readOnly value={exportText} />}
      </section>
    </aside>
  );
}
