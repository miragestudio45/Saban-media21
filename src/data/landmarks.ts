import type { Landmark, Vec3 } from "../store/types";

const MODEL_TEXT_SCALE = 0.01;
const PLACE_GROUP_Y = 1.7497714757919312;

export function fromTextGroup(raw: Vec3): Vec3 {
  return [raw[0] * MODEL_TEXT_SCALE, -raw[2] * MODEL_TEXT_SCALE, raw[1] * MODEL_TEXT_SCALE];
}

export function fromPlaceGroup(raw: Vec3): Vec3 {
  return [
    raw[0] * MODEL_TEXT_SCALE,
    PLACE_GROUP_Y - raw[2] * MODEL_TEXT_SCALE,
    raw[1] * MODEL_TEXT_SCALE
  ];
}

export const DEFAULT_LANDMARKS: Landmark[] = [
  {
    id: "PLEIME",
    name: "Plei Me",
    nodeName: "pleime.001",
    raw: [-5949.0835, -1148.9618, -315.0],
    sourceGroup: "text",
    position: fromTextGroup([-5949.0835, -1148.9618, -315.0]),
    labelOffset: [12, -24],
    team: "friendly",
    type: "base"
  },
  {
    id: "DUC_CO",
    name: "Đức Cơ",
    nodeName: "ducco.001",
    raw: [2244.8796, 2979.4663, -315.0],
    sourceGroup: "text",
    position: fromTextGroup([2244.8796, 2979.4663, -315.0]),
    labelOffset: [8, -28],
    team: "friendly",
    type: "base"
  },
  {
    id: "PHU_MI",
    name: "Phú Mỹ",
    nodeName: "phumi",
    raw: [-6279.2314, 2827.9082, -408.0],
    sourceGroup: "place",
    position: fromPlaceGroup([-6279.2314, 2827.9082, -408.0]),
    labelOffset: [8, -20],
    team: "relief",
    type: "route"
  },
  {
    id: "ALBANY",
    name: "Albany",
    nodeName: "baialban.001",
    raw: [529.2712, -1431.5963, -315.0],
    sourceGroup: "text",
    position: fromTextGroup([529.2712, -1431.5963, -315.0]),
    labelOffset: [10, -24],
    team: "enemy",
    type: "ambush"
  },
  {
    id: "XRAY",
    name: "X-Ray",
    raw: [5200.0, -3150.0, -420.0],
    sourceGroup: "text",
    position: fromTextGroup([5200.0, -3150.0, -420.0]),
    labelOffset: [12, -24],
    team: "enemy",
    type: "landing-zone"
  },
  {
    id: "CHU_PONG",
    name: "Chư Pông",
    nodeName: "chupong.001",
    raw: [5950.7607, -3460.8594, -430.0],
    sourceGroup: "text",
    position: fromTextGroup([5950.7607, -3460.8594, -430.0]),
    labelOffset: [10, -22],
    team: "friendly",
    type: "terrain"
  },
  {
    id: "BAU_CAN",
    name: "Bàu Cạn",
    nodeName: "baucan.001",
    raw: [-4743.3916, 3761.7322, -315.0],
    sourceGroup: "text",
    position: fromTextGroup([-4743.3916, 3761.7322, -315.0]),
    labelOffset: [8, -22],
    team: "neutral",
    type: "village"
  },
  {
    id: "PLAY_BONGO",
    name: "Blay Bôngô",
    nodeName: "playbongo",
    raw: [943.7631, 133.381, -92.0],
    sourceGroup: "place",
    position: fromPlaceGroup([943.7631, 133.381, -92.0]),
    labelOffset: [10, -18],
    team: "neutral",
    type: "village"
  },
  {
    id: "BONG_KHO",
    name: "Bông Khô",
    nodeName: "bongkho.001",
    raw: [-2836.512, 1023.1218, -315.0],
    sourceGroup: "text",
    position: fromTextGroup([-2836.512, 1023.1218, -315.0]),
    labelOffset: [10, -22],
    team: "friendly",
    type: "route"
  },
  {
    id: "DUC_VINH",
    name: "Đức Vinh",
    nodeName: "ducvinh",
    raw: [6500.9385, -119.7017, -92.0],
    sourceGroup: "place",
    position: fromPlaceGroup([6500.9385, -119.7017, -92.0]),
    labelOffset: [8, -18],
    team: "neutral",
    type: "village"
  },
  {
    id: "IA_KAENG",
    name: "Ia Kaeng",
    nodeName: "iakaeng",
    raw: [4368.2847, -565.1727, -92.0],
    sourceGroup: "place",
    position: fromPlaceGroup([4368.2847, -565.1727, -92.0]),
    labelOffset: [10, -18],
    team: "neutral",
    type: "village"
  },
  {
    id: "THANH_BINH",
    name: "Thanh Bình",
    nodeName: "thanhbinh.001",
    raw: [-1094.0221, 3463.8081, -315.0],
    sourceGroup: "text",
    position: fromTextGroup([-1094.0221, 3463.8081, -315.0]),
    labelOffset: [8, -22],
    team: "neutral",
    type: "village"
  },
  {
    id: "CHU_PROU",
    name: "Chư Prou",
    nodeName: "chuprou.022",
    raw: [5371.9404, 1744.5515, -315.0],
    sourceGroup: "text",
    position: fromTextGroup([5371.9404, 1744.5515, -315.0]),
    labelOffset: [8, -22],
    team: "friendly",
    type: "terrain"
  }
];
