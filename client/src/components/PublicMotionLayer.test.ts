import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const motionLayerFile = fileURLToPath(new URL("./PublicMotionLayer.tsx", import.meta.url));
const overlayFile = fileURLToPath(new URL("./HeroMotionOverlay.tsx", import.meta.url));
const sceneFile = fileURLToPath(new URL("./CampaignDeskScene.tsx", import.meta.url));
const routeMotionFile = fileURLToPath(new URL("./PublicRouteMotion.tsx", import.meta.url));
const storyFile = fileURLToPath(new URL("./SourceToSurfaceStory.tsx", import.meta.url));
const storySceneFile = fileURLToPath(new URL("./SourceToSurfaceScene.tsx", import.meta.url));
const chromeFile = fileURLToPath(new URL("./PublicChrome.tsx", import.meta.url));
const homeFile = fileURLToPath(new URL("../pages/Home.tsx", import.meta.url));
const publicPagesFile = fileURLToPath(new URL("../pages/PublicPages.tsx", import.meta.url));
const stylesheetFile = fileURLToPath(new URL("../pages/home.css", import.meta.url));

describe("public motion system", () => {
  it("uses a disposable Lenis controller only when motion and input capabilities allow it", () => {
    const source = readFileSync(motionLayerFile, "utf8");

    expect(source).toContain('import Lenis from "lenis"');
    expect(source).toContain('"(prefers-reduced-motion: reduce)"');
    expect(source).toContain('"(pointer: coarse)"');
    expect(source).toContain("lenis.destroy()");
  });

  it("keeps the authored desktop hero treatment gated behind fine-pointer and reduced-motion checks", () => {
    const overlay = readFileSync(overlayFile, "utf8");
    const home = readFileSync(homeFile, "utf8");
    const stylesheet = readFileSync(stylesheetFile, "utf8");

    expect(overlay).toContain('lazy(() => import("./CampaignDeskScene"))');
    expect(overlay).toContain('"(min-width: 900px) and (hover: hover) and (pointer: fine)"');
    expect(overlay).toContain('className="pf-hero__pointer"');
    expect(home).toContain("<HeroMotionOverlay targetRef={heroVisual} scrollTargetRef={heroSection} />");
    expect(stylesheet).toContain(".pf-hero__three, .pf-hero__pointer, .pf-hero__spark-field, .pf-hero__atmosphere, .pf-hero__scroll-cue { display: none; }");
  });

  it("uses a live Three.js collage with bounded visual cost rather than a generic shader background", () => {
    const scene = readFileSync(sceneFile, "utf8");

    expect(scene).toContain('from "@react-three/fiber"');
    expect(scene).toContain('from "@react-three/drei"');
    expect(scene).toContain("MathUtils.damp");
    expect(scene).toContain("<ContactShadows");
    expect(scene).toContain('dpr={[1, 1.5]}');
    expect(scene).toContain("scrollProgress");
    expect(scene).toContain("materials.current.rotation.z");
    expect(scene).toContain("orbit.current.rotation.z");
  });

  it("links hero scroll position to the 3D composition and preserves a non-animated fallback", () => {
    const overlay = readFileSync(overlayFile, "utf8");
    const stylesheet = readFileSync(stylesheetFile, "utf8");

    expect(overlay).toContain('window.addEventListener("scroll", onScroll');
    expect(overlay).toContain('style.setProperty("--pf-hero-scroll"');
    expect(overlay).toContain("IntersectionObserver");
    expect(stylesheet).toContain(".pf-hero--immersive .pf-hero__visual");
    expect(stylesheet).toContain(".pf-hero__scroll-cue");
    expect(stylesheet).toContain(".pf-hero--immersive .pf-hero__copy, .pf-hero--immersive .pf-hero__visual");
  });

  it("emits a bounded pointer-spark trail only inside the capability-gated hero treatment", () => {
    const overlay = readFileSync(overlayFile, "utf8");
    const stylesheet = readFileSync(stylesheetFile, "utf8");

    expect(overlay).toContain('const spark = document.createElement("span")');
    expect(overlay).toContain("event.timeStamp - lastSparkAt > 56");
    expect(overlay).toContain("window.setTimeout(() => spark.remove(), 560)");
    expect(overlay).toContain('className="pf-hero__spark-field"');
    expect(stylesheet).toContain("@keyframes pf-hero-spark");
    expect(stylesheet).toContain(".pf-hero__spark { position: absolute;");
  });

  it("gives all public pages a shared route arrival and in-view reveal path that retains a reduced-motion alternative", () => {
    const routeMotion = readFileSync(routeMotionFile, "utf8");
    const chrome = readFileSync(chromeFile, "utf8");
    const publicPages = readFileSync(publicPagesFile, "utf8");
    const stylesheet = readFileSync(stylesheetFile, "utf8");

    expect(routeMotion).toContain('className={`pf-route-motion pf-route-motion--${phase}`}');
    expect(routeMotion).toContain("IntersectionObserver");
    expect(routeMotion).toContain('"(prefers-reduced-motion: reduce)"');
    expect(chrome).toContain("<PublicRouteTransition>{children}</PublicRouteTransition>");
    expect(publicPages).toContain("<PublicReveal>");
    expect(stylesheet).toContain(".pf-route-motion--prepare, .pf-reveal[data-reveal=\"prepare\"]");
  });

  it("keeps the secondary 3D story focused on the source-to-six-surfaces mechanism and falls back on compact layouts", () => {
    const story = readFileSync(storyFile, "utf8");
    const scene = readFileSync(storySceneFile, "utf8");
    const publicPages = readFileSync(publicPagesFile, "utf8");
    const stylesheet = readFileSync(stylesheetFile, "utf8");

    expect(story).toContain('lazy(() => import("./SourceToSurfaceScene"))');
    expect(story).toContain("ONE SOURCE");
    expect(scene).toContain("surfaceTiles");
    expect(scene).toContain("MathUtils.damp");
    expect(publicPages).toContain("<SourceToSurfaceStory");
    expect(stylesheet).toContain(".pf-story-scene__canvas { display: none; }");
  });

  it("progressively reveals the About-page source and six destination labels from scroll position", () => {
    const story = readFileSync(storyFile, "utf8");
    const publicPages = readFileSync(publicPagesFile, "utf8");
    const stylesheet = readFileSync(stylesheetFile, "utf8");

    expect(story).toContain('window.addEventListener("scroll", onScroll');
    expect(story).toContain('style.setProperty("--pf-label-visibility"');
    expect(story).toContain('const surfaceLabels = ["SOURCE", "APP STORE", "GOOGLE PLAY", "X", "INSTAGRAM", "LINKEDIN", "PRODUCT HUNT"]');
    expect(publicPages).toContain("scrollLabels");
    expect(stylesheet).toContain(".pf-story-label { position: absolute;");
    expect(stylesheet).toContain(".pf-story-scene__fallback small { display: block;");
  });
});
