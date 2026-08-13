import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function BillingPanel() {
  return <aside className="billing-panel"><div><span className="studio__serial">Billing</span><h2>Premium access</h2><p>Unlimited campaign visuals and custom image prompts unlock through PITCHFORGE Premium.</p></div><Button disabled><Clock size={16} /> Payments coming soon</Button><div className="payment-history"><b>Payment history</b><span>Not available yet — payments launch soon.</span></div></aside>;
}
