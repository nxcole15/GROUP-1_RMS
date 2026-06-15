# INFORM — Student Information Management System

A web-based academic records and service management system for **Cebu Far East Institute (CFEI)**, designed for Senior High School (SHS) students, teachers, and administrators.

---

## 🎓 Overview

INFORM is a comprehensive platform that streamlines academic management for SHS institutions. It provides three user portals — Student, Teacher, and Admin — with an integrated system covering enrollment, grades, schedules, tuition, documents, and notifications.

---

## 🔐 Demo Credentials

### Student Login (`/login`)
| Student ID | Password | Name |
|---|---|---|
| 202400001 | jamie | Jamie Santos |
| 202400002 | maria | Maria Reyes |
| 202400003 | carlo | Carlo Dela Cruz |
| 202400004 | ana | Ana Villanueva |
| 202400005 | luis | Luis Fernandez |
| 202400006 | rosa | Rosa Bautista |
| 202400007 | mark | Mark Uy |
| 202400008 | lena | Lena Cruz |

### Teacher Login (`/teacher/login`)
| Teacher ID | Password | Name |
|---|---|---|
| T001 | maria | Maria Santos |
| T002 | juan | Juan Dela Cruz |
| T003 | ana | Ana Reyes |
| T004 | carlos | Carlos Fernandez |

### Admin Login (`/admin/login`)
| Username | Password | Role |
|---|---|---|
| admin@inform.edu | Admin@2026 | Super Admin |
| registrar@inform.edu | Reg@2026 | Registrar |
| dean@inform.edu | Dean@2026 | Dean |

---

## ✨ Features

### 🎓 Student Portal
- Personalized dashboard with quick access tiles
- View grades per term (Term 1, 2, 3) with GWA
- Term 3 grade request system
- Class schedule with room, teacher, and entry/exit times
- Tuition fee tracking — "Pay at the Registrar's Office" flow
- Document request system (TOR, Certificate, Good Standing)
- Document release date displayed after admin approval
- Notification bell with real-time dropdown (mark as read, delete, mark all)
- Dark/Light mode toggle

### 👨‍🏫 Teacher Portal
- Teacher login with dedicated portal
- Class management and grade submission
- Grade request approval/rejection panel
- Document approval panel
- Schedule overview with time in/out per subject
- Notification system

### 🛡️ Admin Portal
- Overview dashboard with active students and class average GWA
- **Students Panel** — filter by track and grade level
- **Teachers Panel** — section assignment, Full Time/Part Time status, expandable schedule with time in/out per subject
- **Grades Panel** — view grades per student
- **Grade Requests Panel** — approve/reject Term 3 grade requests
- **Document Management** — approve/reject requests with release date picker, track/grade/year visible per request; student notified with pick-up date
- **Enrollment Panel** — late enrollee badge, ID photo upload, confirm enrollment
- **Tuition Records** — search bar, track dropdown, paid/unpaid filter
- **Announcements Panel** — post and manage announcements
- Notification bell with real-time dropdown

---

## 🏫 SHS Structure

- **Tracks**: STEM, HUMMS, ABM, GAS, TVL
- **Grade Levels**: Grade 11 and Grade 12
- **Trimester System**: 3 Terms per school year
- **Student Types**: New Student / Old Student
- **Auto-generated IDs**: Student ID and LRN upon enrollment

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Bootstrap 5 + Custom CSS |
| AI Assistant | Ollama + Mistral (local) |
| Animations | CSS keyframes + requestAnimationFrame |
| State | React useState (client-side) |

---

## 🤖 JOBERT AI Assistant

JOBERT is powered by **Ollama running the Mistral model locally**. No internet or API key required.

```bash
# Start Ollama server
ollama serve

# Pull Mistral model (~4.4GB, one time)
ollama pull mistral
```

JOBERT appears on the student dashboard and helps with grades, schedule, tuition, enrollment, and general academic questions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Zoi357/smart-system.git
cd smart-system

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── app/
│   ├── admin/
│   │   ├── dashboard/      # Admin dashboard (students, teachers, grades, enrollment, tuition, documents)
│   │   └── login/          # Admin login
│   ├── api/
│   │   ├── jobert/         # JOBERT AI endpoint (Ollama)
│   │   └── teacher/        # Teacher API routes
│   ├── components/
│   │   ├── InteractiveFeatures.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── SubjectsSelector.tsx
│   │   └── ThemeToggle.tsx
│   ├── dashboard/          # Student dashboard
│   ├── data/
│   │   └── subjects.ts     # SHS subjects data (122 subjects)
│   ├── enrollment/         # Enrollment form
│   ├── login/              # Student login + registrar inquiry modal
│   ├── teacher/
│   │   ├── dashboard/      # Teacher dashboard
│   │   └── login/          # Teacher login
│   ├── globals.css         # Global styles + animations
│   └── layout.tsx          # Root layout
├── public/
│   ├── cfei-logo.jpg       # CFEI logo
│   ├── newimlogo.png       # INFORM logo
│   └── jobert-avatar.png   # JOBERT avatar
└── server/                 # Backend controllers and models (placeholder)
```

---

## 🎨 Design

- Animated gradient background (light/dark modes)
- Glass morphism navbar and cards
- Loading screen with molten sun glow animation
- School name shimmer animation on loading screen
- Announcement ticker (JS-driven, smooth scroll)
- Bell icon notification dropdown (fixed position, no overflow clipping)
- Responsive layout (mobile, tablet, desktop)
- Color scheme: Blue `#1e40af`, Red `#dc2626`, Yellow `#fbbf24`

---

## ⚠️ Important Notes

> **This system is a UI prototype / demo system.**
> All credentials and student data are hardcoded. Nothing is stored in a real database.
> Data resets on page refresh.
> For production deployment, a real backend (database + authentication) must be implemented.

---

## 📝 License

Proprietary — Cebu Far East Institute Capstone 2 Project.

## 👥 Contributors

- **Development**: Zoi357
- **Original Repository**: KazukiMutsiMutsi

---

---

## 📋 Changelog

### June 16, 2026 — Enrollment Form & Student Grades Updates

#### Enrollment Form (`app/enrollment/page.tsx`)
- **Extension Name dropdown** — Added an "Ext. Name" dropdown next to the Middle Name field. Options: Jr. (Junior), Sr. (Senior), II, III, IV, Extension name appears in the Review step and Success screen as part of the full name.
- **Declaration checkbox fix** — Fixed the checkbox overlapping the label text in Step 3. Replaced Bootstrap's `form-check` layout with a manual `d-flex` layout for proper alignment.

#### Student Dashboard — My Grades (`app/dashboard/page.tsx`)
- **"Not Yet Available" state** — When a term's grades are not open yet, the Grades section now shows a clean empty state with a reminder note about the one-week grade request window.
- **Color Grading Guide** — A compact color legend is now permanently pinned in the top-right of the My Grades header, visible in every state (not available, requesting, released). Colors follow standard DepEd SHS grading: 🟢 Green = 80+ (Passed), 🟠 Orange = 75–79 (Needs Improvement / Lacking Activities), 🔴 Red = Below 75 (Failed).
- **Grade Request state** — When the admin opens the request window for a term, students see per-subject cards with a "Request Grade" button. Clicking shows a confirmation modal before sending.
- **Workflow tracker** — Once a student submits a grade request for a subject, the card shows a 5-step progress tracker: Requested → Teacher Calculating → Sent to Admin → Admin Verified → Released.
- **All-requested summary** — When all subjects have been requested, a green "All grade requests sent!" banner appears above the cards. Subject cards and their workflow trackers remain fully visible so students can track each subject's progress.
- **Term-based status** — Each term (Term 1, 2, 3) has its own independent status (`not_available`, `request_open`, `released`), controlled by a mock object on the frontend. This will be wired to an admin-set date range via the backend.

---

*Last Updated: June 16, 2026*
