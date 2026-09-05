"use client";

import Link from "next/link";
import InteractiveMap from "../components/InteractiveMap";

export default function VisitUsPage() {
  return (
    <>
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-5 py-md-6 py-lg-7" style={{ background: "linear-gradient(135deg, #fff7ed, #fef3c7)" }}>
        <div className="container">
          <Link
            href="/"
            className="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none fw-medium"
            style={{ color: "#dc2626" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8 text-center">
              <div className="d-inline-flex align-items-center gap-2 rounded-pill small fw-medium mb-4" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white", padding: "8px 20px" }}>
                <span className="w-2 h-2 bg-warning rounded-circle animate-pulse"></span>
                Visit Our Campus
              </div>
              <h1 className="display-4 display-md-3 display-lg-2 fw-extrabold mb-4">
                <span style={{ color: "#dc2626" }}>Experience Our</span><br />
                <span style={{
                  background: "linear-gradient(135deg, #dc2626, #f97316, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block"
                }}>
                  Campus Location
                </span>
              </h1>
              <p className="lead mb-4 text-muted" style={{ maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
                Come and experience the vibrant and dynamic atmosphere of Cebu Far East Institute. Located in Basak, Lapu-Lapu City, our state-of-the-art facilities and diverse community are ready to welcome you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <InteractiveMap />

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
    </>
  );
}
