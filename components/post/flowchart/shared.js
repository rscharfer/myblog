import { useState } from "react";

import CodeBlock from "../CodeBlock";

// Badge text per level. A parameter with no level (e.g. in a response) gets no badge.
export const LEVELS = {
  required: { label: "Required" },
  recommended: { label: "Recommended" },
  optional: { label: "Optional" },
};

const laneIndex = (flow, id) => flow.lanes.findIndex((l) => l.id === id);
const center = (flow, i) => `${((i + 0.5) / flow.lanes.length) * 100}%`;

export function Tags({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <span className="fc-tags">
      {tags.map((t) => (
        <span key={t} className="fc-tag">
          {t.toUpperCase()}
        </span>
      ))}
    </span>
  );
}

export function Badge({ level }) {
  if (!level) return null;
  const l = LEVELS[level];
  return <span className={`fc-badge fc-${level}`}>{l.label}</span>;
}

// Start / End markers.
export function Terminal({ kind, children }) {
  return (
    <div className={`fc-terminal fc-${kind}`}>
      <span className="fc-terminal-k">{kind === "start" ? "Start" : "End"}</span>
      <span>{children}</span>
    </div>
  );
}

// The swimlane overview: one row per step, arrows between lanes. Rows are buttons.
export function SwimLanes({ flow, current = null, onSelect, dim = false }) {
  const steps = flow.steps.map((s, i) => [s, i]);
  return (
    <div className={`fc-lanes${dim ? " fc-dim" : ""}`} style={{ "--lanes": flow.lanes.length }}>
      <div className="fc-heads" aria-hidden="true">
        {flow.lanes.map((l) => (
          <span key={l.id} title={l.name}>
            {l.short}
          </span>
        ))}
      </div>
      <div className="fc-body">
        {flow.lanes.map((l, i) => (
          <span key={l.id} className="fc-life" style={{ left: center(flow, i) }} aria-hidden="true" />
        ))}
        {steps.map(([s, i]) => {
          const lanes = s.at ? [laneIndex(flow, s.at)] : s.arrows.flatMap((a) => [laneIndex(flow, a.from), laneIndex(flow, a.to)]);
          const labelLeft = Math.min(Math.min(...lanes) + 0.5, flow.lanes.length * 0.4) / flow.lanes.length;
          const Tag = onSelect ? "button" : "div";
          return (
            <Tag
              key={s.id}
              type={onSelect ? "button" : undefined}
              className="fc-row"
              aria-current={current === i ? "step" : undefined}
              aria-label={onSelect ? `Step ${i + 1}: ${s.title}` : undefined}
              data-step={i}
              onClick={onSelect ? () => onSelect(i) : undefined}
            >
              <span className="fc-row-label" style={{ paddingLeft: `${labelLeft * 100}%` }}>
                <span className="fc-txt">
                  <span className="fc-n">{i + 1}</span> {s.short}
                </span>
              </span>
              {s.at ? (
                <span className="fc-at" style={{ left: center(flow, laneIndex(flow, s.at)) }} aria-hidden="true" />
              ) : (
                s.arrows.map((a, k) => {
                  const from = laneIndex(flow, a.from);
                  const to = laneIndex(flow, a.to);
                  const left = (Math.min(from, to) + 0.5) / flow.lanes.length;
                  const width = Math.abs(to - from) / flow.lanes.length;
                  return (
                    <span
                      key={k}
                      className={`fc-arrow fc-${a.channel} ${to > from ? "fc-right" : "fc-left"}`}
                      style={{ left: `${left * 100}%`, width: `${width * 100}%` }}
                      aria-hidden="true"
                    >
                      {a.label && <span className="fc-arrow-label">{a.label}</span>}
                    </span>
                  );
                })
              )}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <p className="fc-legend" aria-hidden="true">
      <span className="fc-key fc-front" /> through the browser <span className="fc-key fc-back" /> server to server{" "}
      <span className="fc-key-dot" /> on one machine
    </p>
  );
}

export function ParamList({ step, active, onActive }) {
  const params = step.params || [];
  return (
    <div className="fc-params">
      <div className="fc-params-head">
        <span className="kicker">{step.paramsLabel || "Parameters"}</span>
      </div>
      <ul>
        {params.map((p) => (
          <li key={p.name}>
            <button
              type="button"
              className="fc-param"
              aria-pressed={active === p.name}
              onClick={() => onActive(active === p.name ? null : p.name)}
            >
              <span className="fc-param-top">
                <code>{p.name}</code> <Badge level={p.level} /> <Tags tags={p.tags} />
              </span>
              <span className="fc-why">{p.why}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Everything about one step: what it does, the message and its parameters.
export function StepDetail({ flow, index, titleRef }) {
  const step = flow.steps[index];
  const [active, setActive] = useState(null);
  const activeLine = step.params?.find((p) => p.name === active)?.line;
  const m = step.message;
  const meta = m
    ? [`title="${m.title}"`, activeLine ? `{${activeLine}}` : "", m.mark ? `mark="${m.mark}"` : "", m.caption ? `caption="${m.caption}"` : ""].join(" ")
    : "";

  return (
    <div className="fc-detail">
      <div className="fc-detail-title" ref={titleRef} tabIndex={-1}>
        <span className="fc-n">{index + 1}</span> {step.title} <Tags tags={step.tags} />
      </div>
      <p className="fc-summary">{step.summary}</p>
      {step.checks && (
        <div className="fc-checks">
          <span className="kicker">{step.checksLabel || "Checks"}</span>
          <ul>
            {step.checks.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {m && <CodeBlock key={`${step.id}-${activeLine || 0}`} code={m.code} lang={m.lang} meta={meta} />}
      {step.params && step.params.length > 0 && <ParamList step={step} active={active} onActive={setActive} />}
      {step.notShown && <p className="fc-notshown">Not shown: {step.notShown}</p>}
    </div>
  );
}
