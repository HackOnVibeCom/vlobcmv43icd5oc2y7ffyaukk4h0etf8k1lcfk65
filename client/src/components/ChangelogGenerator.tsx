import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Clipboard, FileText, LoaderCircle } from "lucide-react";
import type { SourceContext } from "../../../server/services/source";

const PLATFORM_LABELS: Record<string, string> = {
  appStore: "App Store — What's New",
  googlePlay: "Play Store — Release Notes",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  productHunt: "Product Hunt",
};

export default function ChangelogGenerator({ context }: { context: SourceContext }) {
  const [version, setVersion] = useState("");
  const [changes, setChanges] = useState("");
  const [results, setResults] = useState<Array<{ platform: string; label: string; content: string; characterCount: number; characterLimit: number }>>([]);

  const generate = trpc.generator.generateChangelog.useMutation({
    onSuccess: (data) => { setResults(data); toast.success("Release notes generated."); },
    onError: (e) => toast.error(e.message),
  });

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied.");
  }

  return (
    <div className="changelog-panel">
      <div className="changelog-panel__head">
        <FileText size={14} />
        <span>Update / changelog copy</span>
        <span className="changelog-panel__sub">Generate "What's New" release notes per platform</span>
      </div>

      <div className="changelog-panel__form">
        <Input
          placeholder="Version number (e.g. 2.1.0)"
          value={version}
          onChange={e => setVersion(e.target.value)}
        />
        <Textarea
          placeholder="What changed in this update? (e.g. Fixed crash on settings screen, added dark mode, improved load time by 40%)"
          value={changes}
          onChange={e => setChanges(e.target.value)}
          rows={3}
        />
        <Button
          disabled={!version.trim() || changes.trim().length < 10 || generate.isPending}
          onClick={() => generate.mutate({ context, version: version.trim(), changes: changes.trim() })}
        >
          {generate.isPending ? <LoaderCircle size={13} className="spin" /> : <FileText size={13} />}
          {generate.isPending ? "Generating…" : "Generate release notes"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="changelog-panel__results">
          {results.map(r => (
            <div key={r.platform} className="changelog-result">
              <div className="changelog-result__head">
                <span>{PLATFORM_LABELS[r.platform] ?? r.label}</span>
                <span className="changelog-result__chars">{r.characterCount}/{r.characterLimit}</span>
                <button onClick={() => copy(r.content)}><Clipboard size={11} /></button>
              </div>
              <p className="changelog-result__copy">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
