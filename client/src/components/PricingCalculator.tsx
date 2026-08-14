import { useState } from "react";
import { Calculator } from "lucide-react";

const PLATFORM_COUNT = 6;
const IMAGE_PRICE_PER = 0.04; // rough cost basis per image at scale
const COPY_PRICE_PER = 0.008; // per platform copy generation

type Plan = "guest" | "free" | "premium";

function estimateCost(appsPerMonth: number, imagesPerApp: number, plan: Plan): { monthly: number; perApp: number; savings: number } {
  const totalCopy = appsPerMonth * PLATFORM_COUNT;
  const totalImages = appsPerMonth * imagesPerApp;
  const rawCost = totalCopy * COPY_PRICE_PER + totalImages * IMAGE_PRICE_PER;

  const planPrice = plan === "premium" ? 19 : 0;
  const monthly = Math.max(planPrice, rawCost > 0 ? rawCost : 0);
  const perApp = appsPerMonth > 0 ? monthly / appsPerMonth : 0;
  const savings = plan !== "guest" ? Math.max(0, rawCost - planPrice) : 0;

  return { monthly, perApp, savings };
}

export default function PricingCalculator() {
  const [apps, setApps] = useState(2);
  const [images, setImages] = useState(3);
  const [plan, setPlan] = useState<Plan>("free");

  const { monthly, perApp, savings } = estimateCost(apps, images, plan);

  return (
    <div className="pricing-calc">
      <div className="pricing-calc__head">
        <Calculator size={16} />
        <span>Estimate your cost</span>
      </div>

      <div className="pricing-calc__controls">
        <label>
          <span>Apps launched per month</span>
          <div className="calc-slider-row">
            <input type="range" min={1} max={20} value={apps} onChange={e => setApps(Number(e.target.value))} />
            <b>{apps}</b>
          </div>
        </label>
        <label>
          <span>Campaign images per app</span>
          <div className="calc-slider-row">
            <input type="range" min={0} max={10} value={images} onChange={e => setImages(Number(e.target.value))} />
            <b>{images}</b>
          </div>
        </label>
        <div className="calc-plan-row">
          <span>Plan</span>
          <div className="calc-plan-tabs">
            {(["guest", "free", "premium"] as Plan[]).map(p => (
              <button key={p} className={plan === p ? "is-active" : ""} onClick={() => setPlan(p)}>
                {p === "guest" ? "Guest" : p === "free" ? "Free member" : "Premium"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pricing-calc__result">
        <div className="calc-result-row">
          <span>Estimated monthly</span>
          <b className="calc-price">{plan === "free" && monthly === 0 ? "Free" : `$${monthly.toFixed(2)}`}</b>
        </div>
        <div className="calc-result-row">
          <span>Cost per app launch</span>
          <b>{perApp > 0 ? `$${perApp.toFixed(2)}` : "—"}</b>
        </div>
        {plan === "premium" && savings > 0 && (
          <div className="calc-result-row calc-result-row--saving">
            <span>vs. pay-per-use</span>
            <b>Save ${savings.toFixed(2)}/mo</b>
          </div>
        )}
        <p className="calc-note">
          {PLATFORM_COUNT} platform posts per app · {apps * PLATFORM_COUNT} total posts/mo · {apps * images} images/mo.
          {plan === "free" && apps <= 3 && images <= 5 ? " Free tier covers this usage." : ""}
        </p>
      </div>
    </div>
  );
}
