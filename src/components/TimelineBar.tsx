import { useBattleStore } from "../store/useBattleStore";

export function TimelineBar() {
  const steps = useBattleStore((state) => state.steps);
  const activeStepId = useBattleStore((state) => state.activeStepId);
  const setActiveStep = useBattleStore((state) => state.setActiveStep);

  return (
    <nav className="timeline-wrap" aria-label="Timeline chiến dịch">
      <div className="timeline-title">TIMELINE CHIẾN DỊCH</div>
      <div className="timeline-line" />
      <div className="timeline-items">
        {steps.map((step) => {
          const active = step.id === activeStepId;
          return (
            <button
              key={step.id}
              type="button"
              className={`timeline-item ${active ? "is-active" : ""}`}
              onClick={() => setActiveStep(step.id)}
            >
              <span className="timeline-dot" />
              <span className="timeline-date">{step.shortDate}</span>
              <span className="timeline-label">{step.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
