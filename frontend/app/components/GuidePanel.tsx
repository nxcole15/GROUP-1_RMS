"use client";

import React, { useState } from "react";

type IconName = "book" | "home" | "users" | "settings" | "lightbulb" | "tool" | "alert" | "check" | "arrowRight" | "close";

function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  const props = {
    width: size, height: size, fill: "none", viewBox: "0 0 24 24",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, className, "aria-hidden": true as const,
  };
  switch (name) {
    case "book":          return <svg {...props}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
    case "home":          return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case "users":         return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "settings":      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"/></svg>;
    case "lightbulb":     return <svg {...props}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>;
    case "tool":          return <svg {...props}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>;
    case "alert":         return <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case "check":         return <svg {...props}><polyline points="20 6 9 17 4 12"/></svg>;
    case "arrowRight":    return <svg {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case "close":         return <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    default:              return null;
  }
}

interface GuideSection {
  title: string;
  content: string[];
}

interface GuidePanelProps {
  role: "student" | "teacher" | "principal" | "registrar" | "accounting" | "superadmin";
  type: "user" | "dashboard";
}

const GUIDE_CONTENT: Record<string, Record<string, GuideSection[]>> = {
  student: {
    user: [
      {
        title: "Getting Started",
        content: [
          "Welcome to the INFORM Student Portal! This guide will help you navigate the system.",
          "Your dashboard shows your current grades, schedule, tuition status, and notifications.",
          "Use the sidebar menu to navigate between different sections.",
          "Update your profile photo and information in the 'My Profile' section.",
        ]
      },
      {
        title: "Viewing Your Grades",
        content: [
          "Click 'My Grades' in the sidebar to view all your subject grades.",
          "Grades are organized by term (Term 1, Term 2, Term 3).",
          "You can see your overall GWA (General Weighted Average) at the top.",
          "If you have concerns about a grade, contact your teacher or registrar.",
        ]
      },
      {
        title: "Checking Your Schedule",
        content: [
          "Access your class schedule from the 'My Schedule' section.",
          "Your schedule shows the day, subject, room, time, and teacher for each class.",
          "Make sure to check for any schedule updates regularly.",
        ]
      },
      {
        title: "Managing Tuition Payments",
        content: [
          "View your tuition balance and payment history in 'Tuition Fee'.",
          "You can see total fees, amount paid, and remaining balance.",
          "Payment records show transaction dates and amounts.",
        ]
      },
      {
        title: "Requesting Documents",
        content: [
          "Go to 'Documents' to request official school documents.",
          "Available documents include: Transcript of Records (TOR), Form 137, Form 138, Certificate of Good Moral Character, and more.",
          "Track your document request status (pending, processing, ready for pickup).",
          "You'll receive notifications when documents are ready.",
        ]
      },
    ],
    dashboard: [
      {
        title: "Dashboard Overview",
        content: [
          "Your dashboard provides a quick overview of your academic status.",
          "View key stats: General Average, Tuition Paid, Balance Due, and Pending Documents.",
          "Recent grades are displayed for quick access.",
          "Check your enrolled subjects and units.",
        ]
      },
      {
        title: "Quick Actions",
        content: [
          "Use quick action buttons to navigate to frequently accessed sections.",
          "Click on any stat card to view more details.",
          "Recent activity shows your latest submissions and updates.",
        ]
      },
      {
        title: "JOBERT Assistant",
        content: [
          "Click the JOBERT icon at the bottom right for AI assistance.",
          "Ask questions about grades, tuition, enrollment, and more.",
          "JOBERT can help you understand your GWA, payment deadlines, and document procedures.",
        ]
      },
    ]
  },
  teacher: {
    user: [
      {
        title: "Getting Started",
        content: [
          "Welcome to the INFORM Teacher Portal! This guide will help you manage your classes effectively.",
          "Your dashboard shows your assigned subjects, students, and grade submission status.",
          "Use the sidebar to access different sections: Overview, Schedule, Students, Grades, and Requests.",
        ]
      },
      {
        title: "Managing Students",
        content: [
          "View all your enrolled students in the 'My Students' section.",
          "See student information including ID, name, pathway, grade level, and status.",
          "Filter students by subject to view class-specific rosters.",
        ]
      },
      {
        title: "Submitting Grades",
        content: [
          "Navigate to 'Submit Grades' to enter student grades.",
          "Select the term, subject, and student to submit grades.",
          "Enter percentage grades (0-100) for each student.",
          "Grades are automatically locked after the term deadline passes.",
          "For late submissions, contact the Registrar's Office for approval.",
        ]
      },
      {
        title: "Grade Requests",
        content: [
          "View and respond to grade change requests in 'Grade Requests'.",
          "You can approve or deny requests with comments.",
          "All grade changes require registrar approval after your review.",
        ]
      },
      {
        title: "Viewing Your Schedule",
        content: [
          "Access your teaching schedule in 'My Schedule'.",
          "View your classes organized by day of the week.",
          "Each entry shows subject, room, time, and enrolled students.",
        ]
      },
    ],
    dashboard: [
      {
        title: "Dashboard Overview",
        content: [
          "Your overview shows key metrics: Total Students, Class Average Grade, Pending Requests, and Active Term.",
          "Recent activity displays your latest grade submissions and approvals.",
          "Class summary shows all assigned subjects with enrollment counts.",
        ]
      },
      {
        title: "Grade Submission Status",
        content: [
          "Monitor grade submission deadlines for the active term.",
          "A warning banner appears when the deadline has passed.",
          "Locked grade submission requires registrar office visit for special access.",
        ]
      },
    ]
  },
  principal: {
    user: [
      {
        title: "Principal Portal Guide",
        content: [
          "Welcome to the INFORM Principal Dashboard! You have full administrative access.",
          "Monitor school-wide statistics, enrollment, grades, and operations.",
          "Use this portal to oversee all academic and administrative functions.",
        ]
      },
      {
        title: "Managing Students",
        content: [
          "View, search, and manage all student records.",
          "Filter students by track, grade level, and status.",
          "Access detailed student profiles including grades, attendance, and payments.",
        ]
      },
      {
        title: "Managing Teachers",
        content: [
          "View all teacher records and their assigned subjects.",
          "Monitor teacher performance and student feedback.",
          "Manage teacher schedules and room assignments.",
        ]
      },
      {
        title: "Grade Management",
        content: [
          "Oversee all grade submissions across all subjects.",
          "Review and approve grade change requests.",
          "Generate grade reports and analytics.",
        ]
      },
      {
        title: "Enrollment Management",
        content: [
          "Review and approve student enrollment applications.",
          "Monitor enrollment statistics by track and grade level.",
          "Manage enrollment periods and deadlines.",
        ]
      },
      {
        title: "Document Management",
        content: [
          "Oversee all document requests from students.",
          "Approve or deny document release.",
          "Track document processing workflow.",
        ]
      },
      {
        title: "Settings & Configuration",
        content: [
          "Configure academic year and term settings.",
          "Manage school-wide announcements.",
          "Set deadlines for grade submissions and enrollment.",
          "Configure system parameters and preferences.",
        ]
      },
    ],
    dashboard: [
      {
        title: "Principal Dashboard Overview",
        content: [
          "View comprehensive school statistics: Active Students, Class Average GWA, Pending Enrollments, and Pending Payments.",
          "Monitor recent activity across all departments.",
          "Enrollment insights show distribution by track, grade level, and gender.",
        ]
      },
      {
        title: "Quick Navigation",
        content: [
          "Use the sidebar to quickly access any administrative function.",
          "Click on stat cards to drill down into detailed reports.",
          "Recent activity feed keeps you updated on school operations.",
        ]
      },
    ]
  },
  registrar: {
    user: [
      {
        title: "Registrar Portal Guide",
        content: [
          "Welcome to the INFORM Registrar Dashboard!",
          "You are responsible for enrollment, document processing, and grade management.",
          "Use this portal to manage student records and official documents.",
        ]
      },
      {
        title: "Enrollment Management",
        content: [
          "Review incoming enrollment applications.",
          "Approve or deny applications based on requirements.",
          "Assign students to sections and schedules.",
          "Monitor enrollment statistics and capacity.",
        ]
      },
      {
        title: "Document Processing",
        content: [
          "Process student requests for official documents (TOR, Form 137, Form 138, etc.).",
          "Verify student eligibility for document requests.",
          "Approve document release and set pickup dates.",
          "Track document request workflow and status.",
        ]
      },
      {
        title: "Grade Management",
        content: [
          "Oversee all grade submissions from teachers.",
          "Review and approve grade change requests.",
          "Unlock grade submission for teachers after deadlines (when necessary).",
          "Generate official grade reports and transcripts.",
        ]
      },
      {
        title: "Scheduling",
        content: [
          "Manage class schedules and room assignments.",
          "Assign teachers to subjects and sections.",
          "Resolve scheduling conflicts.",
        ]
      },
    ],
    dashboard: [
      {
        title: "Registrar Dashboard Overview",
        content: [
          "Monitor key metrics: Active Students, Average GWA, Pending Enrollments, and Pending Documents.",
          "Track recent registrar activities and approvals.",
          "View enrollment distribution and trends.",
        ]
      },
    ]
  },
  accounting: {
    user: [
      {
        title: "Accounting Portal Guide",
        content: [
          "Welcome to the INFORM Accounting Dashboard!",
          "You are responsible for tuition management, payment processing, and financial records.",
          "Use this portal to manage student payments and generate financial reports.",
        ]
      },
      {
        title: "Tuition Management",
        content: [
          "View all student tuition accounts and balances.",
          "Process tuition payments (cash, check, online).",
          "Issue official receipts for payments.",
          "Track payment history and outstanding balances.",
        ]
      },
      {
        title: "Payment Processing",
        content: [
          "Record new tuition payments for students.",
          "Apply payments to student accounts.",
          "Handle partial payments and payment plans.",
          "Generate payment receipts and confirmations.",
        ]
      },
      {
        title: "Financial Reporting",
        content: [
          "Generate financial reports by term, grade level, or track.",
          "View collection summaries and outstanding balances.",
          "Export financial data for auditing and analysis.",
        ]
      },
    ],
    dashboard: [
      {
        title: "Accounting Dashboard Overview",
        content: [
          "View financial statistics: Total Collections, Outstanding Balances, Pending Payments.",
          "Monitor recent payment transactions.",
          "Track tuition payment trends and collection rates.",
        ]
      },
    ]
  },
  superadmin: {
    user: [
      {
        title: "Super Admin Guide",
        content: [
          "Welcome to the INFORM Super Admin Dashboard! You have full system access.",
          "Monitor all system operations, users, and configurations.",
          "Use this portal to manage the entire school information system.",
        ]
      },
      {
        title: "User Management",
        content: [
          "Create and manage user accounts for all roles (students, teachers, administrators).",
          "Reset passwords and manage access permissions.",
          "Monitor user activity and login history.",
        ]
      },
      {
        title: "System Configuration",
        content: [
          "Configure academic year and term settings.",
          "Set system-wide deadlines and parameters.",
          "Manage school information and branding.",
          "Configure notification settings.",
        ]
      },
      {
        title: "Data Management",
        content: [
          "Import/export student and teacher data.",
          "Backup and restore system data.",
          "Generate comprehensive system reports.",
        ]
      },
      {
        title: "Audit & Monitoring",
        content: [
          "View system audit logs and user activities.",
          "Monitor system performance and errors.",
          "Track critical operations and changes.",
        ]
      },
    ],
    dashboard: [
      {
        title: "Super Admin Dashboard Overview",
        content: [
          "Comprehensive view of all system metrics and operations.",
          "Monitor all users, records, and activities.",
          "Access all administrative functions from a single dashboard.",
        ]
      },
    ]
  },
};

const FEATURES_CONTENT = [
  {
    title: "Academic Management",
    features: [
      "Grade tracking and GWA calculation",
      "Subject enrollment and scheduling",
      "Attendance monitoring",
      "Academic performance analytics",
    ]
  },
  {
    title: "Student Services",
    features: [
      "Online enrollment and application",
      "Document request system (TOR, Forms 137/138, Good Moral, etc.)",
      "Tuition payment tracking",
      "Real-time notifications",
    ]
  },
  {
    title: "Teacher Tools",
    features: [
      "Grade submission and management",
      "Student roster and attendance",
      "Grade request processing",
      "Class schedule management",
    ]
  },
  {
    title: "Administrative Features",
    features: [
      "Enrollment management and approval",
      "Document workflow processing",
      "Financial reporting and payment tracking",
      "User and access management",
    ]
  },
  {
    title: "Communication",
    features: [
      "System-wide announcements",
      "Email notifications",
      "JOBERT AI Assistant for students",
      "Real-time activity feed",
    ]
  },
];

const QUICK_REFERENCE = [
  {
    category: "Navigation",
    items: [
      "Use the sidebar menu to access different sections",
      "Click on stat cards for detailed views",
      "Use search filters to find specific records",
      "Profile menu in top-right for account settings",
    ]
  },
  {
    category: "Common Tasks",
    items: [
      "Student: View grades → My Grades section",
      "Teacher: Submit grades → Submit Grades section",
      "Admin: Approve enrollment → Enrollment section",
      "Registrar: Process documents → Documents section",
    ]
  },
  {
    category: "Keyboard Shortcuts",
    items: [
      "Ctrl + S: Save changes (when editing)",
      "Esc: Close modal or panel",
      "Ctrl + F: Search within current page",
    ]
  },
];

const TROUBLESHOOTING = [
  {
    issue: "Cannot log in to the system",
    solutions: [
      "Verify your username and password are correct",
      "Check if Caps Lock is on",
      "Clear browser cache and cookies",
      "Try a different web browser",
      "Contact your administrator if you forgot your password",
    ]
  },
  {
    issue: "Grades not showing",
    solutions: [
      "Ensure you're viewing the correct term",
      "Check if grades have been submitted by your teacher",
      "Refresh the page (press F5)",
      "Contact your teacher or registrar if grades should be visible",
    ]
  },
  {
    issue: "Cannot submit grades (Teachers)",
    solutions: [
      "Check if the grade submission deadline has passed",
      "Verify you have selected the correct term and subject",
      "Ensure all required fields are filled",
      "Contact the Registrar's Office if deadline has passed",
    ]
  },
  {
    issue: "Document request is pending too long",
    solutions: [
      "Check the status in Documents section",
      "Verify all requirements were submitted",
      "Contact the Registrar's Office for update",
      "Allow 3-5 business days for processing",
    ]
  },
  {
    issue: "Payment not reflected in account",
    solutions: [
      "Wait 24 hours for payment processing",
      "Verify payment was made to the correct account",
      "Keep your receipt as proof of payment",
      "Contact the Accounting Office with receipt",
    ]
  },
  {
    issue: "Profile photo not updating",
    solutions: [
      "Ensure image is in JPG, PNG, or GIF format",
      "Check that image file size is under 5MB",
      "Clear browser cache and try again",
      "Try uploading a different image",
    ]
  },
  {
    issue: "Page loading slowly or not loading",
    solutions: [
      "Check your internet connection",
      "Refresh the page (F5 or Ctrl+R)",
      "Clear browser cache and cookies",
      "Try a different web browser",
      "Check if there's scheduled maintenance",
    ]
  },
];

export function GuidePanel({ role, type }: GuidePanelProps) {
  const guideContent = GUIDE_CONTENT[role]?.[type] || [];

  return (
    <div className="guide-document-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Document Header */}
      <div className="guide-document-header" style={{ 
        background: "#1f2937",
        padding: "3rem 2.5rem",
        borderRadius: "12px 12px 0 0",
        color: "white",
        marginBottom: "0"
      }}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="d-flex align-items-center justify-content-center rounded-3" 
            style={{ width: 56, height: 56, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <Icon name="book" size={28} className="text-white" />
          </div>
          <div>
            <div className="text-white-50 small text-uppercase fw-semibold mb-1" style={{ letterSpacing: "1px" }}>
              {type === "user" ? "User Documentation" : "Dashboard Documentation"}
            </div>
            <h1 className="fw-bold mb-0" style={{ fontSize: "2rem", lineHeight: 1.2 }}>
              {type === "user" 
                ? `${role.charAt(0).toUpperCase() + role.slice(1)} Guide` 
                : `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard Guide`}
            </h1>
          </div>
        </div>
        <p className="mb-0 opacity-90" style={{ fontSize: "1rem", lineHeight: 1.6 }}>
          {type === "user" 
            ? `Complete reference guide for ${role} users. Learn how to navigate the system, manage your tasks, and make the most of available features.`
            : `Learn how to use your dashboard effectively. Understand key metrics, navigation, and quick actions available to you.`}
        </p>
      </div>

      {/* Document Body */}
      <div className="guide-document-body" style={{ 
        background: "white", 
        padding: "3rem 2.5rem",
        borderRadius: "0 0 12px 12px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
      }}>
        {/* Table of Contents */}
        <div className="guide-toc mb-5 pb-4" style={{ borderBottom: "2px solid #f1f5f9" }}>
          <h2 className="fw-bold mb-3" style={{ fontSize: "1.1rem", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Table of Contents
          </h2>
          <div className="d-flex flex-column gap-2">
            {guideContent.map((section, index) => (
              <a 
                key={index}
                href={`#section-${index}`}
                className="text-decoration-none d-flex align-items-center gap-2 py-2 px-3 rounded-2"
                style={{ 
                  color: "#475569",
                  fontSize: "0.95rem",
                  transition: "all 0.2s",
                  background: "transparent"
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.background = "#f8fafc"; 
                  e.currentTarget.style.paddingLeft = "1rem";
                  e.currentTarget.style.color = "#1f2937";
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.background = "transparent"; 
                  e.currentTarget.style.paddingLeft = "0.75rem";
                  e.currentTarget.style.color = "#475569";
                }}>
                <span className="fw-semibold" style={{ minWidth: "2rem" }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="guide-content">
          {guideContent.map((section, index) => (
            <div 
              key={index} 
              id={`section-${index}`}
              className="guide-section mb-5"
              style={{ scrollMarginTop: "2rem" }}
            >
              {/* Section Header */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                  style={{ 
                    width: 48, 
                    height: 48, 
                    background: "#1f2937",
                    color: "white",
                    fontSize: "1.2rem",
                    fontWeight: "bold"
                  }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <h2 className="fw-bold mb-0" style={{ fontSize: "1.5rem", color: "#1e293b" }}>
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Section Content */}
              <div className="section-content" style={{ paddingLeft: "0rem" }}>
                {section.content.map((item, i) => (
                  <div 
                    key={i} 
                    className="content-item d-flex gap-3 mb-3 p-3 rounded-3"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                  >
                    <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
                      <Icon name="check" size={20} style={{ color: "#1f2937" }} />
                    </div>
                    <p className="mb-0" style={{ 
                      color: "#334155", 
                      fontSize: "0.95rem", 
                      lineHeight: 1.7,
                      flex: 1
                    }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              {/* Section Divider */}
              {index < guideContent.length - 1 && (
                <hr className="my-5" style={{ 
                  border: "none", 
                  height: "2px", 
                  background: "linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)" 
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="guide-footer mt-5 pt-4" style={{ borderTop: "2px solid #f1f5f9" }}>
          <div className="alert mb-0" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
            <div className="d-flex gap-3">
              <div className="flex-shrink-0">
                <Icon name="lightbulb" size={24} style={{ color: "#1f2937" }} />
              </div>
              <div>
                <h6 className="fw-bold mb-2" style={{ color: "#1e293b" }}>Need More Help?</h6>
                <p className="mb-0 small" style={{ color: "#475569", lineHeight: 1.6 }}>
                  If you need additional assistance or have questions not covered in this guide, please contact your system administrator or visit the school office during business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesPanel() {
  return (
    <div className="guide-document-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Document Header */}
      <div className="guide-document-header" style={{ 
        background: "#1f2937",
        padding: "3rem 2.5rem",
        borderRadius: "12px 12px 0 0",
        color: "white",
        marginBottom: "0"
      }}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="d-flex align-items-center justify-content-center rounded-3" 
            style={{ width: 56, height: 56, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <Icon name="lightbulb" size={28} className="text-white" />
          </div>
          <div>
            <div className="text-white-50 small text-uppercase fw-semibold mb-1" style={{ letterSpacing: "1px" }}>
              System Documentation
            </div>
            <h1 className="fw-bold mb-0" style={{ fontSize: "2rem", lineHeight: 1.2 }}>
              System Features
            </h1>
          </div>
        </div>
        <p className="mb-0 opacity-90" style={{ fontSize: "1rem", lineHeight: 1.6 }}>
          Comprehensive overview of all features available in the INFORM School Management System. Discover what the system can do for you.
        </p>
      </div>

      {/* Document Body */}
      <div className="guide-document-body" style={{ 
        background: "white", 
        padding: "3rem 2.5rem",
        borderRadius: "0 0 12px 12px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
      }}>
        <div className="guide-content">
          {FEATURES_CONTENT.map((category, index) => (
            <div key={index} className="guide-section mb-5">
              {/* Section Header */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                  style={{ 
                    width: 48, 
                    height: 48, 
                    background: "#1f2937",
                    color: "white"
                  }}>
                  <Icon name="check" size={24} />
                </div>
                <div>
                  <h2 className="fw-bold mb-0" style={{ fontSize: "1.5rem", color: "#1e293b" }}>
                    {category.title}
                  </h2>
                </div>
              </div>

              {/* Features Grid */}
              <div className="row g-3">
                {category.features.map((feature, i) => (
                  <div key={i} className="col-12 col-md-6">
                    <div className="d-flex gap-3 p-3 rounded-3 h-100" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 24, height: 24, background: "#1f2937" }}>
                          <Icon name="check" size={14} className="text-white" />
                        </div>
                      </div>
                      <p className="mb-0" style={{ color: "#334155", fontSize: "0.95rem", lineHeight: 1.6 }}>
                        {feature}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section Divider */}
              {index < FEATURES_CONTENT.length - 1 && (
                <hr className="my-5" style={{ 
                  border: "none", 
                  height: "2px", 
                  background: "linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)" 
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="guide-footer mt-5 pt-4" style={{ borderTop: "2px solid #f1f5f9" }}>
          <div className="alert mb-0" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
            <div className="d-flex gap-3">
              <div className="flex-shrink-0">
                <Icon name="lightbulb" size={24} style={{ color: "#1f2937" }} />
              </div>
              <div>
                <h6 className="fw-bold mb-2" style={{ color: "#1e293b" }}>Continuous Improvement</h6>
                <p className="mb-0 small" style={{ color: "#475569", lineHeight: 1.6 }}>
                  We're constantly adding new features and improving existing ones. Check back regularly for updates and enhancements to the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuickReferencePanel() {
  return (
    <div className="guide-document-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Document Header */}
      <div className="guide-document-header" style={{ 
        background: "#1f2937",
        padding: "3rem 2.5rem",
        borderRadius: "12px 12px 0 0",
        color: "white",
        marginBottom: "0"
      }}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="d-flex align-items-center justify-content-center rounded-3" 
            style={{ width: 56, height: 56, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <Icon name="lightbulb" size={28} className="text-white" />
          </div>
          <div>
            <div className="text-white-50 small text-uppercase fw-semibold mb-1" style={{ letterSpacing: "1px" }}>
              Reference Documentation
            </div>
            <h1 className="fw-bold mb-0" style={{ fontSize: "2rem", lineHeight: 1.2 }}>
              Quick Reference
            </h1>
          </div>
        </div>
        <p className="mb-0 opacity-90" style={{ fontSize: "1rem", lineHeight: 1.6 }}>
          Essential tips, shortcuts, and common tasks to help you work more efficiently with the INFORM system.
        </p>
      </div>

      {/* Document Body */}
      <div className="guide-document-body" style={{ 
        background: "white", 
        padding: "3rem 2.5rem",
        borderRadius: "0 0 12px 12px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
      }}>
        <div className="guide-content">
          {QUICK_REFERENCE.map((section, index) => (
            <div key={index} className="guide-section mb-5">
              {/* Section Header */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                  style={{ 
                    width: 48, 
                    height: 48, 
                    background: "#1f2937",
                    color: "white",
                    fontSize: "1.2rem",
                    fontWeight: "bold"
                  }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <h2 className="fw-bold mb-0" style={{ fontSize: "1.5rem", color: "#1e293b" }}>
                    {section.category}
                  </h2>
                </div>
              </div>

              {/* Reference Items */}
              <div className="section-content">
                {section.items.map((item, i) => (
                  <div 
                    key={i} 
                    className="content-item d-flex gap-3 mb-3 p-3 rounded-3"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                  >
                    <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
                      <Icon name="arrowRight" size={18} style={{ color: "#1f2937" }} />
                    </div>
                    <p className="mb-0" style={{ 
                      color: "#334155", 
                      fontSize: "0.95rem", 
                      lineHeight: 1.7,
                      flex: 1
                    }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              {/* Section Divider */}
              {index < QUICK_REFERENCE.length - 1 && (
                <hr className="my-5" style={{ 
                  border: "none", 
                  height: "2px", 
                  background: "linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)" 
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="guide-footer mt-5 pt-4" style={{ borderTop: "2px solid #f1f5f9" }}>
          <div className="alert mb-0" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
            <div className="d-flex gap-3">
              <div className="flex-shrink-0">
                <Icon name="lightbulb" size={24} style={{ color: "#1f2937" }} />
              </div>
              <div>
                <h6 className="fw-bold mb-2" style={{ color: "#1e293b" }}>Pro Tip</h6>
                <p className="mb-0 small" style={{ color: "#475569", lineHeight: 1.6 }}>
                  Bookmark this page for quick access to common tasks and shortcuts. The more you use these tips, the more efficient you'll become!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TroubleshootingPanel() {
  return (
    <div className="guide-document-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Document Header */}
      <div className="guide-document-header" style={{ 
        background: "#1f2937",
        padding: "3rem 2.5rem",
        borderRadius: "12px 12px 0 0",
        color: "white",
        marginBottom: "0"
      }}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="d-flex align-items-center justify-content-center rounded-3" 
            style={{ width: 56, height: 56, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <Icon name="tool" size={28} className="text-white" />
          </div>
          <div>
            <div className="text-white-50 small text-uppercase fw-semibold mb-1" style={{ letterSpacing: "1px" }}>
              Support Documentation
            </div>
            <h1 className="fw-bold mb-0" style={{ fontSize: "2rem", lineHeight: 1.2 }}>
              Troubleshooting Guide
            </h1>
          </div>
        </div>
        <p className="mb-0 opacity-90" style={{ fontSize: "1rem", lineHeight: 1.6 }}>
          Solutions to common issues and problems you may encounter while using the INFORM system. Find quick fixes and workarounds here.
        </p>
      </div>

      {/* Document Body */}
      <div className="guide-document-body" style={{ 
        background: "white", 
        padding: "3rem 2.5rem",
        borderRadius: "0 0 12px 12px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
      }}>
        <div className="guide-content">
          {TROUBLESHOOTING.map((item, index) => (
            <div key={index} className="guide-section mb-5">
              {/* Issue Header */}
              <div className="d-flex align-items-start gap-3 mb-4 p-4 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
                  <Icon name="alert" size={24} style={{ color: "#1f2937" }} />
                </div>
                <div className="flex-grow-1">
                  <h2 className="fw-bold mb-1" style={{ fontSize: "1.3rem", color: "#1e293b" }}>
                    {item.issue}
                  </h2>
                  <p className="mb-0 small" style={{ color: "#475569" }}>Common Issue #{index + 1}</p>
                </div>
              </div>

              {/* Solutions */}
              <div className="section-content" style={{ paddingLeft: "0rem" }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="d-flex align-items-center justify-content-center rounded-2" 
                    style={{ width: 32, height: 32, background: "#e2e8f0" }}>
                    <Icon name="check" size={18} style={{ color: "#1f2937" }} />
                  </div>
                  <h3 className="fw-bold mb-0" style={{ fontSize: "1.1rem", color: "#1e293b" }}>
                    Solutions
                  </h3>
                </div>

                <div className="d-flex flex-column gap-3">
                  {item.solutions.map((solution, i) => (
                    <div 
                      key={i} 
                      className="content-item d-flex gap-3 p-3 rounded-3"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                    >
                      <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ 
                          width: 28, 
                          height: 28, 
                          background: "#1f2937",
                          color: "white",
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                          minWidth: 28
                        }}>
                        {i + 1}
                      </div>
                      <p className="mb-0" style={{ 
                        color: "#334155", 
                        fontSize: "0.95rem", 
                        lineHeight: 1.7,
                        flex: 1
                      }}>
                        {solution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Divider */}
              {index < TROUBLESHOOTING.length - 1 && (
                <hr className="my-5" style={{ 
                  border: "none", 
                  height: "2px", 
                  background: "linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)" 
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="guide-footer mt-5 pt-4" style={{ borderTop: "2px solid #f1f5f9" }}>
          <div className="alert mb-0" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
            <div className="d-flex gap-3">
              <div className="flex-shrink-0">
                <Icon name="alert" size={24} style={{ color: "#1f2937" }} />
              </div>
              <div>
                <h6 className="fw-bold mb-2" style={{ color: "#1e293b" }}>Still Need Help?</h6>
                <p className="mb-0 small" style={{ color: "#475569", lineHeight: 1.6 }}>
                  If none of these solutions work or you're experiencing a different issue, please contact your system administrator or visit the school office during business hours (Monday-Friday, 8:00 AM - 5:00 PM). Have your error message and steps to reproduce the issue ready when you reach out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
