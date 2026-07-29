"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LoadingScreen from "./components/LoadingScreen";

const FEATURES = [
  {
    icon: "📚",
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
    border: "rgba(220,38,38,0.25)",
  },
  {
    icon: "📊",
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
    border: "rgba(249,115,22,0.25)",
  },
  {
    icon: "📅",
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
    border: "rgba(217,119,6,0.25)",
  },
  {
    icon: "💬",
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
    border: "rgba(185,28,28,0.25)",
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
      <header className="sticky-top bg-white bg-opacity-90 backdrop-blur border-bottom border-light shadow-sm z-3">
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            <Link href="/" className="d-flex align-items-center gap-3 text-decoration-none text-dark">
              <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width: "40px", height: "40px", objectFit: "cover", border: "2px solid #dc2626" }} />
              <div>
                <h5 className="mb-0 fw-bold" style={{ color: "#dc2626" }}>Cebu Far East Institute</h5>
                <p className="mb-0 text-muted small">Student Information System</p>
              </div>
            </Link>
            <div className="d-flex align-items-center gap-3">
              {/* Dark / Light toggle */}

              <button
                onClick={() => {
                  setTransitioning(true);
                  setTimeout(() => {
                    setDark(d => !d);
                    setTimeout(() => setTransitioning(false), 400);
                  }, 150);
                }}
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                style={{
                  width: 44, height: 26,
                  borderRadius: 13,
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  position: "relative",
                  background: dark
                    ? "linear-gradient(135deg, #1e293b, #334155)"
                    : "linear-gradient(135deg, #fef3c7, #fde68a)",
                  boxShadow: dark
                    ? "inset 0 0 0 1.5px #475569"
                    : "inset 0 0 0 1.5px #fbbf24",
                  transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                  flexShrink: 0,
                }}
              >
                {/* Thumb */}
                <span style={{
                  position: "absolute",
                  top: 3, left: dark ? 21 : 3,
                  width: 20, height: 20,
                  borderRadius: "50%",
                  background: dark
                    ? "linear-gradient(135deg, #f1f5f9, #cbd5e1)"
                    : "linear-gradient(135deg, #f97316, #dc2626)",
                  boxShadow: dark
                    ? "0 1px 4px rgba(0,0,0,0.4)"
                    : "0 1px 4px rgba(220,38,38,0.4)",
                  transition: "left 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11,
                }}>
                  {dark ? "🌙" : "☀️"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-5 py-md-6 py-lg-7 landing-hero" style={{ background: "linear-gradient(135deg, #fff7ed, #fef3c7)" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8 text-center">
              <div className="d-inline-flex align-items-center gap-2 rounded-pill small fw-medium mb-4" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white", padding: "8px 20px" }}>
                <span className="w-2 h-2 bg-warning rounded-circle animate-pulse"></span>
                Official Student Portal
              </div>
              <h1 className="display-4 display-md-3 display-lg-2 fw-extrabold mb-4">
                <span style={{ color: "#dc2626" }}>Student Information</span><br />
                <span style={{
                  background: "linear-gradient(135deg, #dc2626, #f97316, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                  color: "#dc2626"
                }}>
                  Management System
                </span>
              </h1>
              <p className="lead mb-5 text-muted" style={{ maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
                Streamlined academic management for Cebu Far East Institute. Access your records, enrollment, and academic information in one unified platform.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Link href="/login" className="btn btn-lg px-5 py-3 fw-semibold rounded-xl shadow hover:shadow-lg transition-all btn-shimmer" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}>
                  Log In
                </Link>
                <Link href="/enrollment" className="btn btn-lg px-5 py-3 fw-semibold rounded-xl shadow hover:shadow-lg transition-all btn-shimmer " style={{ background: "linear-gradient(135deg, #f97316, #ffcc00)", color: "white" }}>
                  Enroll Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section — aim parallax + click expand */}
      <section
        className="py-5 py-md-6 py-lg-7 bg-white position-relative landing-features"
        ref={featureSectionRef}
        onMouseMove={handleFeatureSectionMouseMove}
        onMouseLeave={() => setAimPos({ x: 50, y: 50 })}
        style={{ cursor: "crosshair" }}
      >
        {/* Aim parallax spotlight — follows cursor */}
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
        {/* Crosshair lines — clipped to section bounds */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden", borderRadius: 0,
        }}>
          <div style={{
            position: "absolute",
            left: `${aimPos.x}%`, top: 0, bottom: 0,
            width: 1,
            background: "linear-gradient(180deg, transparent, rgba(220,38,38,0.12), transparent)",
            transform: "translateX(-50%)",
            transition: "left 0.08s linear",
          }} />
          <div style={{
            position: "absolute",
            top: `${aimPos.y}%`, left: 0, right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.12), transparent)",
            transform: "translateY(-50%)",
            transition: "top 0.08s linear",
          }} />
          {/* Aim dot */}
          <div style={{
            position: "absolute",
            left: `${aimPos.x}%`, top: `${aimPos.y}%`,
            width: 10, height: 10,
            borderRadius: "50%",
            border: "2px solid rgba(220,38,38,0.4)",
            transform: "translate(-50%, -50%)",
            transition: "left 0.08s linear, top 0.08s linear",
            boxShadow: "0 0 8px rgba(220,38,38,0.3)",
          }} />
        </div>

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="text-center mb-5 scroll-reveal">
            <h6 className="fw-semibold mb-2" style={{ color: "#f97316" }}>Why Choose Us</h6>
            <h2 className="h1 fw-bold" style={{ color: "#dc2626" }}>Everything You Need in One Place</h2>
            <p className="text-muted small mt-2">Click any card to explore</p>
          </div>

          <div className="row g-4 position-relative">
            {FEATURES.map((feature, idx) => {
              const isActive = activeFeature === idx;
              return (
                <div
                  key={idx}
                  className="col-12 col-md-6 col-lg-3"
                  ref={(el) => { featuresRef.current[idx] = el; }}
                >
                  <div
                    className={`scroll-reveal-scale ${idx === 0 ? 'float-slow' : idx === 1 ? 'float-slow-delay-1' : idx === 2 ? 'float-slow-delay-2' : 'float-slow-delay-3'} landing-feature-tile`}
                    onClick={(e) => handleFeatureClick(idx, e)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "1rem",
                      border: `2px solid ${isActive ? feature.color : "rgba(251,191,36,0.4)"}`,
                      background: isActive ? feature.bg : "linear-gradient(135deg, #fff7ed, #fef3c7)",
                      padding: "2rem",
                      transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                      transform: isActive ? "translateY(-8px) scale(1.03)" : "translateY(0) scale(1)",
                      boxShadow: isActive
                        ? `0 20px 50px rgba(0,0,0,0.12), 0 0 0 3px ${feature.color}22`
                        : "0 2px 8px rgba(0,0,0,0.06)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Shimmer on active */}
                    {isActive && (
                      <div style={{
                        position: "absolute", inset: 0, pointerEvents: "none",
                        background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                        animation: "featureShimmer 1.2s ease-in-out",
                      }} />
                    )}

                    {/* Icon with spin-in on activate */}
                    <div style={{
                      fontSize: "2.2rem", marginBottom: "0.75rem",
                      display: "inline-block",
                      transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                      transform: isActive ? "scale(1.25) rotate(-8deg)" : "scale(1) rotate(0deg)",
                      filter: isActive ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" : "none",
                    }}>{feature.icon}</div>

                    <h5 className="fw-bold mb-1" style={{ color: feature.color, transition: "color 0.3s" }}>
                      {feature.title}
                    </h5>
                    <p className="text-muted mb-0 small">{feature.short}</p>

                    {/* Active indicator */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      height: 3,
                      background: feature.gradient,
                      transform: isActive ? "scaleX(1)" : "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
                      borderRadius: "0 0 1rem 1rem",
                    }} />

                    {/* Click hint chevron */}
                    <div style={{
                      position: "absolute", top: 12, right: 14,
                      fontSize: 13, color: feature.color,
                      opacity: isActive ? 1 : 0.35,
                      transition: "all 0.3s",
                      transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                    }}>▼</div>
                  </div>
                </div>
              );
            })}

            {/* Expanded detail panel — appears below the clicked tile */}
            {activeFeature !== null && (() => {
              const f = FEATURES[activeFeature];
              return (
                <div className="col-12" style={{ order: Math.floor(activeFeature / 1) + 1 }}>
                  <div
                    ref={panelRef}
                    style={{
                      borderRadius: "1.25rem",
                      border: `1.5px solid ${f.border}`,
                      background: f.bg,
                      padding: "2rem 2.5rem",
                      animation: "featurePanelIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                      position: "relative",
                      overflow: "hidden",
                      backdropFilter: "blur(8px)",
                    }}
                    className="landing-feature-panel"
                  >
                    {/* Parallax inner glow that shifts with aim */}
                    <div style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      background: `radial-gradient(ellipse 600px 300px at ${aimPos.x}% ${aimPos.y}%, ${f.color}14 0%, transparent 65%)`,
                      transition: "background 0.1s linear",
                      zIndex: 0,
                    }} />

                    <div className="position-relative" style={{ zIndex: 1 }}>
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <div style={{
                          fontSize: "2rem",
                          background: f.gradient,
                          borderRadius: "0.75rem",
                          width: 52, height: 52,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: `0 8px 20px ${f.color}33`,
                        }}>{f.icon}</div>
                        <div>
                          <h4 className="fw-black mb-0" style={{ color: f.color }}>{f.title}</h4>
                          <p className="text-muted small mb-0">{f.short}</p>
                        </div>
                        <button
                          onClick={() => setActiveFeature(null)}
                          style={{
                            marginLeft: "auto",
                            background: "none", border: "none", cursor: "pointer",
                            color: "#64748b", fontSize: 20, lineHeight: 1,
                            padding: "4px 8px", borderRadius: 6,
                          }}
                        >✕</button>
                      </div>

                      <div className="row g-3">
                        {f.details.map((d, di) => (
                          <div key={di} className="col-12 col-sm-6 col-lg-3">
                            <div style={{
                              background: "rgba(255,255,255,0.75)",
                              borderRadius: "0.875rem",
                              padding: "1.25rem",
                              border: `1px solid ${f.border}`,
                              height: "100%",
                              animation: `featureDetailIn 0.35s cubic-bezier(0.4,0,0.2,1) ${di * 0.07}s both`,
                              transition: "transform 0.2s, box-shadow 0.2s",
                            }}
                              className="detail-card"
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 28px ${f.color}22`; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
                            >
                              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{d.icon}</div>
                              <div className="fw-bold small mb-1" style={{ color: f.color }}>{d.label}</div>
                              <div className="text-muted" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>{d.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Services Section (with 3D hover effects) */}
      <section className="py-5 py-md-6 py-lg-7 landing-services" style={{ background: "#fff7ed" }}>
        <div className="container">
          <div className="text-center mb-5 scroll-reveal">
            <h6 className="fw-semibold mb-2" style={{ color: "#f97316" }}>Quick Access</h6>
            <h2 className="h1 fw-bold" style={{ color: "#dc2626" }}>Our Services</h2>
          </div>
          <div className="row g-4">
            {[
              { icon: "📋", title: "Enrollment", desc: "Register for classes", href: "/enrollment" },
              { icon: "📊", title: "Grades", desc: "View your results", href: "/login" },
              { icon: "🕐", title: "Schedule", desc: "Class timetable", href: "/login" },
              { icon: "💳", title: "Fees & Payments", desc: "Pay tuition & fees", href: "/login" }
            ].map((service, idx) => (
              <div
                key={idx}
                className="col-12 col-md-6 col-lg-3"
                ref={(el) => { servicesRef.current[idx] = el; }}
              >
                <Link href={service.href} className="text-decoration-none text-dark">
                  <div className="card-3d-tilt h-100 scroll-reveal" onMouseMove={(e) => handleTiltMouseMove(e, idx)} onMouseLeave={handleTiltMouseLeave}>
                    <div className="card-glow-border h-100">
                      <div className="card-glow-inner h-100 text-center">
                        <div className="mb-3 rounded-xl" style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #dc2626, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto" }}>
                          {service.icon}
                        </div>
                        <h5 className="fw-bold mb-1" style={{ color: "#dc2626" }}>{service.title}</h5>
                        <p className="text-muted small mb-0">{service.desc}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Us CTA Section */}
      <section className="py-5 py-md-6 py-lg-7" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center text-white">
              <div className="mb-4">
                <h2 className="h1 fw-extrabold mb-3" style={{ color: "white" }}>
                  Experience the Vibrant Campus Life
                </h2>
                <p className="lead mb-3" style={{ color: "#fef3c7" }}>
                  Come visit Cebu Far East Institute and discover our state-of-the-art facilities, welcoming community, and dynamic learning environment. Our dedicated faculty and modern infrastructure are ready to inspire your academic journey.
                </p>
                <div className="mb-4">
                  <p className="fw-semibold mb-2" style={{ color: "#fef3c7", fontSize: "1.05rem" }}>
                    📍 Located at:
                  </p>
                    <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px 20px", borderRadius: "8px", backdropFilter: "blur(8px)" }}>
                      <p className="mb-0"><strong>Basak Lapu-Lapu Campus</strong></p>
                      <p className="small mb-0" style={{ color: "#fef3c7" }}>Basak, Lapu-Lapu City</p>
                    </div>
                </div>
              </div>
              <Link href="/visit-us" className="btn btn-lg px-6 py-3 fw-semibold rounded-xl btn-shimmer" style={{ background: "white", color: "#dc2626" }}>
                🌟 VISIT US TODAY
              </Link>
              <p className="text-white-50 small mt-3 mb-0">Discover why hundreds of students choose CFEI for their education</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5" style={{ background: "#dc2626", color: "white" }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-4 mb-4">
            <div className="d-flex align-items-center gap-3">
              <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width: "56px", height: "56px", objectFit: "cover", border: "2px solid white" }} />
              <div>
                <h5 className="mb-0 fw-bold">Cebu Far East Institute</h5>
                <p className="mb-0 small" style={{ color: "#fef3c7" }}>Student Information System</p>
              </div>
            </div>

            <div style={{ color: "#fef3c7" }}>
              <h6 className="fw-semibold mb-2">Contact Us</h6>
              <p className="mb-1 small">Basak, Lapu-Lapu City, Cebu</p>
              <p className="mb-1 small">Phone: (032) 273 1081</p>
              <p className="mb-0 small">Email: <a href="mailto:cfeiinc@gmail.com" className="text-decoration-none" style={{ color: "#fef3c7" }}>cfeiinc@gmail.com</a></p>
            </div>

            <div className="text-center">
              <h6 className="fw-semibold mb-2">Get in Touch</h6>
              <a href="https://www.facebook.com/CFEI2021" target="_blank" rel="noopener noreferrer" className="d-inline-flex align-items-center gap-2 text-decoration-none" style={{ color: "#fef3c7" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22 12C22 6.477 17.523 2 12 2S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99H7.898v-2.888h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.991 22 12z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          <div className="border-top pt-4 text-center small" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fef3c7" }}>
            <p className="mb-0">© 2026 Cebu Far East Institute. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}