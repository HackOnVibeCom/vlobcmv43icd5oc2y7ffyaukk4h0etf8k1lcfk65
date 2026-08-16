import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, BarChart3 } from "lucide-react";
import type { SourceContext } from "../../../server/services/source";

export default function CategoryBenchmark({ context }: { context: SourceContext }) {
  const benchmark = trpc.generator.categoryBenchmark.useQuery({ context }, { staleTime: 60_000 });

  if (!benchmark.data) return null;
  const { category, score, maxScore, rules } = benchmark.data;

  return (
    <aside className="launch-checklist">
      <div className="launch-checklist__head">
        <BarChart3 size={14} />
        <span>{category} benchmark</span>
        <div className="launch-checklist__tally">
          <span className="tally--pass">{score}/{maxScore} typical</span>
        </div>
      </div>
      <div className="launch-checklist__items">
        {rules.map(rule => (
          <div key={rule.id} className={`checklist-item ${rule.passed ? "" : "checklist-item--fail"}`}>
            {rule.passed ? (
              <CheckCircle size={13} style={{ color: "#16734c", flexShrink: 0 }} />
            ) : (
              <XCircle size={13} style={{ color: "#dc143c", flexShrink: 0 }} />
            )}
            <div>
              <b>{rule.label}</b>
              <small>{rule.detail}</small>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 10, lineHeight: 1.4 }}>
        Heuristic comparison against typical listings in this category — not live competitor data.
      </p>
    </aside>
  );
}
