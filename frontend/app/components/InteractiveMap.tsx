"use client";

import { useState } from "react";

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  mapEmbedUrl: string;
  description: string;
}

const location: Location = {
  id: "basak",
  name: "CFEI Basak Lapu-Lapu Campus",
  latitude: 10.289056563576253,
  longitude: 123.96923785121021,
  address: "Basak, Lapu-Lapu City, 6015, Cebu, Philippines",
  phone: "(032) 273 1081",
  email: "cfeiinc@gmail.com",
  facebook: "https://www.facebook.com/CFEI2021",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m24!1m12!1m3!1d583.5532438693946!2d123.96872529699466!3d10.288741978087055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m9!3e6!4m3!3m2!1d10.351287899999999!2d123.9452427!4m3!3m2!1d10.2890566!2d123.9692379!5e0!3m2!1sen!2sph!4v1785335892379!5m2!1sen!2sph",
  description: "Our main campus in Basak, Lapu-Lapu City features modern facilities, classrooms, laboratories, and a welcoming learning environment for all students."
};

export default function InteractiveMap() {
  return (
    <div className="py-5 py-md-6 py-lg-7" style={{ background: "#fafaf8" }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h6 className="fw-semibold mb-2" style={{ color: "#f97316" }}>Our Campus</h6>
          <h2 className="h1 fw-bold mb-3" style={{ color: "#dc2626" }}>Visit Cebu Far East Institute</h2>
          <p className="text-muted" style={{ maxWidth: "700px", margin: "0 auto" }}>
            Located in the heart of Basak, Lapu-Lapu City, our campus offers state-of-the-art facilities and a vibrant learning environment. Come visit us and experience CFEI firsthand.
          </p>
        </div>

        <div className="row g-4 align-items-start">
          {/* Location Information Card */}
          <div className="col-lg-5 col-xl-4">
            <div
              className="p-4 rounded-4 border-2"
              style={{
                borderColor: "#dc2626",
                background: "linear-gradient(135deg, rgba(220,38,38,0.05), rgba(249,115,22,0.05))",
                boxShadow: "0 12px 32px rgba(220,38,38,0.15)"
              }}
            >
              <h5 className="fw-bold mb-4" style={{ color: "#dc2626" }}>
                📍 {location.name}
              </h5>

              {/* Address */}
              <div className="mb-4">
                <p className="small text-uppercase fw-semibold mb-2" style={{ color: "#f97316", letterSpacing: "0.05em" }}>
                  Address
                </p>
                <p className="mb-0 fw-medium" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                  {location.address}
                </p>
              </div>

              {/* Contact Details */}
              <div className="mb-4">
                <p className="small text-uppercase fw-semibold mb-2" style={{ color: "#f97316", letterSpacing: "0.05em" }}>
                  Contact Information
                </p>
                <div className="d-flex flex-column gap-2">
                  <a href={`tel:${location.phone}`} className="text-decoration-none d-flex align-items-center gap-2" style={{ color: "#dc2626" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span className="fw-medium">{location.phone}</span>
                  </a>
                  <a href={`mailto:${location.email}`} className="text-decoration-none d-flex align-items-center gap-2" style={{ color: "#dc2626" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span className="fw-medium">{location.email}</span>
                  </a>
                </div>
              </div>

              {/* Facebook */}
              <div className="mb-4">
                <a
                  href={location.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: "#1877f2",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "12px"
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M22 12C22 6.477 17.523 2 12 2S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99H7.898v-2.888h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                  Visit Facebook Page
                </a>
              </div>

              {/* Description */}
              <div className="p-3 rounded-3" style={{ background: "#fff7ed", borderLeft: "4px solid #f97316" }}>
                <p className="mb-0 small" style={{ lineHeight: "1.6" }}>{location.description}</p>
              </div>

              {/* Directions Button */}
              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #dc2626, #f97316)",
                    color: "white",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "12px"
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Google Map Display */}
          <div className="col-lg-7 col-xl-8">
            <div className="rounded-4 overflow-hidden shadow-lg" style={{ background: "white", border: "2px solid #e5e7eb" }}>
              <iframe
                src={location.mapEmbedUrl}
                width="100%"
                height="600"
                style={{ border: 0, display: "block" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${location.name}`}
              />
            </div>

            {/* Info below map */}
            <div className="mt-4 p-4 rounded-4" style={{ background: "white", border: "1px solid #e5e7eb" }}>
              <div className="d-flex align-items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #dc2626, #f97316)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-2" style={{ color: "#dc2626" }}>
                    Office Hours
                  </h6>
                  <p className="text-muted mb-0 small" style={{ lineHeight: "1.6" }}>
                    Monday - Friday: 8:00 AM - 5:00 PM<br/>
                    Saturday: 8:00 AM - 12:00 PM<br/>
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
