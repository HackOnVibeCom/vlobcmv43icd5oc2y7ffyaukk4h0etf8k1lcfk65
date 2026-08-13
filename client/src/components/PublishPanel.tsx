import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LoaderCircle, Send, Plus, Trash2, CheckCircle, Zap } from "lucide-react";

type Platform = "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";

export default function PublishPanel({ campaignId, platform }: { campaignId: number; platform: Platform }) {
  const [showConnect, setShowConnect] = useState(false);
  const [label, setLabel] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const utils = trpc.useUtils();

  const connections = trpc.publish.listConnections.useQuery();
  const connect = trpc.publish.connectDiscord.useMutation({
    onSuccess: () => {
      toast.success("Discord channel connected.");
      utils.publish.listConnections.invalidate();
      setLabel(""); setWebhookUrl(""); setShowConnect(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const disconnect = trpc.publish.disconnect.useMutation({
    onSuccess: () => { toast.success("Channel disconnected."); utils.publish.listConnections.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const publishNow = trpc.publish.publishNow.useMutation({
    onSuccess: () => toast.success("Posted to Discord."),
    onError: (e) => toast.error(e.message),
  });

  const active = connections.data?.filter(c => c.isActive === "true") ?? [];

  return (
    <div className="publish-panel">
      <div className="publish-panel__head">
        <Zap size={13} />
        <span>Auto-publish</span>
      </div>

      {active.length === 0 && !showConnect && (
        <button className="publish-connect-cta" onClick={() => setShowConnect(true)}>
          <Plus size={13} /> Connect Discord to publish this post
        </button>
      )}

      {active.map(conn => (
        <div key={conn.id} className="publish-connection">
          <span className="publish-connection__label">{conn.label}</span>
          <div className="publish-connection__actions">
            <Button
              size="sm"
              disabled={publishNow.isPending}
              onClick={() => publishNow.mutate({ campaignId, platform, connectionId: conn.id })}
            >
              {publishNow.isPending ? <LoaderCircle size={12} className="spin" /> : <Send size={12} />}
              Post now
            </Button>
            <button className="publish-remove" onClick={() => disconnect.mutate({ connectionId: conn.id })}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}

      {active.length > 0 && (
        <button className="publish-add-channel" onClick={() => setShowConnect(v => !v)}>
          <Plus size={12} /> Add channel
        </button>
      )}

      {showConnect && (
        <div className="publish-connect-form">
          <Input
            placeholder="Channel label (e.g. #app-launches)"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
          <Input
            placeholder="Discord webhook URL"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
          />
          <div className="publish-connect-form__actions">
            <Button
              size="sm"
              disabled={connect.isPending || !label.trim() || !webhookUrl.trim()}
              onClick={() => connect.mutate({ label: label.trim(), webhookUrl: webhookUrl.trim() })}
            >
              {connect.isPending ? <LoaderCircle size={12} className="spin" /> : <CheckCircle size={12} />}
              Connect
            </Button>
            <button className="publish-cancel" onClick={() => setShowConnect(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
