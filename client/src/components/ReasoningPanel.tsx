import { trpc } from "@/lib/trpc";
import type { SourceContext } from "../../../server/services/source";

type Platform = "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";

export default function ReasoningPanel({ content, platform, context }: { content: string; platform: Platform; context: SourceContext }) {
  const explain = trpc.generator.explainGeneration.useQuery(
    { content, platform, context },
    { enabled: content.length > 0, staleTime: 60_000 }
  );

  if (!explain.data?.length) return null;

  return (
    <div className="reasoning-panel">
      <span className="reasoning-panel__label">Why this copy</span>
      {explain.data.map((point, i) => (
        <div key={i} className="reasoning-point">
          <b>{point.signal}</b>
          <p>{point.detail}</p>
        </div>
      ))}
    </div>
  );
}
