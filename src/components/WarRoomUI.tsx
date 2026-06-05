import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Play,
  SkipBack,
  SkipForward,
  Square,
  Star
} from "lucide-react";
import { InfoCard } from "./InfoCard";
import { LayerPanel } from "./LayerPanel";
import { TimelineBar } from "./TimelineBar";
import { useBattleStore } from "../store/useBattleStore";
import type { CameraPreset } from "../store/types";

function TopControls() {
  const cameraPreset = useBattleStore((state) => state.cameraPreset);
  const setCameraPreset = useBattleStore((state) => state.setCameraPreset);
  const infoOpen = useBattleStore((state) => state.infoOpen);
  const setInfoOpen = useBattleStore((state) => state.setInfoOpen);
  const uiHidden = useBattleStore((state) => state.uiHidden);
  const setUiHidden = useBattleStore((state) => state.setUiHidden);
  const isPlaying = useBattleStore((state) => state.isPlaying);
  const togglePlay = useBattleStore((state) => state.togglePlay);
  const nextStep = useBattleStore((state) => state.nextStep);
  const previousStep = useBattleStore((state) => state.previousStep);

  const presets: CameraPreset[] = ["TOP", "ISO", "CINE"];

  return (
    <div className="top-control-zone">
      <div className="top-controls">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            className={cameraPreset === preset ? "is-active" : ""}
            onClick={() => setCameraPreset(preset)}
          >
            {preset}
          </button>
        ))}
        <button type="button" className={infoOpen ? "is-active" : ""} onClick={() => setInfoOpen(!infoOpen)}>
          <Info size={15} />
          INFO
        </button>
        <button type="button" onClick={() => setUiHidden(!uiHidden)}>
          {uiHidden ? <Eye size={15} /> : <EyeOff size={15} />}
          {uiHidden ? "HIỆN UI" : "ẨN UI"}
        </button>
        <button type="button" onClick={previousStep} aria-label="Mốc trước">
          <SkipBack size={15} />
        </button>
        <button type="button" className="play-button" onClick={togglePlay}>
          {isPlaying ? <Square size={14} /> : <Play size={14} />}
          {isPlaying ? "STOP" : "PLAY"}
        </button>
        <button type="button" onClick={nextStep} aria-label="Mốc sau">
          <SkipForward size={15} />
        </button>
      </div>
      <div className="legend-row">
        <span>
          <i className="legend-dot legend-dot--friendly" />
          Quân ta
        </span>
        <span>
          <i className="legend-dot legend-dot--enemy" />
          Địch / Không kỵ Mỹ
        </span>
        <span>
          <i className="legend-dot legend-dot--relief" />
          Giải tỏa / Thiết giáp
        </span>
      </div>
    </div>
  );
}

function HeaderCard() {
  return (
    <header className="war-header panel">
      <div className="header-emblem">
        <Star size={22} />
      </div>
      <div>
        <h1>CHIẾN DỊCH PLÂYME & IA DRANG</h1>
        <p>Sa bàn 3D / Bản đồ tác chiến tương tác</p>
      </div>
    </header>
  );
}

function SummaryPanel() {
  const steps = useBattleStore((state) => state.steps);
  const activeStepId = useBattleStore((state) => state.activeStepId);
  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];

  return (
    <aside className="panel summary-panel">
      <header className="panel-header">
        <span>{activeStep.summaryTitle.toUpperCase()}</span>
        <button type="button" aria-label="Thu gọn tóm tắt">
          −
        </button>
      </header>
      <div className="summary-block">
        <h3>HƯỚNG TIẾN CÔNG</h3>
        <div className="summary-line">
          <span className="arrow-swatch arrow-swatch--friendly" />
          Hướng tiến công của địch
        </div>
        <div className="summary-line">
          <span className="arrow-swatch arrow-swatch--enemy" />
          Hướng phản kích của ta
        </div>
      </div>
      <div className="summary-block">
        <h3>LỰC LƯỢNG THAM CHIẾN</h3>
        <div className="force-columns">
          <div>
            <span className="force-flag force-flag--friendly">★</span>
            <strong>Cờ TA</strong>
            <b>{activeStep.summary.friendly}</b>
          </div>
          <div>
            <span className="force-flag force-flag--enemy">×</span>
            <strong>Cờ ĐỊCH</strong>
            <b>{activeStep.summary.enemy}</b>
          </div>
        </div>
        <p>{activeStep.summary.note}</p>
      </div>
    </aside>
  );
}

export function WarRoomUI() {
  const uiHidden = useBattleStore((state) => state.uiHidden);
  const setUiHidden = useBattleStore((state) => state.setUiHidden);

  if (uiHidden) {
    return (
      <button className="show-ui-button" type="button" onClick={() => setUiHidden(false)}>
        <ChevronLeft size={16} />
        HIỆN UI
      </button>
    );
  }

  return (
    <div className="war-room-ui">
      <div className="left-stack">
        <HeaderCard />
        <LayerPanel />
      </div>
      <TopControls />
      <InfoCard />
      <SummaryPanel />
      <TimelineBar />
      <button className="edge-tab edge-tab--right" type="button" aria-label="Mở ghi chú chiến dịch">
        TRÍCH YẾU
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
