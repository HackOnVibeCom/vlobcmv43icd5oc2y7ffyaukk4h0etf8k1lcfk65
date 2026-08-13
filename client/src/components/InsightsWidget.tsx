import { trpc } from "@/lib/trpc";
import { TrendingUp } from "lucide-react";

const confidenceDot: Record<string, string> = {
  high: "#16734c",
  medium: "#2454d7",
  low: "#a99f90",
};

export default function InsightsWidget() {
  const insights = trpc.generator.patternInsights.useQuery(undefined, { staleTime: 5 * 60_000 });

  if (insights.isLoading) return null;
  if (!insights.data?.length) return null;

  return (
    <aside className="insights-widget">
      <div className="insights-widget__head">
        <TrendingUp size={14} />
        <span>Your campaign patterns</span>
      </div>
      <div className="insights-widget__list">
        {insights.data.map((insight, i) => (
          <div key={i} className="insight-item">
            <span
              className="insight-item__dot"
              style={{ background: confidenceDot[insight.confidence] }}
              title={`${insight.confidence} confidence`}
            />
            <p>{insight.text}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
