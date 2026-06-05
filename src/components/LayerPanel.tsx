import {
  ArrowDownRight,
  CircleDot,
  Flag,
  Map,
  MapPinned,
  Milestone,
  Mountain,
  Route,
  Waves
} from "lucide-react";
import { MiniMap } from "./MiniMap";
import { useBattleStore } from "../store/useBattleStore";
import type { LayerKey } from "../store/types";

interface LayerItem {
  key: LayerKey;
  label: string;
  icon: typeof Flag;
  tone?: "red" | "blue" | "gold" | "muted";
}

const LAYERS: LayerItem[] = [
  { key: "friendlyFlags", label: "Cờ ta", icon: Flag, tone: "red" },
  { key: "enemyFlags", label: "Cờ địch", icon: Flag, tone: "muted" },
  { key: "advanceArrows", label: "Hướng tiến công", icon: ArrowDownRight, tone: "red" },
  { key: "counterArrows", label: "Hướng phản kích", icon: ArrowDownRight, tone: "blue" },
  { key: "timelines", label: "Mốc thời gian", icon: CircleDot, tone: "gold" },
  { key: "landmarks", label: "Địa điểm trọng yếu", icon: MapPinned },
  { key: "routes", label: "Đường hành quân", icon: Route },
  { key: "rivers", label: "Đường & sông suối", icon: Waves },
  { key: "terrain", label: "Địa hình", icon: Mountain }
];

function LayerToggle({ item }: { item: LayerItem }) {
  const active = useBattleStore((state) => state.layers[item.key]);
  const toggleLayer = useBattleStore((state) => state.toggleLayer);
  const Icon = item.icon;

  return (
    <button className="layer-toggle" type="button" onClick={() => toggleLayer(item.key)} aria-pressed={active}>
      <span className={`layer-icon layer-icon--${item.tone ?? "muted"}`}>
        <Icon size={18} strokeWidth={1.65} />
      </span>
      <span>{item.label}</span>
      <span className={`switch ${active ? "is-on" : ""}`} />
    </button>
  );
}

export function LayerPanel() {
  const collapsed = useBattleStore((state) => state.layerPanelCollapsed);
  const setCollapsed = useBattleStore((state) => state.setLayerPanelCollapsed);

  return (
    <aside className={`panel layer-panel ${collapsed ? "is-collapsed" : ""}`}>
      <header className="panel-header">
        <span>CHÚ GIẢI & LỌC LỚP</span>
        <button type="button" onClick={() => setCollapsed(!collapsed)} aria-label="Thu gọn chú giải">
          {collapsed ? "+" : "−"}
        </button>
      </header>
      {!collapsed && (
        <>
          <div className="layer-list">
            {LAYERS.map((item) => (
              <LayerToggle key={item.key} item={item} />
            ))}
          </div>
          <div className="map-section-title">
            <Map size={14} />
            BẢN ĐỒ PHỦ
          </div>
          <MiniMap />
        </>
      )}
    </aside>
  );
}
