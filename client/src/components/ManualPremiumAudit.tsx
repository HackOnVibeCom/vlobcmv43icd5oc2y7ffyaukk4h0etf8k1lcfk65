import { Download, FileSearch, Search, ShieldCheck, UsersRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { trpc } from "@/lib/trpc";
import "./manual-premium-audit.css";

type AuditRecord = {
  id: number;
  targetName: string | null;
  targetEmail: string | null;
  action: "grant" | "revoke";
  note: string | null;
  performedByName: string | null;
  performedByEmail: string | null;
  createdAt: Date;
};

function csvCell(value: string | number | Date | null | undefined) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadAuditCsv(events: AuditRecord[]) {
  const header = ["Event ID", "Action", "Member name", "Member email", "Performed by", "Performer email", "Internal note", "Recorded at"];
  const body = events.map(event => [event.id, event.action, event.targetName, event.targetEmail, event.performedByName, event.performedByEmail, event.note, event.createdAt].map(csvCell).join(","));
  const blob = new Blob([[header.map(csvCell).join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pitchforge-manual-premium-audit.csv";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ManualPremiumAudit() {
  const me = trpc.auth.me.useQuery();
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const audit = trpc.admin.manualPremiumAudit.useQuery({ search }, { enabled: me.data?.role === "admin" });
  const exportAudit = trpc.admin.manualPremiumAuditExport.useQuery({ search }, { enabled: false, retry: false });

  if (me.data?.role !== "admin") return null;
  const submitSearch = (event: FormEvent) => { event.preventDefault(); setSearch(draft.trim()); };
  const exportCsv = async () => {
    const result = await exportAudit.refetch();
    if (result.data) downloadAuditCsv(result.data.events as AuditRecord[]);
  };
  const members = audit.data?.members ?? [];
  const events = audit.data?.events ?? [];

  return <section className="manual-audit" aria-labelledby="manual-audit-title">
    <header className="manual-audit__header"><div><span><ShieldCheck size={15} /> Owner audit desk</span><h2 id="manual-audit-title">Manual Premium ledger</h2><p>Review the members currently on manually managed Premium access and keep a clean export of every grant or revoke event.</p></div><FileSearch aria-hidden="true" size={26} /></header>
    <form className="manual-audit__tools" onSubmit={submitSearch}><label htmlFor="manual-audit-search">Search member, owner, note, or action</label><div><input id="manual-audit-search" value={draft} onChange={event => setDraft(event.target.value)} placeholder="e.g. member@example.com" /><button type="submit"><Search size={15} /> Search</button><button type="button" className="manual-audit__export" disabled={exportAudit.isFetching} onClick={exportCsv}><Download size={15} /> {exportAudit.isFetching ? "Preparing…" : "Export CSV"}</button></div>{audit.isError && <p className="manual-audit__error">{audit.error.message}</p>}{exportAudit.isError && <p className="manual-audit__error">{exportAudit.error.message}</p>}</form>
    <div className="manual-audit__summary"><div><UsersRound size={17} /><span>Current manual Premium</span><strong>{members.length}</strong></div><div><FileSearch size={17} /><span>Audit events in view</span><strong>{events.length}</strong></div></div>
    <div className="manual-audit__section"><div className="manual-audit__section-title"><h3>Members with manual Premium</h3><span>Current access only</span></div>{audit.isLoading ? <div className="manual-audit__skeleton" aria-label="Loading manually managed Premium members" /> : members.length ? <div className="manual-audit__table-wrap"><table><thead><tr><th>Member</th><th>Granted by</th><th>Last recorded</th><th>Note</th></tr></thead><tbody>{members.map(member => <tr key={member.id}><td><strong>{member.targetName || "Unnamed member"}</strong><small>{member.targetEmail || "No email available"}</small></td><td>{member.performedByName || member.performedByEmail || "Unavailable"}</td><td>{formatDate(member.createdAt)}</td><td>{member.note || "—"}</td></tr>)}</tbody></table></div> : <p className="manual-audit__empty">No manually managed Premium members match this view.</p>}</div>
    <div className="manual-audit__section manual-audit__events"><div className="manual-audit__section-title"><h3>Entitlement history</h3><span>Newest event first</span></div>{audit.isLoading ? <div className="manual-audit__skeleton" aria-label="Loading manual Premium audit history" /> : events.length ? <div className="manual-audit__events-list">{events.map(event => <article key={event.id} className="manual-audit__event"><b className={event.action === "grant" ? "is-grant" : "is-revoke"}>{event.action === "grant" ? "Granted" : "Revoked"}</b><div><strong>{event.targetName || event.targetEmail || "Unknown member"}</strong><span>{event.targetEmail && event.targetName ? event.targetEmail : ""}</span></div><p>{event.note || "No internal note"}</p><time dateTime={new Date(event.createdAt).toISOString()}>{formatDate(event.createdAt)} by {event.performedByName || event.performedByEmail || "Unknown owner"}</time></article>)}</div> : <p className="manual-audit__empty">No manual entitlement events match this view.</p>}</div>
  </section>;
}
