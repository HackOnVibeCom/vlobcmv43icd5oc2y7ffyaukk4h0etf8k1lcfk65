import { lazy, Suspense, useEffect, useRef, useState } from "react";

const SourceToSurfaceScene = lazy(() => import("./SourceToSurfaceScene"));

function canUseInteractiveScene() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    && window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)").matches;
}

const surfaceLabels = ["SOURCE", "APP STORE", "GOOGLE PLAY", "X", "INSTAGRAM", "LINKEDIN", "PRODUCT HUNT"] as const;

export function SourceToSurfaceStory({ label, scrollLabels = false }: { label: string; scrollLabels?: boolean }) {
  const [canRenderScene, setCanRenderScene] = useState(canUseInteractiveScene);
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
    const updateCapability = () => setCanRenderScene(!reducedMotion.matches && desktopPointer.matches);
    updateCapability();
    reducedMotion.addEventListener("change", updateCapability);
    desktopPointer.addEventListener("change", updateCapability);
    return () => {
      reducedMotion.removeEventListener("change", updateCapability);
      desktopPointer.removeEventListener("change", updateCapability);
    };
  }, []);

  useEffect(() => {
    const element = scene.current;
    if (!element || !scrollLabels || !canRenderScene) return;

    let frame = 0;
    const labels = Array.from(element.querySelectorAll<HTMLElement>(".pf-story-label"));
    const updateLabels = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const rawProgress = (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height * 0.12);
      const progress = Math.min(1, Math.max(0, rawProgress));
      labels.forEach((item, index) => {
        const start = 0.17 + index * 0.085;
        const visibility = Math.min(1, Math.max(0, (progress - start) / 0.16));
        item.style.setProperty("--pf-label-visibility", visibility.toFixed(3));
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateLabels); };

    updateLabels();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [canRenderScene, scrollLabels]);

  return <div ref={scene} className={`pf-story-scene ${scrollLabels ? "pf-story-scene--labeled" : ""}`} data-rendering={canRenderScene} aria-label={label}>
    <div className="pf-story-scene__fallback"><span>ONE SOURCE</span><i>→</i><span>SIX SURFACES</span><small>AS · GP · X · IG · LI · PH</small></div>
    {scrollLabels ? <div className="pf-story-scene__labels" aria-hidden="true">{surfaceLabels.map((surface) => <span className="pf-story-label" key={surface}>{surface}</span>)}</div> : null}
    {canRenderScene ? <Suspense fallback={null}><div className="pf-story-scene__canvas" aria-hidden="true"><SourceToSurfaceScene /></div></Suspense> : null}
  </div>;
}
