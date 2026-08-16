import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Compass, LoaderCircle } from "lucide-react";
import type { SourceContext } from "../../../server/services/source";

export default function CompetitorMap({ context }: { context: SourceContext }) {
  const map = trpc.generator.competitorMap.useQuery(
    { context },
    { enabled: false, retry: false }
  );

  useEffect(() => {
    if (map.error) toast.error(map.error.message);
  }, [map.error]);

  return (
    <div className="competitor-map">
      <div className="competitor-map__head">
        <Compass size={13} />
        <span>Competitor positioning</span>
        {!map.data && (
          <Button size="sm" disabled={map.isFetching} onClick={() => map.refetch()}>
            {map.isFetching ? <LoaderCircle size={12} className="spin" /> : <Compass size={12} />}
            {map.isFetching ? "Mapping…" : "Generate map"}
          </Button>
        )}
      </div>

      {map.data && (
        <>
          <p className="competitor-map__summary">{map.data.positioningSummary}</p>
          <div className="competitor-map__items">
            {map.data.competitors.map((c, i) => (
              <div key={i} className="competitor-map__item">
                <b>{c.name}</b>
                <small>{c.angle}</small>
              </div>
            ))}
          </div>
          <p className="competitor-map__disclaimer">
            Illustrative comparables based on the app's category and description — not verified live market data.
          </p>
        </>
      )}
    </div>
  );
}
