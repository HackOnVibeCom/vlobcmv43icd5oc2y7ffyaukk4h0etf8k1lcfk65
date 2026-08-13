import { SignInButton, UserButton, useAuth, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Archive, ArrowUpRight, Menu, Plus, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const history = trpc.campaigns.list.useQuery(undefined, { enabled: Boolean(isSignedIn) });

  if (!isLoaded) return <main className="workspace-auth-gate"><span className="studio__serial">Checking secure workspace</span><h1>Loading your PITCHFORGE access.</h1><p>We are confirming your account before opening saved campaigns and image-generation controls.</p></main>;
  if (!isSignedIn) {
    return <main className="workspace-auth-gate"><span className="studio__serial">Members-only workspace</span><h1>Save the launch work worth keeping.</h1><p>Sign in to store campaigns, revisit every platform version, and use your image-generation allowance.</p><SignInButton mode="modal"><Button>Sign in to PITCHFORGE</Button></SignInButton></main>;
  }

  return (
    <div className="workspace-frame">
      <aside className="workspace-nav">
        <button className="workspace-brand" onClick={() => setLocation("/")}><span>PF</span><b>PITCHFORGE</b></button>
        <Button className="workspace-new" onClick={() => setLocation("/workspace")}><Plus size={16} /> New campaign</Button>
        <div className="workspace-nav__label"><Archive size={14} /> Saved campaigns</div>
        <nav className="campaign-history" aria-label="Saved campaigns">
          {history.isLoading && <span className="quiet-state">Loading your campaigns…</span>}
          {!history.isLoading && history.data?.length === 0 && <span className="quiet-state">Your saved campaigns will live here.</span>}
          {history.data?.slice(0, 9).map(item => <button key={item.id} onClick={() => setLocation(`/workspace?campaign=${item.id}`)}><span>{item.name}</span><small>{new Date(item.updatedAt).toLocaleDateString()}</small></button>)}
        </nav>
        <div className="workspace-nav__footer">
          <div className="profile-name"><span>{user?.firstName?.slice(0, 1) ?? "P"}</span><div><b>{user?.fullName ?? "PITCHFORGE member"}</b><small>Free image allowance</small></div></div>
          <UserButton />
        </div>
      </aside>
      <header className="workspace-mobile"><button onClick={() => document.querySelector(".workspace-nav")?.classList.toggle("is-open")}><Menu size={19} /></button><span>PITCHFORGE</span><UserButton /></header>
      <main className="workspace-main">
        <div className="workspace-heading"><div><span className="studio__serial">Your campaign desk</span><h1>Make the app impossible to overlook.</h1></div><Button variant="outline" onClick={() => setLocation("/")}>View public studio <ArrowUpRight size={15} /></Button></div>
        {children}
      </main>
    </div>
  );
}
