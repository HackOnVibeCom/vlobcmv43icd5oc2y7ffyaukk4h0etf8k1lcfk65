import { trpc } from "@/lib/trpc";
import { CheckCircle, AlertTriangle, XCircle, ClipboardList } from "lucide-react";
import type { SourceContext } from "../../../server/services/source";

const icons = {
  pass: <CheckCircle size={13} style={{ color: "#16734c", flexShrink: 0 }} />,
  warn: <AlertTriangle size={13} style={{ color: "#b07a00", flexShrink: 0 }} />,
  fail: <XCircle size={13} style={{ color: "#dc143c", flexShrink: 0 }} />,
};

export default function LaunchChecklist({ context }: { context: SourceContext }) {
  const checklist = trpc.generator.launchChecklist.useQuery({ context }, { staleTime: 60_000 });

  if (!checklist.data) return null;
  const { items, passCount, warnCount, failCount, ready } = checklist.data;

  return (
    <aside className="launch-checklist">
      <div className="launch-checklist__head">
        <ClipboardList size={14} />
        <span>Launch readiness</span>
        <div className="launch-checklist__tally">
          <span className="tally--pass">{passCount} pass</span>
          {warnCount > 0 && <span className="tally--warn">{warnCount} warn</span>}
          {failCount > 0 && <span className="tally--fail">{failCount} fail</span>}
          <span className={`tally-badge ${ready ? "tally-badge--ready" : "tally-badge--blocked"}`}>
            {ready ? "Ready" : "Needs attention"}
          </span>
        </div>
      </div>
      <div className="launch-checklist__items">
        {items.map(item => (
          <div key={item.id} className={`checklist-item checklist-item--${item.status}`}>
            {icons[item.status]}
            <div>
              <b>{item.label}</b>
              <small>{item.detail}</small>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
