import { Crown, Search, ShieldCheck, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import "./manual-premium.css";

export default function ManualPremiumPanel() {
  const me = trpc.auth.me.useQuery();
  const [email, setEmail] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [note, setNote] = useState("");
  const lookup = trpc.admin.findMember.useQuery({ email: lookupEmail || "pending@example.com" }, { enabled: Boolean(lookupEmail), retry: false });
  const change = trpc.admin.setManualPremium.useMutation({ onSuccess: () => { setNote(""); lookup.refetch(); } });
  const member = lookup.data ?? null;

  if (me.data?.role !== "admin") return null;
  const isStripeManaged = Boolean(member?.stripeSubscriptionId);
  const nextAction = member?.plan === "premium" ? "revoke" : "grant";

  return <section className="manual-premium" aria-labelledby="manual-premium-title">
    <div className="manual-premium__header"><div><span><ShieldCheck size={15} /> Owner controls</span><h2 id="manual-premium-title">Manual Premium access</h2><p>Find a registered member by email, then grant or revoke a manually managed Premium entitlement. Paid Stripe subscriptions stay protected from manual revocation.</p></div><Crown aria-hidden="true" size={25} /></div>
    <div className="manual-premium__lookup"><label htmlFor="manual-premium-email">Member email</label><div><input id="manual-premium-email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="member@example.com" /><button type="button" disabled={!email || lookup.isFetching} onClick={() => setLookupEmail(email.trim().toLowerCase())}><Search size={15} /> {lookup.isFetching ? "Finding…" : "Find member"}</button></div>{lookup.isError && <p className="manual-premium__error">{lookup.error.message}</p>}</div>
    {member && <div className="manual-premium__member"><div className="manual-premium__identity"><UserRoundCheck size={18} /><div><strong>{member.name || "Unnamed member"}</strong><span>{member.email || "No email available"}</span></div></div><div className="manual-premium__status"><span>Current plan</span><b className={member.plan === "premium" ? "is-premium" : ""}>{member.plan === "premium" ? "Premium" : "Free"}</b></div>{isStripeManaged && <p className="manual-premium__stripe">This Premium access is tied to an active Stripe subscription and cannot be manually revoked here.</p>}<label className="manual-premium__note" htmlFor="manual-premium-note">Internal note <small>Optional, saved to the entitlement audit record</small><textarea id="manual-premium-note" value={note} onChange={event => setNote(event.target.value)} maxLength={280} placeholder="Why is this access being changed?" /></label><button type="button" className={nextAction === "grant" ? "manual-premium__grant" : "manual-premium__revoke"} disabled={change.isPending || (nextAction === "revoke" && isStripeManaged)} onClick={() => change.mutate({ targetUserId: member.id, action: nextAction, note: note || undefined })}>{change.isPending ? "Saving access…" : nextAction === "grant" ? "Grant manual Premium" : "Revoke manual Premium"}</button>{change.isError && <p className="manual-premium__error">{change.error.message}</p>}</div>}
  </section>;
}
