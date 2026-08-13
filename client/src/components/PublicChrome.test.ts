import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const componentFile = fileURLToPath(new URL("./PublicChrome.tsx", import.meta.url));
const appFile = fileURLToPath(new URL("../App.tsx", import.meta.url));
const stylesheetFile = fileURLToPath(new URL("../pages/home.css", import.meta.url));

const publicDestinations = ["/about", "/how-it-works", "/live-demo", "/pricing", "/faq"];

describe("PublicChrome navigation", () => {
  it("keeps every requested product destination in both desktop and mobile navigation treatments", () => {
    const component = readFileSync(componentFile, "utf8");

    expect(component).toContain('className="pf-nav__product-links"');
    expect(component).toContain('className="pf-nav__mobile-pages"');
    for (const destination of publicDestinations) expect(component).toContain(destination);
  });

  it("registers each header destination and does not reintroduce the obsolete hash-only mobile link rule", () => {
    const app = readFileSync(appFile, "utf8");
    const stylesheet = readFileSync(stylesheetFile, "utf8");

    for (const destination of publicDestinations) expect(app).toContain(`path="${destination}"`);
    expect(stylesheet).toContain(".pf-nav__mobile-pages { display: block;");
    expect(stylesheet).not.toContain('a[href="#live-demo"]');
  });
});
