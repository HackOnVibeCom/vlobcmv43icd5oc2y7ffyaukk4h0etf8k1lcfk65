import DashboardLayout from "@/components/DashboardLayout";
import BillingPanel from "@/components/BillingPanel";
import CampaignReview from "@/components/CampaignReview";
import GeneratorStudio from "@/components/GeneratorStudio";
import ManualPremiumPanel from "@/components/ManualPremiumPanel";
import ManualPremiumAudit from "@/components/ManualPremiumAudit";
import { trpc } from "@/lib/trpc";
import { useLocation, useSearch } from "wouter";

export default function Workspace() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const rawCampaignId = new URLSearchParams(search).get("campaign");
  const campaignId = rawCampaignId ? Number(rawCampaignId) : null;
  const selected = trpc.campaigns.get.useQuery({ campaignId: campaignId ?? 0 }, { enabled: Boolean(campaignId) });

  return <DashboardLayout>{campaignId ? <>{selected.isLoading && <div className="workspace-review-loading">Loading saved campaign…</div>}{selected.data && <CampaignReview campaign={selected.data} onClose={() => setLocation("/workspace")} />}{selected.isError && <div className="workspace-review-loading">This campaign is unavailable or you no longer have access to it.</div>}</> : <><GeneratorStudio embedded /><BillingPanel /><ManualPremiumPanel /><ManualPremiumAudit /></>}</DashboardLayout>;
}
