import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Globe, LoaderCircle, Copy, ExternalLink } from "lucide-react";

export default function MicrositeButton({ campaignId }: { campaignId: number }) {
  const [slug, setSlug] = useState<string | null>(null);

  const publish = trpc.campaigns.publishMicrosite.useMutation({
    onSuccess: (site) => {
      setSlug(site.slug);
      toast.success("Public campaign page created.");
    },
    onError: (e) => toast.error(e.message),
  });

  const url = slug ? `${window.location.origin}/c/${slug}` : null;

  if (url) {
    return (
      <div className="microsite-ready">
        <Globe size={13} />
        <a href={url} target="_blank" rel="noopener noreferrer" className="microsite-url">
          {url.replace(window.location.origin, "")}
          <ExternalLink size={11} />
        </a>
        <button
          className="microsite-copy"
          onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied."); }}
        >
          <Copy size={12} />
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={publish.isPending}
      onClick={() => publish.mutate({ campaignId })}
    >
      {publish.isPending ? <LoaderCircle size={13} className="spin" /> : <Globe size={13} />}
      Share campaign page
    </Button>
  );
}
