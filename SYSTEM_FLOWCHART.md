# CEBU FAR EAST INSTITUTE - STUDENT INFORMATION SYSTEM
## User Flowchart & Role Architecture

---

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LANDING PAGE (Public)                             │
│  - Home (/), Visit Us, Enrollment Form                              │
└────────────┬────────────────────────────────────────────────────────┘
             │
             ├─────────────────────────────────────────┬───────────────┬──────────────┐
             │                                         │               │              │
             ▼                                         ▼               ▼              ▼
     ┌──────────────┐              ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
     │   STUDENTS   │              │   TEACHERS   │  │ PRINCIPAL│  │REGISTRAR │  │ACCOUNTING│
     │   /login     │              │/teacher/login│  │/admin/   │  │/admin/   │  │/accounting│
     │              │              │              │  │login     │  │login     │  │/login    │
     └──────┬───────┘              └──────┬───────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
            │                             │              │              │             │
            │ ID: 8-12 digits            │ ID: T00X     │ ID:ADMIN001  │ ID:ADMIN002 │ ID:ADMIN003
            │ e.g., 202500001           │              │              │             │
            │                            │              │              │             │
            └────────────────┬───────────┴──────────────┴──────────────┴─────────────┘
                             │
                  ┌──────────▼──────────┐
                  │  API /auth/         │
                  │  universal-login    │
                  │  (Role Detection)   │
                  └──────────┬──────────┘
                             │
         ┌───────────────────┼───────────────────┬──────────────┬──────────────┐
         │                   │                   │              │              │
         ▼                   ▼                   ▼              ▼              ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ┌──────────────┐
    │  STUDENT    │  │   TEACHER    │  │  PRINCIPAL   │  │  REGISTRAR   │ │ ACCOUNTING   │
    │ DASHBOARD   │  │  DASHBOARD   │  │  DASHBOARD   │  │  DASHBOARD   │ │  DASHBOARD   │
    │  /dashboard │  │/teacher/     │  │/principal-   │  │/registrar-   │ │ /accounting/ │
    │             │  │dashboard     │  │dashboard     │  │dashboard     │ │ dashboard    │
    └─────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ └──────────────┘
```

---

## 👥 Detailed User Roles & Flows

### 1. **STUDENT** 👨‍🎓
- **Login ID Format:** 8-12 digit numbers (e.g., `202500001`)
- **Login Page:** `/login` (Universal)
- **Dashboard:** `/dashboard`
- **Features:**
  - View personal profile (`/dashboard/profile`)
  - View grades
  - View attendance
  - View announcements
  - Apply for enrollment (via `/enrollment`)

#### Student Enrollment Flow:
```
Student → /enrollment (Public)
    ↓
Step 1: Read Terms & Conditions
    ↓
Step 2: Fill Enrollment Form
    - Personal Info (Name, DOB, Gender, etc.)
    - Contact Info (Email, Phone)
    - Academic Info (Pathway, Track, Strand, Grade Level)
    - Family Info (Parents, Guardian)
    - Learning Modality
    ↓
Step 3: Sign Declaration
    ↓
Step 4: Review Information
    ↓
Step 5: Submit to API (/api/applications)
    ↓
Confirmation Email with Student ID + Temp Password
    ↓
Registrar Review → Principal Approval → Student Access
```

---

### 2. **TEACHER** 👨‍🏫
- **Login ID Format:** T + numbers (e.g., `T001`)
- **Login Page:** `/teacher/login`
- **Dashboard:** `/teacher/dashboard`
- **Features:**
  - Manage classes
  - Input grades
  - Track attendance
  - View student information
  - Access class management tools

#### Teacher Features Flow:
```
Teacher Login (/teacher/login)
    ↓
Teacher Dashboard (/teacher/dashboard)
    ├── Class Management
    │   ├── View assigned classes
    │   ├── Student roster
    │   └── Class details
    ├── Grades
    │   ├── Input grades
    │   ├── View grade reports
    │   └── Grade submissions
    ├── Attendance
    │   ├── Mark attendance
    │   ├── View attendance records
    │   └── Attendance reports
    └── Profile (/teacher/profile)
        └── View/Update teacher information
```

---

### 3. **PRINCIPAL** 👔 (Admin Role)
- **Login ID:** `ADMIN001`
- **Login Page:** `/admin/login`
- **Dashboard:** `/principal-dashboard` (or `/admin/principal/dashboard`)
- **Features:**
  - Approve/Reject enrollments
  - Oversee all school operations
  - View reports
  - Manage staff and students
  - System administration

#### Principal Approval Flow:
```
Registrar Forward Application → Principal Dashboard
    ↓
    ├── View pending applications
    ├── Review student details
    ├── ✓ Accept (Approve enrollment)
    │   └── Student gets access credentials
    └── ✕ Reject (Decline enrollment)
        └── Reason sent to applicant
```

---

### 4. **REGISTRAR** 📋 (Admin Role)
- **Login ID:** `ADMIN002`
- **Login Page:** `/admin/login`
- **Dashboard:** `/registrar-dashboard` (or `/admin/registrar/dashboard`)
- **Features:**
  - Review enrollment applications
  - Forward applications to Principal
  - Manage enrollment process
  - Generate enrollment reports

#### Registrar Workflow:
```
New Student Enrolls → Registrar Dashboard
    ↓
    ├── View pending applications
    ├── Verify student information
    ├── Check submitted documents
    └── Forward to Principal for final approval
        ├── ✓ Accept (if approved by Principal)
        │   └── Issue Student ID & Temp Password
        └── ✕ Reject (if rejected by Principal)
            └── Notify applicant
```

---

### 5. **ACCOUNTING** 💰 (Admin Role)
- **Login ID:** `ADMIN003`
- **Login Page:** `/accounting/login` or `/admin/login`
- **Dashboard:** `/accounting/dashboard`
- **Features:**
  - View tuition and fees
  - Process payments
  - Generate billing reports
  - Track student accounts
  - Payment history

---

### 6. **ADMIN** 🔧 (General Admin)
- **Login ID:** Any ID starting with `ADMIN` (e.g., `ADMIN004`, `ADMIN005`)
- **Login Page:** `/admin/login`
- **Dashboard:** `/admin/dashboard`
- **Features:**
  - Full system administration
  - User management
  - System settings
  - General oversight

---

## 🔐 Authentication & Data Flow

### Login Process:
```
1. User enters ID + Password
   └─ System detects role based on ID format
   
2. API Call: /api/auth/universal-login or /api/[role]/login
   ├─ Validates credentials
   ├─ Returns role, token, user data
   └─ Sets localStorage tokens

3. Role-Based Redirects:
   ├─ Student     → /dashboard
   ├─ Teacher     → /teacher/dashboard
   ├─ Principal   → /principal-dashboard
   ├─ Registrar   → /registrar-dashboard
   ├─ Accounting  → /accounting/dashboard
   └─ Admin       → /admin/dashboard
```

### Token Storage:
```
Local Storage Keys:
├─ inform_token          (Main authentication token)
├─ inform_role           (User role)
├─ inform_user           (User data object)
├─ inform_admin_token    (For: Principal, Registrar, Accounting, Admin)
└─ inform_teacher_token  (For: Teachers)
```

---

## 📊 Enrollment Application Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ STUDENT ENROLLMENT APPLICATION LIFECYCLE                    │
└─────────────────────────────────────────────────────────────┘

1. SUBMISSION PHASE (Student)
   ├─ Student fills enrollment form
   ├─ Selects: Pathway (Academic/TechPro)
   ├─ Selects: Track (STEM, HUMMS, ABM, GAS, TechPro)
   ├─ Selects: Strand (matches track)
   ├─ Selects: Grade Level (11 or 12)
   ├─ Uploads ID photo
   └─ Submits to API /api/applications

2. PENDING STATUS
   ├─ Application stored in database
   └─ Status: "Pending"

3. REGISTRAR REVIEW PHASE
   ├─ Registrar sees application in dashboard
   ├─ Reviews all submitted details
   ├─ Checks completeness
   └─ Two options:
       ├─ ✓ Accept → Forward to Principal
       └─ ✕ Reject → Applicant notified

4. PRINCIPAL APPROVAL PHASE
   ├─ Principal receives forwarded application
   ├─ Final review
   └─ Two options:
       ├─ ✓ Accept → Generate credentials
       │   ├─ Create Student ID
       │   ├─ Generate temp password
       │   └─ Send email with login credentials
       └─ ✕ Reject → Rejection reason sent

5. ACTIVE ENROLLMENT
   ├─ Student receives email with credentials
   ├─ Student logs in with provided ID & password
   └─ Gets access to: Dashboard, Grades, Attendance, etc.
```

---

## 🎯 Key Features by Role

| Feature | Student | Teacher | Principal | Registrar | Accounting |
|---------|---------|---------|-----------|-----------|-----------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Grades | ✓ | ✓ (edit) | ✓ | ✓ | - |
| Attendance | ✓ (view) | ✓ (edit) | ✓ | ✓ | - |
| Enrollment Apps | - | - | ✓ (approve) | ✓ (review) | - |
| Payments/Tuition | ✓ | - | ✓ | ✓ | ✓ |
| Student Reports | - | ✓ | ✓ | ✓ | ✓ |
| System Admin | - | - | ✓ | - | - |

---

## 📱 Academic Pathways

### ACADEMIC PATHWAY
```
Academic Pathway
├── STEM Track
│   └── Strand: STEM
│       ├─ Physics, Chemistry, Biology
│       ├─ Pre-Calculus, Engineering, Programming
│       └─ Grade Levels: 11, 12
├── HUMMS Track
│   └── Strand: HUMMS
│       ├─ History, Geography, Economics
│       ├─ Psychology, Philosophy, Arts
│       └─ Grade Levels: 11, 12
├── ABM Track
│   └── Strand: ABM
│       ├─ Accounting, Business Management
│       ├─ Economics, Entrepreneurship
│       └─ Grade Levels: 11, 12
└── GAS Track
    └── Strand: GAS
        ├─ General Academic courses
        └─ Grade Levels: 11, 12
```

### TECHNICAL-VOCATIONAL-LIVELIHOOD (TVL) PATHWAY
```
TechPro Pathway
└── TechPro Track
    └── Strand: TechPro
        ├─ ICT (Information & Communication Technology)
        ├─ Automotive Technology
        ├─ Culinary Arts
        ├─ Hospitality & Tourism
        ├─ Electrical Installation
        ├─ Welding & Metal Fabrication
        └─ Grade Levels: 11, 12
```

---

## 🔄 Application URLs Summary

| User Type | Login URL | Dashboard URL |
|-----------|-----------|---------------|
| Student | `/login` | `/dashboard` |
| Teacher | `/teacher/login` | `/teacher/dashboard` |
| Principal | `/admin/login` | `/principal-dashboard` |
| Registrar | `/admin/login` | `/registrar-dashboard` |
| Accounting | `/accounting/login` or `/admin/login` | `/accounting/dashboard` |
| Admin | `/admin/login` | `/admin/dashboard` |

---

## 🛡️ Security & Access Control

- **Token-based authentication** using localStorage
- **Role-based redirects** prevent unauthorized access
- **Automatic role detection** from login ID format
- **Protected routes** - unauthenticated users redirected to login
- **Separate dashboards** for each role
- **Data isolation** - users see only their relevant data

---

## 📧 Email Integration Points

1. **Enrollment Confirmation**
   - Sent after application approval
   - Contains: Student ID, temporary password, login link

2. **Status Updates**
   - Registrar: Forward to Principal notification
   - Principal: Approval/Rejection notification
   - Student: Enrollment status updatesz
 
3. **System Notifications**
   - Password reset emails
   - Grade submissions
   - Attendance alerts (future enhancement)

---

## 🚀 Future Role Enhancements

- **Guidance Counselor** - Monitor student progress, advising
- **Parent/Guardian** - View child's grades and attendance
- **Accounting Manager** - Advanced financial reporting
- **IT Support** - System monitoring and maintenance
- **Department Head** - Departmental oversight and analytics

---

*Last Updated: August 2026*
*System: INFORM - Cebu Far East Institute RMS*
