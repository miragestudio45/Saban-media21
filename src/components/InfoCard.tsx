import { ChevronRight, X } from "lucide-react";
import { useBattleStore } from "../store/useBattleStore";

export function InfoCard() {
  const steps = useBattleStore((state) => state.steps);
  const activeStepId = useBattleStore((state) => state.activeStepId);
  const infoOpen = useBattleStore((state) => state.infoOpen);
  const setInfoOpen = useBattleStore((state) => state.setInfoOpen);
  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];

  if (!infoOpen) {
    return null;
  }

  return (
    <aside className="panel info-card">
      <header className="info-card-header">
        <span>‹ MỐC THỜI GIAN</span>
        <button type="button" onClick={() => setInfoOpen(false)} aria-label="Đóng thông tin">
          <X size={17} />
        </button>
      </header>
      <div className="info-card-main">
        <div className="step-orb">{activeStep.index}</div>
        <div>
          <h2>{activeStep.headline}</h2>
          <time>{activeStep.date}</time>
        </div>
      </div>
      <div className="force-list">
        <div>
          <span className="force-flag force-flag--friendly">★</span>
          <p>
            <strong>Lực lượng ta</strong>
            {activeStep.friendlyForces}
          </p>
        </div>
        <div>
          <span className="force-flag force-flag--enemy">×</span>
          <p>
            <strong>Lực lượng địch</strong>
            {activeStep.enemyForces}
          </p>
        </div>
      </div>
      <p className="info-description">{activeStep.description}</p>
      <button className="detail-button" type="button">
        XEM CHI TIẾT
        <ChevronRight size={15} />
      </button>
    </aside>
  );
}
