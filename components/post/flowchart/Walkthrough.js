import { useRef, useState } from "react";

import { Legend, StepDetail, SwimLanes, Terminal } from "./shared";

// The whole flow as swimlanes, with Back / Next. The current step is highlighted
// in the diagram and explained in the panel below it. Left/right arrow keys also step.
export default function Walkthrough({ flow }) {
  const [i, setI] = useState(0);
  const [requiredOnly, setRequiredOnly] = useState(false);
  const titleRef = useRef(null);
  const n = flow.steps.length;

  const go = (next, focus = false) => {
    const k = Math.max(0, Math.min(n - 1, next));
    setI(k);
    if (focus) requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));
  };
  const onKeyDown = (e) => {
    if (e.target.closest("input, .fc-param, pre")) return;
    if (e.key === "ArrowRight") go(i + 1);
    if (e.key === "ArrowLeft") go(i - 1);
  };

  return (
    <div className="fc fc-walkthrough" onKeyDown={onKeyDown}>
      <p className="fc-before">{flow.before}</p>
      <Terminal kind="start">{flow.start}</Terminal>
      <SwimLanes flow={flow} current={i} onSelect={(k) => go(k, true)} dim />
      <Terminal kind="end">{flow.end}</Terminal>
      <Legend />

      <div className="fc-nav">
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0}>
          ← Back
        </button>
        <span className="fc-progress" aria-live="polite">
          Step {i + 1} of {n}
          {i === n - 1 && " · the end"}
        </span>
        <button type="button" onClick={() => go(i + 1)} disabled={i === n - 1}>
          Next →
        </button>
      </div>
      <div className="fc-dots" aria-hidden="true">
        {flow.steps.map((s, k) => (
          <span key={s.id} className={k === i ? "on" : k < i ? "done" : ""} />
        ))}
      </div>

      <StepDetail
        key={i}
        flow={flow}
        index={i}
        requiredOnly={requiredOnly}
        onRequiredOnly={setRequiredOnly}
        titleRef={titleRef}
      />
    </div>
  );
}
