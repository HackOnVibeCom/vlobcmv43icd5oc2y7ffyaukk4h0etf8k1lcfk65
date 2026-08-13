import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from "react";

const CampaignDeskScene = lazy(() => import("./CampaignDeskScene"));

type HeroMotionOverlayProps = {
  targetRef: RefObject<HTMLElement | null>;
  scrollTargetRef: RefObject<HTMLElement | null>;
};

function canUseImmersiveScene() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    && window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)").matches;
}

export function HeroMotionOverlay({ targetRef, scrollTargetRef }: HeroMotionOverlayProps) {
  const pointerReveal = useRef<HTMLDivElement>(null);
  const sparkField = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const [canRenderScene, setCanRenderScene] = useState(canUseImmersiveScene);
  const [heroActive, setHeroActive] = useState(true);
  const [pointerActive, setPointerActive] = useState(false);

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
    const target = scrollTargetRef.current;
    const motionEligible = canUseImmersiveScene();
    if (!target || !motionEligible) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = target.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(1, bounds.height * 0.76)));
      scrollProgress.current = progress;
      target.style.setProperty("--pf-hero-scroll", progress.toFixed(3));
      target.style.setProperty("--pf-hero-copy-y", `${Math.round(progress * -28)}px`);
      target.style.setProperty("--pf-hero-visual-y", `${Math.round(progress * -54)}px`);
      target.style.setProperty("--pf-hero-visual-rotate", `${(progress * 3).toFixed(2)}deg`);
      target.style.setProperty("--pf-hero-visual-scale", (1 - progress * 0.05).toFixed(3));
      target.style.setProperty("--pf-hero-atmosphere-y", `${Math.round(progress * -74)}px`);
      target.style.setProperty("--pf-hero-atmosphere-rotate", `${(progress * 9).toFixed(2)}deg`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => setHeroActive(entry.isIntersecting), { threshold: 0.04 });

    update();
    observer.observe(target);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      target.style.removeProperty("--pf-hero-scroll");
      target.style.removeProperty("--pf-hero-copy-y");
      target.style.removeProperty("--pf-hero-visual-y");
      target.style.removeProperty("--pf-hero-visual-rotate");
      target.style.removeProperty("--pf-hero-visual-scale");
      target.style.removeProperty("--pf-hero-atmosphere-y");
      target.style.removeProperty("--pf-hero-atmosphere-rotate");
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scrollTargetRef]);

  useEffect(() => {
    const target = targetRef.current;
    const reveal = pointerReveal.current;
    const field = sparkField.current;
    const eligible = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!target || !reveal || !field || !eligible.matches || reducedMotion.matches) return;

    let frame = 0;
    let currentX = -120;
    let currentY = -120;
    let nextX = -120;
    let nextY = -120;
    let lastSparkAt = 0;
    let sparkIndex = 0;

    const render = () => {
      currentX += (nextX - currentX) * 0.18;
      currentY += (nextY - currentY) * 0.18;
      reveal.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      if (Math.abs(nextX - currentX) > 0.2 || Math.abs(nextY - currentY) > 0.2) frame = requestAnimationFrame(render);
      else frame = 0;
    };

    const burstSpark = (x: number, y: number) => {
      const spark = document.createElement("span");
      const angle = (sparkIndex * 137.5 + Math.random() * 42) * (Math.PI / 180);
      const distance = 18 + (sparkIndex % 4) * 7;
      const colors = ["#dc143c", "#2454d7", "#f5f1e8"];
      sparkIndex += 1;
      spark.className = "pf-hero__spark";
      spark.style.setProperty("--pf-spark-x", `${x}px`);
      spark.style.setProperty("--pf-spark-y", `${y}px`);
      spark.style.setProperty("--pf-spark-dx", `${Math.cos(angle) * distance}px`);
      spark.style.setProperty("--pf-spark-dy", `${Math.sin(angle) * distance}px`);
      spark.style.setProperty("--pf-spark-color", colors[sparkIndex % colors.length]);
      field.appendChild(spark);
      window.setTimeout(() => spark.remove(), 560);
    };

    const move = (event: PointerEvent) => {
      const bounds = target.getBoundingClientRect();
      nextX = event.clientX - bounds.left;
      nextY = event.clientY - bounds.top;
      if (event.timeStamp - lastSparkAt > 56) {
        burstSpark(nextX, nextY);
        lastSparkAt = event.timeStamp;
      }
      if (!frame) frame = requestAnimationFrame(render);
    };
    const enter = () => setPointerActive(true);
    const leave = () => setPointerActive(false);

    target.addEventListener("pointermove", move);
    target.addEventListener("pointerenter", enter);
    target.addEventListener("pointerleave", leave);
    return () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerenter", enter);
      target.removeEventListener("pointerleave", leave);
      field.replaceChildren();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetRef]);

  return <>
    <div className="pf-hero__three" aria-hidden="true">{canRenderScene && heroActive ? <Suspense fallback={null}><CampaignDeskScene scrollProgress={scrollProgress} /></Suspense> : null}</div>
    <div ref={sparkField} className="pf-hero__spark-field" aria-hidden="true" />
    <div className="pf-hero__atmosphere" aria-hidden="true"><span /><span /><span /></div>
    <div ref={pointerReveal} className="pf-hero__pointer" data-active={pointerActive} aria-hidden="true"><span>MOVE<br />THE<br />STORY</span></div>
    <div className="pf-hero__scroll-cue" aria-hidden="true"><span>SCROLL TO SHIFT</span><i /></div>
  </>;
}
