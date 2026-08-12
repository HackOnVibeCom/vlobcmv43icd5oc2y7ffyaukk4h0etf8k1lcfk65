import { describe, expect, it } from "vitest";
import { faqItems, howItWorks, pricingPlans, privacySections, termsSections } from "@/content/publicSiteContent";

describe("public site content", () => {
  it("describes the three genuine campaign workflow stages", () => {
    expect(howItWorks).toHaveLength(3);
    expect(howItWorks.map((step) => step.title)).toEqual([
      "Give the story a source",
      "Make the launch language specific",
      "Edit, save, and make the campaign visible",
    ]);
  });

  it("keeps guest, free, and Premium access distinct", () => {
    expect(pricingPlans.map((plan) => plan.name)).toEqual(["Guest", "Free member", "Premium"]);
    expect(pricingPlans[0].items.join(" ")).toContain("10 visuals");
    expect(pricingPlans[1].items.join(" ")).toContain("20 visuals");
    expect(pricingPlans[2].items.join(" ")).toContain("Unlimited");
  });

  it("includes customer-facing FAQ and legal-policy coverage", () => {
    expect(faqItems.length).toBeGreaterThanOrEqual(5);
    expect(privacySections.length).toBeGreaterThanOrEqual(5);
    expect(termsSections.length).toBeGreaterThanOrEqual(5);
  });
});
