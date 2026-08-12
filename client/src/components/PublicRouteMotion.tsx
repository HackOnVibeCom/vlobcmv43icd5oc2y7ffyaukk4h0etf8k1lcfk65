import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function PublicRouteTransition({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"idle" | "prepare" | "entered">("idle");

  useEffect(() => {
    const prepare = requestAnimationFrame(() => {
      setPhase("prepare");
      requestAnimationFrame(() => setPhase("entered"));
    });
    return () => cancelAnimationFrame(prepare);
  }, []);

  return <div className={`pf-route-motion pf-route-motion--${phase}`}>{children}</div>;
}

export function PublicReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const target = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "prepare" | "revealed">("idle");

  useEffect(() => {
    const element = target.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("revealed");
      return;
    }

    setPhase("prepare");
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setPhase("revealed"); observer.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -7%" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={target} className={`pf-reveal ${className}`} data-reveal={phase} style={{ "--pf-reveal-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}
