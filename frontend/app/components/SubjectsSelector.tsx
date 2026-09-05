import React from "react";
import { Track, Subject } from "@/app/data/subjects";

interface SubjectsSelectorProps {
  track: Track | undefined;
  onClose: () => void;
}

export default function SubjectsSelector({ track, onClose }: SubjectsSelectorProps) {
  if (!track) return null;

  const calculateTotalUnits = (subjects: Subject[]) => {
    return subjects.reduce((sum, subject) => sum + subject.units, 0);
  };

  const coreUnits = calculateTotalUnits(track.coreSubjects);
  const specializedUnits = calculateTotalUnits(track.specializedSubjects);

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
      <div className="card border-0 shadow-lg rounded-3 overflow-hidden" style={{ maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div className="p-4 text-white" style={{ background: "linear-gradient(135deg,#1e40af,#dc2626)" }}>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="fw-black fs-5 mb-1">{track.name} Track</h2>
              <p className="text-white-50 small mb-0">{track.description}</p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-link text-white p-0"
              style={{ fontSize: "24px" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="card-body p-4">
          {/* Summary */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="p-3 rounded-2" style={{ background: "#f0f4ff", border: "1px solid #bfdbfe" }}>
                <div className="text-muted small mb-1">Core Subjects</div>
                <div className="fw-black fs-5 text-primary">{track.coreSubjects.length}</div>
                <div className="text-muted small">{coreUnits} units</div>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 rounded-2" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <div className="text-muted small mb-1">Specialized Subjects</div>
                <div className="fw-black fs-5 text-danger">{track.specializedSubjects.length}</div>
                <div className="text-muted small">{specializedUnits} units</div>
              </div>
            </div>
          </div>

          {/* Core Subjects */}
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-3">📚 Core Subjects (All Students)</h5>
            <div className="d-flex flex-column gap-2">
              {track.coreSubjects.map((subject, idx) => (
                <div key={idx} className="p-3 rounded-2" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="flex-grow-1">
                      <div className="fw-bold small text-dark">{subject.code} - {subject.name}</div>
                      <div className="text-muted small mt-1">{subject.description}</div>
                    </div>
                    <span className="badge bg-primary text-white flex-shrink-0 ms-2">{subject.units} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Subjects */}
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-3">🎯 Specialized Subjects ({track.name} Track)</h5>
            <div className="d-flex flex-column gap-2">
              {track.specializedSubjects.map((subject, idx) => (
                <div key={idx} className="p-3 rounded-2" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="flex-grow-1">
                      <div className="fw-bold small text-dark">{subject.code} - {subject.name}</div>
                      <div className="text-muted small mt-1">{subject.description}</div>
                    </div>
                    <span className="badge bg-danger text-white flex-shrink-0 ms-2">{subject.units} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="alert alert-info mb-0">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <strong>Total Units for {track.name} Track</strong>
                <div className="text-muted small">Grade 11 & 12 combined</div>
              </div>
              <div className="fw-black fs-4 text-primary">{track.totalUnits}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-top bg-light d-flex gap-2">
          <button
            onClick={onClose}
            className="btn btn-primary flex-grow-1 rounded-2 fw-bold"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
