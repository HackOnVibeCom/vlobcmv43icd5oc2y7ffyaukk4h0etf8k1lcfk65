import { trpc } from "@/lib/trpc";
import type { SourceContext } from "../../../server/services/source";

type Platform = "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";

const gradeColor: Record<string, string> = {
  A: "#16734c",
  B: "#2454d7",
  C: "#b07a00",
  D: "#c24a00",
  F: "#dc143c",
};

export default function ASOScorePanel({ content, platform, context }: { content: string; platform: Platform; context: SourceContext }) {
  const score = trpc.generator.scoreListing.useQuery(
    { content, platform, context },
    { enabled: content.length > 0, staleTime: 30_000 }
  );

  if (!score.data) return null;
  const { grade, total, maxTotal, rules } = score.data;

  return (
    <div className="aso-score">
      <div className="aso-score__head">
        <span className="aso-score__grade" style={{ color: gradeColor[grade] }}>{grade}</span>
        <div>
          <b>Quality score</b>
          <span>{total}/{maxTotal} pts</span>
        </div>
      </div>
      <div className="aso-score__rules">
        {rules.map(rule => (
          <div key={rule.id} className={`aso-rule ${rule.passed ? "aso-rule--pass" : "aso-rule--fail"}`}>
            <span className="aso-rule__dot" />
            <div>
              <b>{rule.label}</b>
              <small>{rule.detail}</small>
            </div>
            <span className="aso-rule__pts">{rule.points}/{rule.maxPoints}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
