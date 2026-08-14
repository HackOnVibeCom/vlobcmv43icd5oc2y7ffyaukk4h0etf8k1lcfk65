import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, KeyRound, Plus, X } from "lucide-react";
import type { SourceContext } from "../../../server/services/source";

export default function KeywordPacker({ context }: { context: SourceContext }) {
  const [extras, setExtras] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const result = trpc.generator.packKeywords.useQuery(
    { context, extraKeywords: extras.length ? extras : undefined },
    { staleTime: 30_000 }
  );

  function addExtra() {
    const kw = draft.trim().toLowerCase();
    if (!kw || extras.includes(kw)) { setDraft(""); return; }
    setExtras(prev => [...prev, kw]);
    setDraft("");
  }

  function copy() {
    if (!result.data?.field) return;
    navigator.clipboard.writeText(result.data.field);
    toast.success("Keyword field copied — paste into App Store Connect.");
  }

  return (
    <aside className="keyword-packer">
      <div className="keyword-packer__head">
        <KeyRound size={14} />
        <span>iOS keyword field packer</span>
        <span className="kp-limit">100 char limit</span>
      </div>

      {result.data && (
        <>
          <div className="kp-field">
            <code>{result.data.field}</code>
            <button onClick={copy} title="Copy field"><Copy size={12} /></button>
          </div>
          <div className="kp-bar">
            <div className="kp-bar__fill" style={{ width: `${result.data.coverage}%` }} />
          </div>
          <div className="kp-meta">
            <span>{result.data.charCount}/{result.data.charLimit} chars ({result.data.coverage}% budget used)</span>
            <span>{result.data.keywords.length} keywords packed</span>
          </div>
          {result.data.dropped.length > 0 && (
            <p className="kp-dropped">
              Didn't fit: {result.data.dropped.slice(0, 8).join(", ")}
              {result.data.dropped.length > 8 ? ` +${result.data.dropped.length - 8} more` : ""}
            </p>
          )}
        </>
      )}

      <div className="kp-extras">
        <div className="kp-extras__input">
          <Input
            placeholder="Add a keyword..."
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addExtra()}
          />
          <Button size="sm" variant="outline" onClick={addExtra}><Plus size={13} /></Button>
        </div>
        {extras.length > 0 && (
          <div className="kp-tags">
            {extras.map(kw => (
              <span key={kw} className="kp-tag">
                {kw}
                <button onClick={() => setExtras(prev => prev.filter(k => k !== kw))}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
