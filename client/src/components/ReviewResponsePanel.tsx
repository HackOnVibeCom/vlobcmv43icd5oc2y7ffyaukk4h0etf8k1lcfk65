import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Clipboard, LoaderCircle, MessageSquare, Star } from "lucide-react";
import type { SourceContext } from "../../../server/services/source";

type Rating = 1 | 2 | 3 | 4 | 5;
type Platform = "appStore" | "googlePlay";

const TONE_COLORS = { empathetic: "#c24a00", grateful: "#16734c", constructive: "#2454d7" };
const TONE_LABELS = { empathetic: "Empathetic response", grateful: "Grateful response", constructive: "Constructive response" };

export default function ReviewResponsePanel({ context }: { context: SourceContext }) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<Rating>(3);
  const [platform, setPlatform] = useState<Platform>("googlePlay");
  const [result, setResult] = useState<{ draft: string; tone: string; characterCount: number; characterLimit: number } | null>(null);

  const sampleReviews = trpc.generator.sampleReviews.useQuery();

  const draft = trpc.generator.draftReviewResponse.useMutation({
    onSuccess: (data) => { setResult(data); toast.success("Response drafted."); },
    onError: (e) => toast.error(e.message),
  });

  function loadSample(i: number) {
    const s = sampleReviews.data?.[i];
    if (!s) return;
    setReviewText(s.reviewText);
    setRating(s.rating as Rating);
    setPlatform(s.platform as Platform);
    setResult(null);
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result.draft);
    toast.success("Response copied.");
  }

  return (
    <div className="review-panel">
      <div className="review-panel__head">
        <MessageSquare size={14} />
        <span>Review response drafts</span>
        <span className="review-panel__sub">Draft developer responses to store reviews</span>
      </div>

      {sampleReviews.data && (
        <div className="review-samples">
          <span>Load sample:</span>
          {sampleReviews.data.map((s, i) => (
            <button key={i} className="review-sample-btn" onClick={() => loadSample(i)}>
              {"★".repeat(s.rating)} {s.reviewerName ?? `Review ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="review-panel__form">
        <div className="review-panel__meta">
          <div className="review-stars">
            {([1, 2, 3, 4, 5] as Rating[]).map(n => (
              <button key={n} onClick={() => setRating(n)} className={`star-btn ${n <= rating ? "star-btn--active" : ""}`}>
                <Star size={16} fill={n <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <div className="review-platform-tabs">
            <button className={platform === "googlePlay" ? "is-active" : ""} onClick={() => setPlatform("googlePlay")}>Play Store</button>
            <button className={platform === "appStore" ? "is-active" : ""} onClick={() => setPlatform("appStore")}>App Store</button>
          </div>
        </div>

        <Textarea
          placeholder="Paste the review text here…"
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          rows={3}
        />

        <Button
          disabled={reviewText.trim().length < 5 || draft.isPending}
          onClick={() => draft.mutate({ context, reviewText: reviewText.trim(), rating, platform })}
        >
          {draft.isPending ? <LoaderCircle size={13} className="spin" /> : <MessageSquare size={13} />}
          {draft.isPending ? "Drafting…" : "Draft response"}
        </Button>
      </div>

      {result && (
        <div className="review-result">
          <div className="review-result__head">
            <span style={{ color: TONE_COLORS[result.tone as keyof typeof TONE_COLORS] }}>
              {TONE_LABELS[result.tone as keyof typeof TONE_LABELS]}
            </span>
            <span className="review-result__chars">{result.characterCount}/{result.characterLimit}</span>
            <button onClick={copy}><Clipboard size={11} /></button>
          </div>
          <p className="review-result__copy">{result.draft}</p>
        </div>
      )}
    </div>
  );
}
