import { SignUpButton } from "@clerk/react";
import { ArrowUpRight, BarChart2, CheckCircle, Sparkles } from "lucide-react";

type Props = {
  platformCount: number;
  topScore?: { grade: string; total: number; maxTotal: number } | null;
  checklistPassed?: number;
};

export default function GuestSummaryCard({ platformCount, topScore, checklistPassed }: Props) {
  if (platformCount === 0) return null;

  return (
    <div className="guest-summary">
      <div className="guest-summary__stats">
        <div className="guest-summary__stat">
          <Sparkles size={14} />
          <span><b>{platformCount}</b> platforms generated</span>
        </div>
        {topScore && (
          <div className="guest-summary__stat">
            <BarChart2 size={14} />
            <span>ASO grade <b>{topScore.grade}</b> ({topScore.total}/{topScore.maxTotal} pts)</span>
          </div>
        )}
        {checklistPassed !== undefined && (
          <div className="guest-summary__stat">
            <CheckCircle size={14} />
            <span><b>{checklistPassed}/10</b> launch checks passed</span>
          </div>
        )}
      </div>
      <div className="guest-summary__cta">
        <p>Sign up free to save campaigns, track history, publish to Discord, and generate 20 images/month.</p>
        <SignUpButton mode="modal">
          <button className="guest-summary__btn">
            Create free account <ArrowUpRight size={13} />
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}
