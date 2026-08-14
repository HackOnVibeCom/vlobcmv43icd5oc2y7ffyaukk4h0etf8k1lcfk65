import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FlipHorizontal, LoaderCircle, Star, Clipboard } from "lucide-react";

type Platform = "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";

export default function ABVariantPanel({
  campaignId,
  platform,
  onPickVariant,
}: {
  campaignId: number;
  platform: Platform;
  onPickVariant: (content: string) => void;
}) {
  const [result, setResult] = useState<Awaited<ReturnType<typeof generateAB.mutateAsync>> | null>(null);

  const generateAB = trpc.generator.generateAB.useMutation({
    onSuccess: (data) => setResult(data),
    onError: (e) => toast.error(e.message),
  });

  function copyVariant(content: string) {
    navigator.clipboard.writeText(content);
    toast.success("Variant copied.");
  }

  return (
    <div className="ab-panel">
      <div className="ab-panel__head">
        <FlipHorizontal size={13} />
        <span>A/B auto-pick</span>
        {!result && (
          <Button
            size="sm"
            disabled={generateAB.isPending}
            onClick={() => generateAB.mutate({ campaignId, platform })}
          >
            {generateAB.isPending ? <LoaderCircle size={12} className="spin" /> : <FlipHorizontal size={12} />}
            {generateAB.isPending ? "Generating…" : "Generate 2 angles"}
          </Button>
        )}
        {result && (
          <button className="ab-reset" onClick={() => setResult(null)}>Reset</button>
        )}
      </div>

      {result && (
        <>
          <p className="ab-verdict">
            <Star size={11} fill="currentColor" style={{ color: "#b07a00" }} />
            Critic picked <b>{result.winnerAngle}</b> — {result.criticReason}
          </p>
          <div className="ab-variants">
            {result.variants.map((v, i) => (
              <div key={i} className={`ab-variant ${i === result.winner ? "ab-variant--winner" : ""}`}>
                <div className="ab-variant__head">
                  <span className="ab-angle">{v.angle}</span>
                  {i === result.winner && <span className="ab-winner-badge">Critic's pick</span>}
                  <span className="ab-chars">{v.characterCount} chars</span>
                </div>
                <p className="ab-copy">{v.content}</p>
                <div className="ab-variant__actions">
                  <button onClick={() => copyVariant(v.content)}><Clipboard size={11} /> Copy</button>
                  <button onClick={() => { onPickVariant(v.content); toast.success("Variant applied to editor."); }}>
                    Use this
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
