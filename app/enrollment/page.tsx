"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ── Step types ─────────────────────────────────────────────
// Step 1: Terms & Conditions
// Step 2: Enrollment Form
// Step 3: "I hereby agree..." checkbox
// Step 4: Review / confirm filled form  →  "Save and Enroll"
// Step 5: Success screen
type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { n: 1, label: "Terms & Conditions" },
  { n: 2, label: "Enrollment Form"    },
  { n: 3, label: "Declaration"        },
  { n: 4, label: "Review & Confirm"   },
];

// ── Step progress bar ───────────────────────────────────────
function StepBar({ step }: { step: Step }) {
  if (step === 5) return null;
  return (
    <div className="d-flex align-items-center justify-content-center gap-0 mb-4">
      {STEPS.map((s, i) => {
        const done    = step > s.n;
        const active  = step === s.n;
        return (
          <div key={s.n} className="d-flex align-items-center">
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 72 }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-black mb-1"
                style={{ width: 32, height: 32, fontSize: 13,
                  background: done ? "#10b981" : active ? "linear-gradient(135deg,#1e40af,#dc2626)" : "rgba(255,255,255,0.15)",
                  color: done || active ? "white" : "rgba(255,255,255,0.5)",
                  border: done || active ? "none" : "1.5px solid rgba(255,255,255,0.25)",
                  transition: "all 0.3s"
                }}>
                {done ? "✓" : s.n}
              </div>
              <span style={{ fontSize: 10, color: active ? "white" : done ? "#6ee7b7" : "rgba(255,255,255,0.4)", whiteSpace: "nowrap", fontWeight: active ? 700 : 400 }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 32, height: 2, background: done ? "#10b981" : "rgba(255,255,255,0.15)", marginBottom: 18, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function EnrollmentPage() {
  const [step, setStep] = useState<Step>(1);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", middleName: "", extensionName: "",
    email: "", phone: "",
    track: "", strand: "", year: "",
    address: "", dateOfBirth: "",
    studentStatus: "", studentId: "",
    gender: "", civilStatus: "",
    nationality: "", religion: "",
    fatherName: "", fatherOccupation: "",
    motherName: "", motherOccupation: "",
    guardianName: "", guardianRelation: "", guardianPhone: "",
    previousSchool: "", previousSchoolAddress: "", yearsAttended: "",
    learningModality: "",
    idPhoto: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type === "file") {
      const files = target.files;
      if (files && files[0]) setFormData(prev => ({ ...prev, idPhoto: files[0] }));
    } else {
      const { name, value } = target;
      // Reset strand when track changes
      if (name === "track") {
        setFormData(prev => ({ ...prev, [name]: value, strand: "" }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 10) setHasScrolledTerms(true);
  };

  function validateForm(): string | null {
    const required: Record<string, string> = {
      firstName: "First Name", lastName: "Last Name", email: "Email",
      phone: "Phone", track: "Track", strand: "Strand", year: "Grade Level",
      address: "Address", dateOfBirth: "Date of Birth",
      studentStatus: "Student Status", gender: "Gender",
      nationality: "Nationality", religion: "Religion",
      learningModality: "Learning Modality",
    };
    for (const [key, label] of Object.entries(required)) {
      if (!formData[key as keyof typeof formData]?.toString().trim()) return `${label} is required.`;
    }
    if (formData.studentStatus === "old" && !formData.studentId.trim()) return "Student ID is required for returning students.";
    if (!formData.idPhoto) return "Please upload a 2×2 ID photo.";
    return null;
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateForm();
    if (err) { alert(err); return; }
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFinalEnroll() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        first_name:              formData.firstName,
        last_name:               formData.lastName,
        middle_name:             formData.middleName || null,
        extension_name:          formData.extensionName || null,
        email:                   formData.email,
        phone:                   formData.phone,
        date_of_birth:           formData.dateOfBirth,
        gender:                  formData.gender,
        civil_status:            formData.civilStatus || null,
        nationality:             formData.nationality,
        religion:                formData.religion || null,
        address:                 formData.address,
        student_status:          formData.studentStatus || "new",
        existing_student_id:     formData.studentId || null,
        track:                   formData.track,
        strand:                  formData.strand,
        grade_level:             formData.year,
        learning_modality:       formData.learningModality,
        father_name:             formData.fatherName || null,
        father_occupation:       formData.fatherOccupation || null,
        mother_name:             formData.motherName || null,
        mother_occupation:       formData.motherOccupation || null,
        guardian_name:           formData.guardianName || null,
        guardian_relation:       formData.guardianRelation || null,
        guardian_phone:          formData.guardianPhone || null,
        previous_school:         formData.previousSchool || null,
        previous_school_address: formData.previousSchoolAddress || null,
        years_attended:          formData.yearsAttended || null,
      };

      const res = await fetch(`${API_BASE}/api/applications`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Submission failed. Please try again.");
        return;
      }

      // Success — move to confirmation screen
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Wrapper layout ─────────────────────────────────────────
  const bg = {
    minHeight: "100vh",
    background: "linear-gradient(-45deg,#0f172a,#1e3a6e,#1e293b,#0f172a)",
    backgroundSize: "400% 400%",
    animation: "animatedGradient 15s ease infinite",
  };

  // ══════════════════════════════════════════════════════════
  // STEP 5 — Success
  // ══════════════════════════════════════════════════════════
  if (step === 5) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center px-3 py-5" style={bg}>
        <div className="card border-0 shadow-lg rounded-3 overflow-hidden" style={{ maxWidth: 560, width: "100%" }}>
          <div className="card-body p-5 text-center">
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 className="fw-black text-success mb-2">Application Submitted!</h2>
            <p className="text-muted mb-4">Your enrollment application has been received. The Registrar will review it and forward it to the Principal for approval.</p>

            <div className="alert alert-info text-start mb-4">
              <div className="mb-2"><strong>Name:</strong> {formData.firstName} {formData.middleName && formData.middleName+" "}{formData.lastName}{formData.extensionName && " "+formData.extensionName}</div>
              <div className="mb-2"><strong>Email:</strong> {formData.email}</div>
              <div className="mb-2"><strong>Status:</strong> {formData.studentStatus === "new" ? "New Student" : "Returning Student"}</div>
              <div className="mb-2"><strong>Track:</strong> {formData.track}</div>
              <div className="mb-2"><strong>Strand:</strong> {formData.strand}</div>
              <div className="mb-2"><strong>Grade Level:</strong> Grade {formData.year}</div>
              <div className="mb-2"><strong>Learning Modality:</strong> {formData.learningModality}</div>
            </div>

            <div className="card border-2 border-primary rounded-3 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold text-primary mb-3">📧 What Happens Next?</h5>
                <div className="d-flex flex-column gap-3 text-start">
                  {[
                    { n:"1", label:"Registrar Review", desc:"The Registrar will verify your submitted details." },
                    { n:"2", label:"Principal Approval", desc:"The Principal will make the final enrollment decision." },
                    { n:"3", label:"Credentials Email", desc:`Once approved, your Student ID and temporary password will be sent to ${formData.email}.` },
                  ].map(s => (
                    <div key={s.n} className="d-flex align-items-start gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        style={{ width:28,height:28,fontSize:12,background:"linear-gradient(135deg,#1e40af,#dc2626)" }}>{s.n}</div>
                      <div>
                        <div className="fw-semibold small text-dark">{s.label}</div>
                        <div className="text-muted" style={{ fontSize:12 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <small className="text-muted d-block mt-3">⚠️ Please check your inbox (and spam folder) for the credentials email. You will need it to log in.</small>
              </div>
            </div>
            <Link href="/" className="btn btn-primary btn-lg rounded-2 fw-bold">← Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-start px-3 py-4 position-relative" style={bg}>
      {/* Decorative orbs */}
      {[{ top:"10%",left:"5%",w:300,c:"rgba(30,58,110,0.3)",a:"floatOrb1 20s" }, { top:"60%",right:"10%",w:350,c:"rgba(225,29,72,0.25)",a:"floatOrb2 25s" }, { bottom:"10%",left:"50%",w:280,c:"rgba(245,158,11,0.2)",a:"floatOrb3 22s" }].map((o,i) => (
        <div key={i} style={{ position:"absolute", ...o as React.CSSProperties, height:o.w, borderRadius:"50%", background:`radial-gradient(circle,${o.c} 0%,transparent 70%)`, filter:"blur(40px)", animation:o.a+" ease-in-out infinite", pointerEvents:"none" }} />
      ))}

      <div className="position-relative" style={{ maxWidth: 640, width:"100%", marginTop:20, zIndex:10 }}>

        {/* Logo / brand */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-3 mb-2">
            <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width:44, height:44, objectFit:"cover", border:"2px solid rgba(255,255,255,0.3)" }} />
            <img src="/newimlogo.png" alt="INFORM" className="rounded-3" style={{ width:44, height:44, objectFit:"cover" }} />
          </div>
          <div className="text-white fw-black fs-5">Student Enrollment</div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>Cebu Far East Institute · SY 2025–2026</div>
        </div>

        {/* Step bar */}
        <StepBar step={step} />

        {/* ── STEP 1: Terms & Conditions ─────────────────── */}
        {step === 1 && (
          <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
            <div className="p-4 text-white text-center" style={{ background:"linear-gradient(135deg,#1e40af,#dc2626)" }}>
              <h2 className="fw-black fs-5 mb-1">📜 Terms and Conditions</h2>
              <p className="text-white-50 small mb-0">Please read all terms carefully before proceeding</p>
            </div>

            {/* Scrollable content */}
            <div className="card-body p-0" style={{ overflowY:"auto", maxHeight:"52vh" }} onScroll={handleTermsScroll}>
              <div className="p-4" style={{ fontSize:"0.9rem", lineHeight:1.7, color:"#333" }}>
                <h5 className="fw-bold mb-3">CEBU FAR EAST INSTITUTE — ENROLLMENT TERMS AND CONDITIONS</h5>

                <p className="mb-3">
                  <strong>1. ENROLLMENT AGREEMENT</strong><br />
                  A pupil or student who withdraws enrollment before or after the beginning of classes must submit a written request stating the reason for withdrawal. The withdrawal of documents must be processed within the school year only after being cleared of all accountabilities.
                </p>

                <p className="mb-3">
                  <strong>2. REFUND POLICY</strong><br />
                  Refund on tuition fees is governed by the Law for Private Schools (Republic Act No. 6728, 1992 Manual of Regulations for Private Schools). Refund of tuition fees shall be made within two weeks after the request for withdrawal is filed. The student shall be charged in full for the first month of classes. If the student withdraws within the first week, he/she shall be charged fifty percent (50%) of the total monthly dues for the term. If he/she withdraws within the second week of classes, he/she shall be charged twenty-five percent (25%) of the total monthly dues.
                </p>

                <p className="mb-3">
                  <strong>3. GRADING AND ACADEMIC POLICIES</strong><br />
                  Students in Grade 11 and Grade 12 are subject to the academic policies set by the Department of Education and the school administration. Final grades are computed based on written works, performance tasks, and quarterly assessments. Students who fail to meet the minimum passing grade of 75 will be required to undergo remedial instruction.
                </p>

                <p className="mb-3">
                  <strong>4. ATTENDANCE POLICY</strong><br />
                  Students are required to maintain an attendance rate of at least 80% per subject per term. Failure to meet this requirement may result in being dropped from the subject and may require re-enrollment in the next term.
                </p>

                <p className="mb-3">
                  <strong>5. CODE OF CONDUCT</strong><br />
                  All enrolled students are expected to observe proper conduct as prescribed in the Student Handbook. Any violation of school policies may result in disciplinary action, suspension, or expulsion depending on the severity of the offense.
                </p>

                <p className="mb-3">
                  <strong>6. FEES AND PAYMENTS</strong><br />
                  All tuition and miscellaneous fees must be settled on or before the due dates indicated in the school calendar. Students with outstanding balances may be restricted from accessing official school records and documents until all dues are cleared.
                </p>

                <p className="mb-3">
                  <strong>7. DATA PRIVACY</strong><br />
                  The school collects, processes, and stores personal data of students and their families for legitimate educational purposes in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173). Personal data will not be disclosed to third parties without prior consent, except when required by law.
                </p>

                <p className="mb-3">
                  <strong>8. AMENDMENTS</strong><br />
                  The school reserves the right to amend these terms and conditions at any time. Students and guardians will be notified of any material changes through official school channels.
                </p>

                <div className="p-3 rounded-3 mt-3" style={{ background:"#f0f4ff", border:"1px solid #bfdbfe" }}>
                  <p className="mb-0 small text-muted fst-italic">
                    By proceeding, you acknowledge that you have read and understood the Terms and Conditions above. Your agreement will be formally confirmed in Step 3.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-top bg-light">
              {!hasScrolledTerms && (
                <div className="alert alert-info d-flex align-items-center gap-2 mb-3 py-2 small">
                  <span>📖</span> Scroll down to read all terms before continuing.
                </div>
              )}
              <div className="d-flex gap-2">
                <Link href="/" className="btn btn-outline-secondary flex-grow-1 rounded-2 fw-semibold">← Back to Home</Link>
                <button
                  type="button"
                  disabled={!hasScrolledTerms}
                  onClick={() => { setStep(2); window.scrollTo({ top:0, behavior:"smooth" }); }}
                  className="btn btn-primary flex-grow-1 rounded-2 fw-bold"
                  style={{ background:"linear-gradient(135deg,#1e40af,#dc2626)", border:"none", opacity: hasScrolledTerms ? 1 : 0.5 }}>
                  I Have Read the Terms — Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Enrollment Form ─────────────────────── */}
        {step === 2 && (
          <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
            <div className="p-4 text-white text-center" style={{ background:"linear-gradient(135deg,#1e40af,#dc2626)" }}>
              <h2 className="fw-black fs-5 mb-1">📋 Enrollment Form</h2>
              <p className="text-white-50 small mb-0">Fill in all required fields marked with *</p>
            </div>

            <form onSubmit={handleFormSubmit} className="card-body p-4">
              <div className="row g-3">

                {/* Student Status */}
                <div className="col-12">
                  <label className="form-label fw-semibold text-muted small">Student Status *</label>
                  <select name="studentStatus" value={formData.studentStatus} onChange={handleChange} className="form-select rounded-2" required>
                    <option value="">Select student status</option>
                    <option value="new">New Student</option>
                    <option value="old">Returning Student</option>
                  </select>
                </div>

                {formData.studentStatus === "old" && (
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">Student ID *</label>
                    <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="Enter your Student ID" className="form-control rounded-2" required />
                  </div>
                )}

                {/* Personal Info */}
                <div className="col-12"><hr className="my-1" /><div className="fw-bold small text-dark">Personal Information</div></div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className="form-control rounded-2" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Last Name *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className="form-control rounded-2" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-muted small">Middle Name</label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Middle name" className="form-control rounded-2" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted small">Ext. Name</label>
                  <select name="extensionName" value={formData.extensionName} onChange={handleChange} className="form-select rounded-2">
                    <option value="">None</option>
                    <option value="Jr.">Jr. (Junior)</option>
                    <option value="Sr.">Sr. (Senior)</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label fw-semibold text-muted small">Date of Birth *</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-control rounded-2" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="form-select rounded-2" required>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Civil Status *</label>
                  <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} className="form-select rounded-2" required>
                    <option value="">Select civil status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Nationality *</label>
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g., Filipino" className="form-control rounded-2" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Religion *</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} placeholder="e.g., Roman Catholic" className="form-control rounded-2" required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-muted small">Address *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address, city, province" className="form-control rounded-2" required />
                </div>

                {/* Contact */}
                <div className="col-12"><hr className="my-1" /><div className="fw-bold small text-dark">Contact Information</div></div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" className="form-control rounded-2" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+63 9XX XXX XXXX" className="form-control rounded-2" required />
                </div>

                {/* Academic */}
                <div className="col-12"><hr className="my-1" /><div className="fw-bold small text-dark">Academic Information</div></div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Track *</label>
                  <select name="track" value={formData.track} onChange={handleChange} className="form-select rounded-2" required>
                    <option value="">Select a track</option>
                    <option value="Academic">Academic Track</option>
                    <option value="TechPro">Tech-Voc Track</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Strand *</label>
                  <select name="strand" value={formData.strand} onChange={handleChange} className="form-select rounded-2" required disabled={!formData.track}>
                    <option value="">{!formData.track ? "Select a track first" : "Select a strand"}</option>
                    {formData.track === "Academic" && [
                      <option key="STEM" value="STEM">STEM</option>,
                      <option key="HUMSS" value="HUMSS">HUMSS</option>,
                      <option key="ABM" value="ABM">ABM</option>,
                    ]}
                    {formData.track === "TechPro" && [
                      <option key="ICT" value="ICT">ICT</option>,
                      <option key="Cookery" value="Cookery">Cookery</option>,
                    ]}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Grade Level *</label>
                  <select name="year" value={formData.year} onChange={handleChange} className="form-select rounded-2" required>
                    <option value="">Select grade level</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-muted small">Learning Modality *</label>
                  <select name="learningModality" value={formData.learningModality} onChange={handleChange} className="form-select rounded-2" required>
                    <option value="">Select learning modality</option>
                    <option value="Face-to-Face">Face-to-Face</option>
                    <option value="Modular">Modular (Distance Learning)</option>
                    <option value="Blended">Blended Learning</option>
                  </select>
                </div>

                {/* Family */}
                <div className="col-12"><hr className="my-1" /><div className="fw-bold small text-dark">Family Information</div></div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Father&apos;s Name</label>
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father's full name" className="form-control rounded-2" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Father&apos;s Occupation</label>
                  <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="Occupation" className="form-control rounded-2" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Mother&apos;s Name</label>
                  <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Mother's full name" className="form-control rounded-2" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Mother&apos;s Occupation</label>
                  <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} placeholder="Occupation" className="form-control rounded-2" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Guardian Name</label>
                  <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="Guardian's full name" className="form-control rounded-2" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Guardian Relation</label>
                  <input type="text" name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} placeholder="e.g., Aunt, Uncle" className="form-control rounded-2" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Guardian Phone</label>
                  <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} placeholder="+63 9XX XXX XXXX" className="form-control rounded-2" />
                </div>

                {/* Previous School */}
                <div className="col-12"><hr className="my-1" /><div className="fw-bold small text-dark">Previous School</div></div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">School Name</label>
                  <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleChange} placeholder="Name of previous school" className="form-control rounded-2" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">Years Attended</label>
                  <input type="text" name="yearsAttended" value={formData.yearsAttended} onChange={handleChange} placeholder="e.g., 2020–2024" className="form-control rounded-2" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-muted small">School Address</label>
                  <input type="text" name="previousSchoolAddress" value={formData.previousSchoolAddress} onChange={handleChange} placeholder="Address of previous school" className="form-control rounded-2" />
                </div>

                {/* Photo */}
                <div className="col-12"><hr className="my-1" /><div className="fw-bold small text-dark">ID Photo</div></div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-muted small">2×2 ID Photo *</label>
                  <input type="file" name="idPhoto" onChange={handleChange} accept="image/*" className="form-control rounded-2" required />
                  <small className="form-text text-muted">Upload a 2×2 inch ID photo (JPG or PNG). Max 5 MB.</small>
                  {formData.idPhoto && (
                    <div className="mt-2">
                      <div className="text-success small mb-1">✓ {formData.idPhoto.name}</div>
                      <img src={URL.createObjectURL(formData.idPhoto)} alt="ID Preview" className="rounded-2" style={{ maxWidth:120, maxHeight:120, objectFit:"cover" }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="d-flex gap-2 mt-4">
                <button type="button" onClick={() => { setStep(1); window.scrollTo({ top:0, behavior:"smooth" }); }} className="btn btn-outline-secondary rounded-2 fw-semibold">← Back</button>
                <button type="submit" className="btn btn-primary flex-grow-1 rounded-2 fw-bold" style={{ background:"linear-gradient(135deg,#1e40af,#dc2626)", border:"none" }}>
                  Continue to Declaration →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: Declaration / I hereby agree ───────── */}
        {step === 3 && (
          <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
            <div className="p-4 text-white text-center" style={{ background:"linear-gradient(135deg,#1e40af,#dc2626)" }}>
              <h2 className="fw-black fs-5 mb-1">✍️ Student Declaration</h2>
              <p className="text-white-50 small mb-0">Please read and confirm the declaration below</p>
            </div>

            <div className="card-body p-4">
              {/* Declaration text */}
              <div className="rounded-3 p-4 mb-4" style={{ background:"#f8fafc", border:"1.5px solid #e2e8f0" }}>
                <p className="fw-semibold text-dark mb-3" style={{ lineHeight:1.8 }}>
                  I hereby agree to the terms and conditions of <strong>Cebu Far East Institute</strong> and certify that all the information I have provided in this enrollment form is <strong>true, accurate, and complete</strong> to the best of my knowledge.
                </p>
                <p className="text-muted small mb-3" style={{ lineHeight:1.7 }}>
                  I understand that providing false or misleading information may result in the cancellation of my enrollment and other disciplinary actions as deemed appropriate by the school administration.
                </p>
                <p className="text-muted small mb-0" style={{ lineHeight:1.7 }}>
                  I also give my consent to the processing of my personal data for enrollment and school administration purposes, in accordance with the <strong>Data Privacy Act of 2012</strong>.
                </p>
              </div>

              {/* Checkbox */}
              <div className="d-flex align-items-start gap-3 p-3 rounded-3 mb-4" style={{ background: agreedToTerms ? "rgba(16,185,129,0.08)" : "rgba(220,38,38,0.04)", border: agreedToTerms ? "1.5px solid rgba(16,185,129,0.3)" : "1.5px solid rgba(220,38,38,0.2)", transition:"all 0.3s" }}>
                <input
                  type="checkbox"
                  id="agreeDeclaration"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  style={{ width:20, height:20, flexShrink:0, marginTop:2, cursor:"pointer", accentColor:"#10b981" }}
                />
                <label className="fw-bold text-dark mb-0" htmlFor="agreeDeclaration" style={{ cursor:"pointer", lineHeight:1.6 }}>
                  I hereby agree to the terms and conditions of the school and certify that the information provided is true and correct.
                </label>
              </div>

              <div className="d-flex gap-2">
                <button type="button" onClick={() => { setStep(2); window.scrollTo({ top:0, behavior:"smooth" }); }} className="btn btn-outline-secondary rounded-2 fw-semibold">← Back</button>
                <button
                  type="button"
                  disabled={!agreedToTerms}
                  onClick={() => { setStep(4); window.scrollTo({ top:0, behavior:"smooth" }); }}
                  className="btn btn-primary flex-grow-1 rounded-2 fw-bold"
                  style={{ background: agreedToTerms ? "linear-gradient(135deg,#1e40af,#dc2626)" : undefined, border:"none" }}>
                  I Agree — Review My Information →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Review & Confirm ────────────────────── */}
        {step === 4 && (
          <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
            <div className="p-4 text-white text-center" style={{ background:"linear-gradient(135deg,#1e40af,#dc2626)" }}>
              <h2 className="fw-black fs-5 mb-1">🔍 Review Your Information</h2>
              <p className="text-white-50 small mb-0">Check everything carefully. Click "Edit" to go back and make changes.</p>
            </div>

            <div className="card-body p-4">

              {/* Review sections */}
              {[
                {
                  title: "Personal Information",
                  fields: [
                    ["Full Name", `${formData.firstName} ${formData.middleName ? formData.middleName+" " : ""}${formData.lastName}${formData.extensionName ? " "+formData.extensionName : ""}`],
                    ["Date of Birth", formData.dateOfBirth],
                    ["Gender", formData.gender],
                    ["Civil Status", formData.civilStatus],
                    ["Nationality", formData.nationality],
                    ["Religion", formData.religion],
                    ["Address", formData.address],
                  ],
                },
                {
                  title: "Contact Information",
                  fields: [
                    ["Email", formData.email],
                    ["Phone", formData.phone],
                  ],
                },
                {
                  title: "Academic Information",
                  fields: [
                    ["Student Status", formData.studentStatus === "new" ? "New Student" : "Returning Student"],
                    ...(formData.studentStatus === "old" ? [["Student ID", formData.studentId] as [string,string]] : []),
                    ["Track", formData.track],
                    ["Strand", formData.strand],
                    ["Grade Level", `Grade ${formData.year}`],
                    ["Learning Modality", formData.learningModality],
                  ],
                },
                {
                  title: "Family Information",
                  fields: [
                    ["Father's Name", formData.fatherName || "—"],
                    ["Father's Occupation", formData.fatherOccupation || "—"],
                    ["Mother's Name", formData.motherName || "—"],
                    ["Mother's Occupation", formData.motherOccupation || "—"],
                    ["Guardian", formData.guardianName ? `${formData.guardianName} (${formData.guardianRelation})` : "—"],
                    ["Guardian Phone", formData.guardianPhone || "—"],
                  ],
                },
                {
                  title: "Previous School",
                  fields: [
                    ["School Name", formData.previousSchool || "—"],
                    ["School Address", formData.previousSchoolAddress || "—"],
                    ["Years Attended", formData.yearsAttended || "—"],
                  ],
                },
              ].map(section => (
                <div key={section.title} className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="fw-bold small text-dark">{section.title}</div>
                    <button type="button" onClick={() => { setStep(2); window.scrollTo({ top:0, behavior:"smooth" }); }} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }}>✏️ Edit</button>
                  </div>
                  <div className="rounded-3 overflow-hidden border">
                    {section.fields.map(([label, value], i) => (
                      <div key={label} className={`d-flex gap-3 px-3 py-2 ${i % 2 === 0 ? "bg-light" : "bg-white"}`}>
                        <span className="text-muted small flex-shrink-0" style={{ minWidth:160 }}>{label}</span>
                        <span className="small fw-semibold text-dark">{value || <span className="text-muted fst-italic">Not provided</span>}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* ID Photo preview */}
              {formData.idPhoto && (
                <div className="mb-4">
                  <div className="fw-bold small text-dark mb-2">ID Photo</div>
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 border bg-light">
                    <img src={URL.createObjectURL(formData.idPhoto)} alt="ID" className="rounded-2" style={{ width:64, height:64, objectFit:"cover" }} />
                    <div className="small text-muted">{formData.idPhoto.name}</div>
                    <button type="button" onClick={() => { setStep(2); window.scrollTo({ top:0, behavior:"smooth" }); }} className="btn btn-link btn-sm p-0 text-primary ms-auto" style={{ fontSize:12 }}>✏️ Change</button>
                  </div>
                </div>
              )}

              {/* Declaration confirmation badge */}
              <div className="rounded-3 p-3 mb-4 d-flex align-items-center gap-2" style={{ background:"rgba(16,185,129,0.08)", border:"1.5px solid rgba(16,185,129,0.3)" }}>
                <span style={{ fontSize:20 }}>✅</span>
                <div className="small text-success fw-semibold">You have agreed to the Terms &amp; Conditions and signed the Declaration.</div>
              </div>

              {/* Final action buttons */}
              <div className="d-flex gap-2">
                <button type="button" onClick={() => { setStep(3); window.scrollTo({ top:0, behavior:"smooth" }); }} className="btn btn-outline-secondary rounded-2 fw-semibold">← Back</button>
                <button
                  type="button"
                  onClick={handleFinalEnroll}
                  disabled={submitting}
                  className="btn flex-grow-1 rounded-2 fw-black fs-6 text-white"
                  style={{ background:"linear-gradient(135deg,#059669,#1e40af)", border:"none", boxShadow:"0 4px 16px rgba(5,150,105,0.35)", opacity: submitting ? 0.75 : 1 }}>
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-2" role="status" /><span>Submitting...</span></>
                    : "💾 Save and Enroll"
                  }
                </button>
              </div>
              {submitError && (
                <div className="alert alert-danger mt-3 py-2 small rounded-3" role="alert">
                  ⚠️ {submitError}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
