import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle,
  Globe,
  LoaderCircle,
  MessageSquare,
  Plus,
  Radio,
  Send,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

type Platform = "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";
type PublishKind = "discord" | "slack" | "telegram" | "webhook";

const KIND_META: Record<PublishKind, { label: string; icon: string; placeholder: string; hint: string }> = {
  discord: {
    label: "Discord Webhook",
    icon: "👾",
    placeholder: "https://discord.com/api/webhooks/...",
    hint: "From Channel Settings → Integrations → Webhooks",
  },
  slack: {
    label: "Slack Incoming Webhook",
    icon: "💬",
    placeholder: "https://hooks.slack.com/services/...",
    hint: "From Slack App Directory → Incoming Webhooks",
  },
  telegram: {
    label: "Telegram Bot / Channel",
    icon: "✈️",
    placeholder: "https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>",
    hint: "Paste bot sendMessage URL with chat_id",
  },
  webhook: {
    label: "Custom / Zapier / Make.com",
    icon: "⚡",
    placeholder: "https://hook.eu1.make.com/... or Zapier Catch Hook",
    hint: "Receives JSON payload with full copy & metadata",
  },
};

export default function PublishPanel({
  campaignId,
  platform,
  content,
  appName = "Your App",
}: {
  campaignId?: number;
  platform: Platform;
  content?: string;
  appName?: string;
}) {
  const [showConnect, setShowConnect] = useState(false);
  const [selectedKind, setSelectedKind] = useState<PublishKind>("discord");
  const [label, setLabel] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const utils = trpc.useUtils();

  const connections = trpc.publish.listConnections.useQuery(undefined, {
    enabled: !!campaignId,
  });

  const connect = trpc.publish.connectChannel.useMutation({
    onSuccess: () => {
      toast.success(`${KIND_META[selectedKind].label} connected successfully.`);
      utils.publish.listConnections.invalidate();
      setLabel("");
      setWebhookUrl("");
      setShowConnect(false);
    },
    onError: e => toast.error(e.message),
  });

  const disconnect = trpc.publish.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Channel disconnected.");
      utils.publish.listConnections.invalidate();
    },
    onError: e => toast.error(e.message),
  });

  const publishNow = trpc.publish.publishNow.useMutation({
    onSuccess: () => toast.success("Auto-published successfully!"),
    onError: e => toast.error(e.message),
  });

  const publishToAll = trpc.publish.publishToAll.useMutation({
    onSuccess: data => {
      toast.success(`Dispatched to ${data.successful} destination${data.successful > 1 ? "s" : ""}!`);
    },
    onError: e => toast.error(e.message),
  });

  const testWebhook = trpc.publish.testWebhook.useMutation({
    onSuccess: () => toast.success("Webhook connection test verified 100%!"),
    onError: e => toast.error(e.message),
  });

  const active = connections.data?.filter(c => c.isActive === "true") ?? [];

  // Guest simulation test
  const handleSimulateDispatch = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      toast.success(`[Simulation Verified] Dispatched ${platform} launch copy to live feed queue!`);
    }, 900);
  };

  return (
    <div className="publish-panel">
      <div className="publish-panel__head">
        <Zap size={13} />
        <span>Multi-Channel Auto-Publish Hub</span>
        {active.length > 1 && campaignId && (
          <Button
            size="sm"
            variant="outline"
            style={{ marginLeft: "auto", fontSize: "0.75rem", height: "24px" }}
            disabled={publishToAll.isPending}
            onClick={() => publishToAll.mutate({ campaignId, platform })}
          >
            <Radio size={11} /> Broadcast to all ({active.length})
          </Button>
        )}
      </div>

      {active.length === 0 && !showConnect && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button className="publish-connect-cta" onClick={() => setShowConnect(true)}>
            <Plus size={13} /> Connect Discord, Slack, Telegram, or Webhook
          </button>
          {!campaignId && (
            <Button size="sm" variant="secondary" onClick={handleSimulateDispatch} disabled={isSimulating}>
              {isSimulating ? <LoaderCircle size={12} className="spin" /> : <Sparkles size={12} />}
              Test Instant Broadcast (Live Simulation)
            </Button>
          )}
        </div>
      )}

      {active.map(conn => {
        const kind = (conn.kind as PublishKind) || "discord";
        const meta = KIND_META[kind] || KIND_META.discord;
        return (
          <div key={conn.id} className="publish-connection">
            <span className="publish-connection__label">
              <span style={{ marginRight: 6 }}>{meta.icon}</span>
              {conn.label}
            </span>
            <div className="publish-connection__actions">
              {campaignId && (
                <Button
                  size="sm"
                  disabled={publishNow.isPending}
                  onClick={() => publishNow.mutate({ campaignId, platform, connectionId: conn.id })}
                >
                  {publishNow.isPending ? <LoaderCircle size={12} className="spin" /> : <Send size={12} />}
                  Post now
                </Button>
              )}
              <button
                className="publish-remove"
                title="Disconnect channel"
                onClick={() => disconnect.mutate({ connectionId: conn.id })}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        );
      })}

      {active.length > 0 && (
        <button className="publish-add-channel" onClick={() => setShowConnect(v => !v)}>
          <Plus size={12} /> Add another channel
        </button>
      )}

      {showConnect && (
        <div className="publish-connect-form" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
            {(Object.keys(KIND_META) as PublishKind[]).map(k => (
              <button
                key={k}
                type="button"
                className={`mockup-tab-btn ${selectedKind === k ? "is-active" : ""}`}
                style={{ fontSize: "0.78rem", padding: "0.35rem 0.5rem" }}
                onClick={() => setSelectedKind(k)}
              >
                <span>{KIND_META[k].icon}</span> {KIND_META[k].label.split(" ")[0]}
              </button>
            ))}
          </div>

          <Input
            placeholder="Channel label (e.g. #announcements or Production Alerts)"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />

          <Input
            placeholder={KIND_META[selectedKind].placeholder}
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
          />

          <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
            {KIND_META[selectedKind].hint}
          </small>

          <div className="publish-connect-form__actions">
            <Button
              size="sm"
              disabled={connect.isPending || !label.trim() || !webhookUrl.trim()}
              onClick={() =>
                connect.mutate({
                  kind: selectedKind,
                  label: label.trim(),
                  webhookUrl: webhookUrl.trim(),
                })
              }
            >
              {connect.isPending ? <LoaderCircle size={12} className="spin" /> : <CheckCircle size={12} />}
              Connect Channel
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={testWebhook.isPending || !webhookUrl.trim()}
              onClick={() =>
                testWebhook.mutate({
                  kind: selectedKind,
                  webhookUrl: webhookUrl.trim(),
                  appName,
                })
              }
            >
              {testWebhook.isPending ? <LoaderCircle size={12} className="spin" /> : <Send size={12} />}
              Test URL
            </Button>

            <button className="publish-cancel" onClick={() => setShowConnect(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
