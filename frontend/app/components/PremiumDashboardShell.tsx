"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

type PremiumDashboardShellProps = {
  children: ReactNode;
  portalTitle: string;
  portalSubtitle: string;
  userName?: string;
  userMeta?: string;
  logoutHref: string;
  logoutLabel?: string;
  maxWidth?: number;
};

export function PremiumDashboardShell({
  children,
  portalTitle,
  portalSubtitle,
  userName,
  userMeta,
  logoutHref,
  logoutLabel = "Log Out",
  maxWidth = 1100,
}: PremiumDashboardShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        root.style.setProperty("--scroll-y", `${scrollY}px`);
        root.style.setProperty("--scroll-progress", `${Math.min(scrollY / maxScroll, 1)}`);
        navRef.current?.classList.toggle("is-scrolled", scrollY > 30);
      });
    };

    if (!reduced) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    const revealSelectors = ".scroll-reveal-3d, .scroll-reveal-flip, .dash-reveal, .scroll-reveal, .scroll-reveal-scale, .scroll-reveal-left, .scroll-reveal-right";

    // Reveal all currently existing elements
    const revealAll = () => {
      root.querySelectorAll(revealSelectors).forEach((el) => {
        el.classList.add("is-visible", "revealed");
      });
    };
    revealAll();

    // Watch for new elements added when tiles are clicked
    const mutationObserver = new MutationObserver(() => revealAll());
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="dash-premium min-vh-100 d-flex flex-column" suppressHydrationWarning>
      <div className="landing-bg-layer" aria-hidden="true">
        <div className="landing-grid" />
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
      </div>

      <nav ref={navRef} className="dash-nav landing-nav">
        <div className="landing-brand">
          <img src="/cfei-logo.jpg" alt="CFEI" className="landing-brand-logo" />
          <div>
            <div className="landing-brand-name">{portalTitle}</div>
            <div className="landing-brand-sub">{portalSubtitle}</div>
          </div>
        </div>

        {userName && (
          <div className="dash-user d-none d-md-block text-center">
            <div className="dash-user-name">{userName}</div>
            {userMeta && <div className="dash-user-meta">{userMeta}</div>}
          </div>
        )}

        <Link href={logoutHref} className="landing-admin-btn">
          ↪ {logoutLabel}
        </Link>
      </nav>

      <main className="dash-main flex-grow-1 w-100 d-flex flex-column align-items-center px-3 pb-4">
        <div className="dash-content w-100" style={{ maxWidth }}>
          {children}
        </div>
      </main>

      <footer className="dash-footer landing-footer">
        <p className="landing-footer-copy mb-0">© 2026 Cebu Far East Institute. All rights reserved.</p>
      </footer>
    </div>
  );
}
