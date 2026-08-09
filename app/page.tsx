"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LoadingScreen from "./components/LoadingScreen";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-full w-full">
        <path d="M6 4h12v16H6V4Z" fill="currentColor" opacity="0.08" />
        <path d="M6 4h12v3H6z" fill="currentColor" />
        <path d="M8.5 10.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8.5 13.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8.5 16.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Modern Learning",
    short: "F2F and Modular and Blended learning", 
    color: "#dc2626",
    gradient: "linear-gradient(135deg, #dc2626, #f97316)",
    details: [
      { icon: "🖥️", label: "Digital Classrooms", desc: "Access learning materials, lecture notes, and modules anytime from any device." },
      { icon: "🎯", label: "Personalized Path", desc: "Adaptive content tailored to your academic strand and learning pace." },
      { icon: "📁", label: "Resource Library", desc: "Thousands of references, past exams, and supplemental reading materials." },
      { icon: "🏆", label: "Achievement Tracking", desc: "Monitor milestones and celebrate your academic accomplishments." },
    ],
    bg: "linear-gradient(135deg, rgba(220,38,38,0.06), rgba(249,115,22,0.06))",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-8 w-8">
        <path d="M5 18h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 14v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Real-time Grades",
    short: "Instant grade updates",
    color: "#f97316",
    gradient: "linear-gradient(135deg, #f97316, #fbbf24)",
    details: [
      { icon: "⚡", label: "Live Updates", desc: "Grades update as the request moves forward—student request, teacher calculation, admin verification, then final release." },
      { icon: "📝", label: "Request a Grade", desc: "If you need reconsideration, request the grade from the student portal. The request is sent to your teacher with your reason and subject details." },
      { icon: "📤", label: "Teacher to Admin", desc: "Your teacher reviews and calculates the grade, then submits the computed score to the Admin for verification." },
      { icon: "✅", label: "Admin Verify → Release", desc: "Admin verifies the computed grade. When approved, the final grade is released back to you and appears instantly in your grades list." },
      { icon: "🔔", label: "Status & Alerts", desc: "Track the request status (requested → teacher calculating → sent to admin → released) and receive alerts if approved or rejected." },
    ],
    bg: "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(251,191,36,0.06))",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-8 w-8">
        <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Smart Scheduling",
    short: "Optimized timetables",
    color: "#d97706",
    gradient: "linear-gradient(135deg, #d97706, #fbbf24)",
    details: [
      { icon: "🗓️", label: "Auto Timetable", desc: "Your weekly schedule is generated and updated automatically each term." },
      { icon: "⏰", label: "Class Reminders", desc: "Never miss a class with smart reminders 15 minutes before each session." },
      { icon: "🔄", label: "Schedule Changes", desc: "Instant notifications when a class is moved, cancelled, or rescheduled." },
      { icon: "📍", label: "Room Mapping", desc: "Know exactly which room and building your next class is in." },
    ],
    bg: "linear-gradient(135deg, rgba(217,119,6,0.06), rgba(251,191,36,0.06))",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-8 w-8">
        <path d="M4 5.5h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 18.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 21l4-3H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Easy Communication",
    short: "Connect with teachers",
    color: "#b91c1c",
    gradient: "linear-gradient(135deg, #b91c1c, #dc2626)",
    details: [
      { icon: "✉️", label: "Direct Messaging", desc: "Message your teachers or the registrar directly from the portal." },
      { icon: "📢", label: "Announcements", desc: "School-wide and class-specific announcements delivered in real time." },
      { icon: "📝", label: "Grade Inquiries", desc: "Submit grade reconsideration requests and track their status." },
      { icon: "🤖", label: "JOBERT AI", desc: "Ask JOBERT anything — from your GWA to enrollment deadlines, 24/7." },
    ],
    bg: "linear-gradient(135deg, rgba(185,28,28,0.06), rgba(220,38,38,0.06))",
  },
];

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
  const [aimPos, setAimPos] = useState({ x: 50, y: 50 });
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
  const servicesRef = useRef<(HTMLDivElement | null)[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featureSectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("landing-theme");
    if (saved === "dark") setDark(true);
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute("data-landing", "dark");
      localStorage.setItem("landing-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-landing");
      localStorage.setItem("landing-theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    document.documentElement.classList.add('js-enabled');

    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("revealed"), index * 100);
        }
      });
    }, observerOptions);
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-scale').forEach(el => observer.observe(el));

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (pageRef.current) pageRef.current.style.setProperty('--scroll-y', `${scrollY}px`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => { observer.disconnect(); window.removeEventListener('scroll', handleScroll); };
  }, []);

  // Aim parallax: track mouse over the features section
  const handleFeatureSectionMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setAimPos({ x, y });
  };

  const handleFeatureClick = (idx: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (activeFeature === idx) { setActiveFeature(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const sectionRect = featureSectionRef.current?.getBoundingClientRect();
    if (sectionRect) {
      setPanelPos({
        x: rect.left - sectionRect.left + rect.width / 2,
        y: rect.top - sectionRect.top + rect.height,
      });
    }
    setActiveFeature(idx);
  };

  const handleTiltMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const rotateX = ((e.clientY - rect.top) - rect.height / 2) / 10;
    const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 10;
    card.style.setProperty("--rotateX", `${rotateX}deg`);
    card.style.setProperty("--rotateY", `${rotateY}deg`);
  };

  const handleTiltMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rotateX", "0deg");
    e.currentTarget.style.setProperty("--rotateY", "0deg");
  };

  return (
    <>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <div className={`min-vh-100 text-dark landing-root${dark ? " landing-dark" : ""}`} ref={pageRef} style={{ opacity: loading ? 0 : 1, transition: "opacity 0.4s", width: "100%" }}>
      {/* Theme transition overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9990, pointerEvents: "none",
        background: dark ? "#0f172a" : "#fafaf8",
        opacity: transitioning ? 0.7 : 0,
        transition: transitioning ? "opacity 0.15s ease-in" : "opacity 0.4s ease-out",
      }} />
      {/* Navigation */}
      <header className="sticky-top top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container py-4">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <Link href="/" className="d-flex align-items-center gap-3 text-decoration-none">
              <div className="rounded-pill bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-2" style={{ width: 54, height: 54, display: "grid", placeItems: "center" }}>
                <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width: 42, height: 42, objectFit: "cover" }} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-orange-600">Cebu Far East Institute</h5>
                <p className="mb-0 small text-slate-500">Student Information System</p>
              </div>
            </Link>
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => {
                  setTransitioning(true);
                  setTimeout(() => {
                    setDark(d => !d);
                    setTimeout(() => setTransitioning(false), 400);
                  }, 150);
                }}
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                className="relative inline-flex h-11 w-20 items-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 p-1 shadow-[0_10px_20px_rgba(251,191,36,0.18)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className={`absolute left-1 top-1 h-9 w-9 rounded-full bg-white shadow-sm transition-all duration-300 ${dark ? "translate-x-9 bg-orange-500 text-white" : "translate-x-0 bg-white text-orange-600"}`}>
                  <span className="flex h-full w-full items-center justify-center text-xs leading-none">{dark ? "🌙" : "☀️"}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-6 sm:py-8 lg:py-10" style={{ background: "radial-gradient(circle at top, rgba(254,245,228,0.9), rgba(255,255,255,0.96) 45%, rgba(254,247,237,0.95) 100%)" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="rounded-[36px] bg-white/90 p-5 p-lg-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(234,88,12,0.12)]">
                <div className="d-flex flex-column flex-lg-row align-items-start gap-4">
                  <div className="flex-1">
                    <div className="mb-4 inline-flex rounded-full bg-orange-100/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
                      Official Student Portal
                    </div>
                    <h1 className="display-5 fw-bold mb-4 text-slate-900 tracking-tight" style={{ lineHeight: 1.05 }}>
                      Student Information <span style={{ display: "block", background: "linear-gradient(135deg, #dc2626, #f97316, #fbbf24)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>Management System</span>
                    </h1>
                    <p className="lead text-slate-600 mb-5" style={{ maxWidth: 680 }}>
                      Streamlined academic management for Cebu Far East Institute. Access your records, enrollment, and academic information in one unified platform.
                    </p>
                    <div className="d-flex flex-column flex-sm-row gap-3">
                      <Link href="/login" className="inline-flex items-center justify-center rounded-xl" style={{
                        background: "linear-gradient(135deg, #dc2626, #f97316)",
                        color: "#ffffff",
                        padding: "1rem 1.75rem",
                        borderRadius: "1rem",
                        fontWeight: 600,
                        boxShadow: "0 20px 40px rgba(220,38,38,0.18)",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}>
                        Log In <span className="ms-2" style={{ marginLeft: "0.5rem" }}>→</span>
                      </Link>
                      <Link href="/enrollment" className="inline-flex items-center justify-center rounded-xl" style={{
                        background: "linear-gradient(135deg, #f97316, #ffcc00)",
                        color: "#ffffff",
                        padding: "1rem 1.75rem",
                        borderRadius: "1rem",
                        fontWeight: 600,
                        boxShadow: "0 20px 40px rgba(220,38,38,0.18)",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}>
                        Enroll Now <span className="ms-2" style={{ marginLeft: "0.5rem" }}>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section — aim parallax + click expand */}
      <section
        className="position-relative overflow-hidden py-6 sm:py-8 lg:py-10"
        ref={featureSectionRef}
        onMouseMove={handleFeatureSectionMouseMove}
        onMouseLeave={() => setAimPos({ x: 50, y: 50 })}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background: `radial-gradient(ellipse 520px 380px at ${aimPos.x}% ${aimPos.y}%, rgba(220,38,38,0.09) 0%, rgba(249,115,22,0.06) 40%, transparent 70%)`,
            transition: "background 0.08s linear",
          }}
        />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        }}>
          <div style={{
            position: "absolute",
            left: `${aimPos.x}%`, top: `${aimPos.y}%`,
            width: 12, height: 12,
            borderRadius: "50%",
            background: "rgba(220,38,38,0.9)",
            transform: "translate(-50%, -50%)",
            transition: "left 0.08s linear, top 0.08s linear",
            boxShadow: "0 0 18px rgba(220,38,38,0.18)",
          }} />
        </div>

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="text-center mb-5 scroll-reveal">
            <div className="d-inline-flex rounded-full bg-orange-100/90 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-orange-700 mb-3">
              Why Choose Us
            </div>
            <h2 className="h1 fw-bold text-slate-900">Everything You Need in One Place</h2>
            <p className="text-slate-600 small mt-3">Click any card to explore</p>
          </div>

          <div className="row g-4">
            {FEATURES.map((feature, idx) => {
              const isActive = activeFeature === idx;
              return (
                <div key={idx} className="col-12 col-md-6 col-xl-3">
                  <div
                    className={`group relative overflow-hidden rounded-[28px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(234,88,12,0.12)] ${isActive ? "scale-[1.01] shadow-[0_20px_50px_rgba(234,88,12,0.14)]" : ""}`}
                    onClick={(e) => handleFeatureClick(idx, e)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="p-5 position-relative">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-orange-50 text-orange-600 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
                        {feature.icon}
                      </div>
                      <h5 className="fw-bold mb-2 text-slate-900" style={{ color: feature.color }}>{feature.title}</h5>
                      <p className="text-slate-600 small mb-4">{feature.short}</p>
                      <div className="mt-auto inline-flex items-center gap-2 text-sm fw-semibold text-orange-600">
                        Learn more <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 opacity-70" style={{ transform: isActive ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {activeFeature !== null && (() => {
            const f = FEATURES[activeFeature];
            return (
              <div className="mt-5 scroll-reveal">
                <div className="rounded-[32px] bg-white/90 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(234,88,12,0.12)]" ref={panelRef}>
                  <div className="d-flex flex-column flex-xl-row align-items-start justify-content-between gap-4">
                    <div className="flex-1">
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="grid h-14 w-14 place-items-center rounded-[22px] bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_15px_35px_rgba(234,88,12,0.24)]">
                          {f.icon}
                        </div>
                        <div>
                          <h4 className="fw-black mb-1" style={{ color: f.color }}>{f.title}</h4>
                          <p className="text-slate-600 small mb-0">{f.short}</p>
                        </div>
                      </div>
                      <div className="row g-3">
                        {f.details.map((d, di) => (
                          <div key={di} className="col-12 col-sm-6 col-xl-3">
                            <div className="h-100 rounded-[24px] bg-amber-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(234,88,12,0.12)]" style={{ minHeight: 200 }}>
                              <div className="mb-3 text-2xl">{d.icon}</div>
                              <div className="fw-semibold mb-2 text-slate-900">{d.label}</div>
                              <div className="text-slate-600 small leading-6">{d.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveFeature(null)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm text-slate-700 transition hover:bg-orange-50"
                      aria-label="Close expanded feature"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Services Section (with 3D hover effects) */}
      <section className="py-6 sm:py-8 lg:py-10" style={{ background: "linear-gradient(180deg, #fffaf0 0%, #fff1d6 45%, #fff7e4 100%)" }}>
        <div className="container">
          <div className="text-center mb-5 scroll-reveal">
            <div className="d-inline-flex rounded-full bg-orange-100/90 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-orange-700 mb-3">
              Quick Access
            </div>
            <h2 className="h1 fw-bold text-slate-900">Our Services</h2>
          </div>
          <div className="row g-4">
            {[
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-full w-full">
                  <path d="M5 6h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M7 8v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ), title: "Enrollment", desc: "Register for classes", href: "/enrollment" },
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-full w-full">
                  <path d="M5 19h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8 15l3-4 2 3 3-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ), title: "Grades", desc: "View your results", href: "/login" },
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-full w-full">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ), title: "Schedule", desc: "Class timetable", href: "/login" },
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-full w-full">
                  <rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 11h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ), title: "Fees & Payments", desc: "Pay tuition & fees", href: "/login" }
            ].map((service, idx) => (
              <div key={idx} className="col-12 col-md-6 col-xl-3">
                <Link href={service.href} className="text-decoration-none">
                  <div className="group h-100 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(234,88,12,0.12)]" onMouseMove={(e) => handleTiltMouseMove(e, idx)} onMouseLeave={handleTiltMouseLeave}>
                    <div className="h-100 p-5 d-flex flex-column align-items-center text-center gap-3">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-orange-50 text-orange-600 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white" style={{ fontSize: 24 }}>
                        {service.icon}
                      </div>
                      <h5 className="fw-bold text-slate-900 mb-1">{service.title}</h5>
                      <p className="text-slate-600 small mb-0">{service.desc}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Us CTA Section */}
      <section className="py-6 sm:py-8 lg:py-10" style={{ background: "linear-gradient(180deg, #fff1d6 0%, #fdc49a 35%, #f97316 100%)" }}>
        <div className="container">
          <div className="row align-items-center justify-content-between gap-4">
            <div className="col-lg-7">
              <div className="rounded-[32px] bg-white/15 p-5 p-lg-6 shadow-[0_20px_50px_rgba(220,38,38,0.18)] backdrop-blur-xl">
                <p className="text-uppercase fw-semibold mb-3 text-amber-900/80 tracking-[0.24em]">Visit Us Today</p>
                <h2 className="fw-extrabold mb-4 text-white">Experience the Vibrant Campus Life</h2>
                <p className="lead text-amber-100 mb-4">
                  Come visit Cebu Far East Institute and discover our state-of-the-art facilities, welcoming community, and dynamic learning environment. Our dedicated faculty and modern infrastructure are ready to inspire your academic journey.
                </p>
                <div className="rounded-[24px] bg-white/10 p-4 mb-4">
                  <p className="mb-1 fw-semibold text-white">📍 Located at:</p>
                  <p className="mb-0 text-amber-100 small">Basak, Lapu-Lapu City, Cebu</p>
                </div>
                <Link href="/visit-us" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-orange-600 font-semibold shadow-md shadow-orange-500/20 transition-all duration-300 hover:bg-orange-50 hover:scale-[0.99]">
                  🌟 VISIT US TODAY
                </Link>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="rounded-[32px] bg-white/15 p-4 shadow-[0_20px_45px_rgba(220,38,38,0.16)] backdrop-blur-xl">
                <h5 className="fw-semibold text-white mb-3">Campus Snapshot</h5>
                <p className="text-amber-100 small mb-4">Discover excellence in infrastructure, learning, and community support all in one place.</p>
                <div className="rounded-[28px] overflow-hidden bg-orange-50/30">
                  <img src="/campus-landscape.jpg" alt="Campus landscape" className="w-100 h-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5" style={{ background: "#dc2626" }}>
        <div className="container">
          <div className="row gy-4 justify-content-between">
            <div className="col-md-5 d-flex align-items-start gap-3">
              <div className="rounded-3xl bg-white/10 p-3 shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
                <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width: 56, height: 56, objectFit: "cover" }} />
              </div>
              <div>
                <h5 className="fw-bold text-white mb-1">Cebu Far East Institute</h5>
                <p className="mb-0 small text-amber-100/85">Student Information System</p>
              </div>
            </div>
            <div className="col-md-3">
              <h6 className="fw-semibold text-white mb-3">Contact Us</h6>
              <p className="mb-1 small text-amber-100">Basak, Lapu-Lapu City, Cebu</p>
              <p className="mb-1 small text-amber-100">Phone: (032) 273 1081</p>
              <p className="mb-0 small text-amber-100">Email: <a href="mailto:cfeiinc@gmail.com" className="text-white text-decoration-none">cfeiinc@gmail.com</a></p>
            </div>
            <div className="col-md-3 text-md-end">
              <h6 className="fw-semibold text-white mb-3">Follow</h6>
              <a href="https://www.facebook.com/CFEI2021" target="_blank" rel="noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-white/10 text-white transition hover:bg-white/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22 12C22 6.477 17.523 2 12 2S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99H7.898v-2.888h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.991 22 12z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-5 pt-4 text-center text-amber-100/90 small">
            © 2026 Cebu Far East Institute. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}