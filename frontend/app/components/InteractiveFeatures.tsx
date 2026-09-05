"use client";

import { useEffect, useRef } from "react";

/**
 * Mouse tracking effect for cards
 * Creates a radial gradient that follows the mouse
 */
export function useMouseTracking() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      element.style.setProperty("--mouse-x", `${x}px`);
      element.style.setProperty("--mouse-y", `${y}px`);
    };

    element.addEventListener("mousemove", handleMouseMove);
    return () => element.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return ref;
}

/**
 * Scroll animation trigger
 * Triggers animations when elements come into view
 */
export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-scroll-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}

/**
 * Parallax scroll effect
 */
export function useParallax() {
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const element = el as HTMLElement;
        const speed = parseFloat(element.getAttribute("data-parallax") || "0.5");
        const yPos = window.scrollY * speed;
        element.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}

/**
 * Ripple effect on click
 */
export function RippleEffect({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = "0";
    ripple.style.height = "0";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.5)";
    ripple.style.pointerEvents = "none";
    ripple.style.animation = "ripple 0.6s ease-out";
    ripple.style.transform = "translate(-50%, -50%)";

    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <div
      ref={ref}
      className={`ripple ${className}`}
      onClick={handleClick}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

/**
 * Floating action button with animation
 */
export function FloatingActionButton({
  icon,
  label,
  onClick,
  color = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${color} rounded-circle d-flex align-items-center justify-content-center animate-float`}
      style={{
        width: "56px",
        height: "56px",
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s ease",
      }}
      title={label}
    >
      {icon}
    </button>
  );
}

/**
 * Animated counter
 */
export function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    let current = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      ref.current!.textContent = Math.floor(current).toString();
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span ref={ref}>0</span>;
}

/**
 * Smooth scroll to element
 */
export function smoothScroll(elementId: string) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}
