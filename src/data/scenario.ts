import type { TacticalArrow, TacticalEffect, TacticalRing, TimelineStep } from "../store/types";

export const SCENARIO_STEPS: TimelineStep[] = [
  {
    id: "step-1",
    index: 1,
    date: "19.10.1965",
    shortDate: "19/10",
    title: "Thiết lập chiến trường",
    headline: "Đợt vây ép Plei Me",
    description:
      "Quân khu triển khai bao vây căn cứ Plei Me từ nhiều hướng. Lực lượng chủ lực cơ động, chuẩn bị phân kích và kéo đối phương ra khỏi công sự.",
    friendlyForces: "Các đơn vị chủ lực Quân giải phóng",
    enemyForces: "1dMi, dCD952, 93L/c...",
    focus: ["DUC_CO", "PLEIME", "CHU_PONG"],
    summaryTitle: "Thiết lập chiến trường",
    summary: {
      friendly: "~ 3.000",
      enemy: "~ 6.000",
      note: "Bộ đội chủ lực và địa phương / Lính Mỹ và chư hầu"
    }
  },
  {
    id: "step-2",
    index: 2,
    date: "23.10.1965",
    shortDate: "23/10",
    title: "Vây hãm Plei Me",
    headline: "Đợt vây ép Plei Me",
    description:
      "e33 áp sát Plei Me, vòng vây siết quanh căn cứ. e320 cơ động vào khu vực đánh chặn, pháo kích gây áp lực tại Đức Cơ.",
    friendlyForces: "e33, e320, pháo binh khu vực Đức Cơ",
    enemyForces: "Lực lượng phòng thủ Plei Me",
    focus: ["DUC_CO", "PLEIME", "BONG_KHO"],
    summaryTitle: "Vây ép Plei Me",
    summary: {
      friendly: "e33 / e320",
      enemy: "Plei Me",
      note: "Bao vây, nghi binh, kéo quân đối phương ra ngoài căn cứ"
    }
  },
  {
    id: "step-3",
    index: 3,
    date: "24.10.1965",
    shortDate: "24/10",
    title: "Giải tỏa & phục kích",
    headline: "Trục giải tỏa bị đánh chặn",
    description:
      "Thiết giáp và lực lượng giải tỏa tiến từ Phú Mỹ về Plei Me. e320 đánh chặn trên trục giữa, tạo điểm phục kích có khói và nổ.",
    friendlyForces: "e320 và các đơn vị phục kích",
    enemyForces: "Thiết giáp, lực lượng giải tỏa",
    focus: ["PHU_MI", "PLEIME", "PLAY_BONGO"],
    summaryTitle: "Hướng tiến công (24.10)",
    summary: {
      friendly: "e320",
      enemy: "Thiết giáp",
      note: "Trục Phú Mỹ - Plei Me bị chặn ở khu vực giữa chiến trường"
    }
  },
  {
    id: "step-4",
    index: 4,
    date: "14.11.1965",
    shortDate: "14/11",
    title: "Chuyển quân / X-Ray",
    headline: "Không kỵ Mỹ đổ bộ, ta chuyển hướng",
    description:
      "Mũi xanh cơ động từ phía đông về Plei Me. Mũi đỏ rút và chuyển hướng về Chư Pông / X-Ray, hình thành khu vực giao tranh mới.",
    friendlyForces: "Các đơn vị cơ động về Chư Pông",
    enemyForces: "Không kỵ Mỹ",
    focus: ["PLEIME", "CHU_PONG", "XRAY"],
    summaryTitle: "Chuyển hướng tác chiến",
    summary: {
      friendly: "Chư Pông / X-Ray",
      enemy: "Không kỵ",
      note: "Không gian tác chiến dịch chuyển về sườn Chư Pông"
    }
  },
  {
    id: "step-5",
    index: 5,
    date: "17.11.1965",
    shortDate: "17/11",
    title: "Trận Ia Drang / Albany",
    headline: "Đổ bộ X-Ray",
    description:
      "Drop effect rơi xuống X-Ray. Vòng phòng ngự xanh hình thành tại bãi đáp, trong khi dBB9 đánh vào sườn phòng ngự.",
    friendlyForces: "dBB9 và các đơn vị quanh Chư Pông",
    enemyForces: "1/7 Cav tại X-Ray",
    focus: ["XRAY", "CHU_PONG", "ALBANY"],
    summaryTitle: "X-Ray",
    summary: {
      friendly: "dBB9",
      enemy: "1/7 Cav",
      note: "Đánh sườn vào bãi đáp, vòng phòng ngự xanh co cụm"
    }
  },
  {
    id: "step-6",
    index: 6,
    date: "26.11.1965",
    shortDate: "26/11",
    title: "Kết thúc chiến dịch",
    headline: "Phục kích Albany",
    description:
      "2/7 Cav rời X-Ray tới Albany. e33/e66 đánh hai sườn, vòng vây 360 độ khép lại quanh Albany với hiệu ứng nổ và khói.",
    friendlyForces: "e33, e66",
    enemyForces: "2/7 Cav",
    focus: ["XRAY", "ALBANY", "CHU_PONG"],
    summaryTitle: "Albany",
    summary: {
      friendly: "e33 / e66",
      enemy: "2/7 Cav",
      note: "Hai sườn khép lại quanh Albany, kết thúc chuỗi giao tranh chính"
    }
  }
];

export const DEFAULT_ARROWS: TacticalArrow[] = [
  {
    id: "arrow-e33-pleime",
    stepId: "step-2",
    from: "BONG_KHO",
    to: "PLEIME",
    team: "friendly",
    label: "e33",
    curve: -0.24,
    layer: "advance"
  },
  {
    id: "arrow-e320-ambush",
    stepId: "step-2",
    from: "CHU_PONG",
    to: "PLAY_BONGO",
    team: "friendly",
    label: "e320 cơ động",
    curve: 0.3,
    layer: "advance"
  },
  {
    id: "arrow-relief-phumi",
    stepId: "step-3",
    from: "PHU_MI",
    to: "PLEIME",
    team: "relief",
    label: "Giải tỏa",
    curve: -0.18,
    layer: "routes"
  },
  {
    id: "arrow-block-middle",
    stepId: "step-3",
    from: "PLAY_BONGO",
    to: "PLEIME",
    team: "friendly",
    label: "Đánh chặn",
    curve: 0.28,
    layer: "advance"
  },
  {
    id: "arrow-aircav-pleime",
    stepId: "step-4",
    from: "BAU_CAN",
    to: "PLEIME",
    team: "enemy",
    label: "Không kỵ",
    curve: -0.2,
    layer: "counter"
  },
  {
    id: "arrow-shift-xray",
    stepId: "step-4",
    from: "PLEIME",
    to: "XRAY",
    team: "friendly",
    label: "Khu vực C",
    curve: 0.32,
    layer: "advance"
  },
  {
    id: "arrow-dbb9-xray",
    stepId: "step-5",
    from: "CHU_PONG",
    to: "XRAY",
    team: "friendly",
    label: "dBB9",
    curve: -0.22,
    layer: "advance"
  },
  {
    id: "arrow-cav-albany",
    stepId: "step-6",
    from: "XRAY",
    to: "ALBANY",
    team: "enemy",
    label: "2/7 Cav",
    curve: 0.2,
    layer: "counter"
  },
  {
    id: "arrow-e33-albany",
    stepId: "step-6",
    from: "CHU_PONG",
    to: "ALBANY",
    team: "friendly",
    label: "e33",
    curve: -0.34,
    layer: "advance"
  },
  {
    id: "arrow-e66-albany",
    stepId: "step-6",
    from: "PLAY_BONGO",
    to: "ALBANY",
    team: "friendly",
    label: "e66",
    curve: 0.24,
    layer: "advance"
  }
];

export const DEFAULT_RINGS: TacticalRing[] = [
  {
    id: "ring-pleime",
    stepId: "step-2",
    center: "PLEIME",
    team: "friendly",
    radiusX: 7.5,
    radiusZ: 5.2,
    label: "Vòng vây"
  },
  {
    id: "ring-xray",
    stepId: "step-5",
    center: "XRAY",
    team: "enemy",
    radiusX: 6.2,
    radiusZ: 4.3,
    label: "Phòng ngự"
  },
  {
    id: "ring-albany",
    stepId: "step-6",
    center: "ALBANY",
    team: "friendly",
    radiusX: 7.8,
    radiusZ: 5.8,
    label: "360°"
  }
];

export const DEFAULT_EFFECTS: TacticalEffect[] = [
  {
    id: "effect-artillery-ducco",
    stepId: "step-2",
    at: "DUC_CO",
    kind: "explosion",
    team: "friendly",
    label: "Pháo kích"
  },
  {
    id: "effect-ambush-smoke",
    stepId: "step-3",
    at: "PLAY_BONGO",
    kind: "smoke",
    team: "friendly",
    label: "Phục kích"
  },
  {
    id: "effect-ambush-burst",
    stepId: "step-3",
    at: "PLAY_BONGO",
    kind: "explosion",
    team: "friendly"
  },
  {
    id: "effect-drop-xray",
    stepId: "step-5",
    at: "XRAY",
    kind: "drop",
    team: "enemy",
    label: "Đổ bộ"
  },
  {
    id: "effect-albany-smoke",
    stepId: "step-6",
    at: "ALBANY",
    kind: "smoke",
    team: "friendly"
  },
  {
    id: "effect-albany-burst",
    stepId: "step-6",
    at: "ALBANY",
    kind: "explosion",
    team: "friendly",
    label: "Albany"
  }
];
