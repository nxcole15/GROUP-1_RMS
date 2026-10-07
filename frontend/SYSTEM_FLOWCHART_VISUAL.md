# SYSTEM FLOWCHART - USER JOURNEY & FUNCTIONS

```
                                    ┌─────────┐
                                    │  START  │
                                    └────┬────┘
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │ Open CFEI Landing Page  │
                            │  (Public Access)        │
                            │  - Home                 │
                            │  - Visit Us             │
                            │  - Enrollment Info      │
                            └────────────┬────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
        ┌─────────────────────┐ ┌──────────────────┐ ┌──────────────────┐
        │ Enrollment Process  │ │ Email Module     │ │ Select Section   │
        │ (See Figure 2)      │ │ - Forgot Pass    │ │ - Login          │
        │                     │ │ - Confirmation   │ │ - Enrollment     │
        └─────────────────────┘ └──────────────────┘ └────────┬─────────┘
                                                               │
                                                               ▼
                                                    ┌──────────────────────┐
                                                    │   Navigate to Login  │
                                                    │   /login             │
                                                    │   /teacher/login     │
                                                    │   /admin/login       │
                                                    └──────────┬───────────┘
                                                               │
                                                               ▼
                                    ┌──────────────────────────────────────┐
                                    │  Enter Login Credentials             │
                                    │  ┌──────────────────────────────┐    │
                                    │  │ ID Input Field               │    │
                                    │  │ - Student: 8-12 digits       │    │
                                    │  │ - Teacher: T + numbers       │    │
                                    │  │ - Principal: ADMIN001        │    │
                                    │  │ - Registrar: ADMIN002        │    │
                                    │  │ - Accounting: ADMIN003       │    │
                                    │  │ - Admin: ADMIN + numbers     │    │
                                    │  └──────────────────────────────┘    │
                                    │  ┌──────────────────────────────┐    │
                                    │  │ Password Input Field         │    │
                                    │  │ - Show/Hide toggle           │    │
                                    │  │ - Forgot Password link       │    │
                                    │  └──────────────────────────────┘    │
                                    └──────────┬───────────────────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────────┐
                                    │ Normalize Credentials    │
                                    │ normalizeId()            │
                                    │ - Trim whitespace        │
                                    │ - Convert to uppercase   │
                                    │ - Remove spaces          │
                                    └──────────┬───────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────────┐
                                    │ API Call                 │
                                    │ /api/auth/universal-     │
                                    │ login                    │
                                    │ POST {id, password}      │
                                    └──────────┬───────────────┘
                                               │
                                ┌──────────────┴──────────────┐
                                │                             │
                                ▼                             ▼
                    ┌────────────────────────┐  ┌─────────────────────────┐
                    │ Credentials Valid?     │  │ Credentials Invalid?    │
                    │ (Check Against DB)     │  │                         │
                    │        YES             │  │        NO               │
                    └────────────┬───────────┘  └──────────┬──────────────┘
                                 │                         │
                                 │                         ▼
                                 │        ┌─────────────────────────────┐
                                 │        │ Display Login Error         │
                                 │        │ "Invalid credentials"       │
                                 │        │ returnLoginError()          │
                                 │        │ - Clear password field      │
                                 │        │ - Focus on ID field         │
                                 │        │ - Show error message        │
                                 │        └──────────┬──────────────────┘
                                 │                   │
                                 │                   ▼
                                 │        ┌─────────────────────────┐
                                 │        │ Return to Login Screen  │
                                 │        │ Await User Retry        │
                                 │        └──────────┬──────────────┘
                                 │                   │
                                 └───────────────────┘
                                         │
                                         ▼
                            ┌────────────────────────────────┐
                            │ detectRole(id)                 │
                            │ Pattern Matching               │
                            ├────────────────────────────────┤
                            │ /^[0-9]{8,12}$/ → Student      │
                            │ /^T\d+/i → Teacher             │
                            │ ADMIN001 → Principal           │
                            │ ADMIN002 → Registrar           │
                            │ ADMIN003 → Accounting          │
                            │ /^ADMIN/i → Admin              │
                            └────────┬───────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────────┐
                    │ Store Authentication Data          │
                    │ setLocalStorage()                  │
                    ├────────────────────────────────────┤
                    │ - inform_token                     │
                    │ - inform_role                      │
                    │ - inform_user (JSON data)          │
                    │ - inform_[role]_token (if admin)   │
                    └────────────┬───────────────────────┘
                                 │
                 ┌───────────────┼───────────────┬──────────────┬──────────────┐
                 │               │               │              │              │
                 ▼               ▼               ▼              ▼              ▼
        ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐ ┌────────────────┐
        │ Role: Student    │ │ Role: Teacher    │ │ Role: Principal│ │ Role: Registrar│
        │                  │ │                  │ │                │ │                │
        │ Redirect to:     │ │ Redirect to:     │ │ Redirect to:   │ │ Redirect to:   │
        │ /dashboard       │ │ /teacher/        │ │ /principal-    │ │ /registrar-    │
        │                  │ │ dashboard        │ │ dashboard      │ │ dashboard      │
        └─────────┬────────┘ └────────┬─────────┘ └────────┬───────┘ └────────┬───────┘
                  │                  │                   │                  │
                  │                  │                   │                  │
        ┌─────────▼──────────┐ ┌─────▼──────────┐ ┌─────▼──────────┐ ┌────▼───────────┐
        │  STUDENT MODULE    │ │ TEACHER MODULE │ │PRINCIPAL MODULE│ │ REGISTRAR      │
        │                    │ │                │ │                │ │ MODULE         │
        │ Functions:         │ │ Functions:     │ │ Functions:     │ │                │
        │ - viewDashboard()  │ │ - viewClasses()│ │ - viewApps()   │ │ Functions:     │
        │ - viewGrades()     │ │ - inputGrades()│ │ - approveApp() │ │ - viewApps()   │
        │ - viewAttendance() │ │ - markAttend() │ │ - rejectApp()  │ │ - reviewApp()  │
        │ - viewProfile()    │ │ - viewStudents│ │ - forwardApp() │ │ - forwardApp() │
        │ - updateProfile()  │ │ - viewProfile()│ │ - viewReports()│ │ - generateRept │
        │ - browseEnroll()   │ │ - updateProf() │ │ - manageUsers()│ │ - viewStatus() │
        │ - viewAnnounc()    │ │ - viewReports()│ │ - sysSettings()│ │ - updateStatus │
        │                    │ │                │ │                │ │                │
        └─────────┬──────────┘ └────────┬───────┘ └────────┬───────┘ └────┬───────────┘
                  │                    │                 │                │
                  │                    │                 │                │
                  └────────┬───────────┴─────────────────┴────────────────┘
                           │
                           ▼
            ┌──────────────────────────────────────────┐
            │ User Successfully Accessed System        │
            │ Initialize User Session                 │
            │ - Load user dashboard                   │
            │ - Check session timeout (30 min)        │
            │ - Load user-specific data               │
            │ - Initialize real-time updates          │
            │ - Load user preferences                 │
            └──────────────────┬───────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       END           │
                    └─────────────────────┘
```

---

# ENROLLMENT PROCESS - DETAILED FLOW

```
                                ┌─────────────┐
                                │   START     │
                                └──────┬──────┘
                                       │
                                       ▼
                        ┌──────────────────────────┐
                        │ Navigate to /enrollment  │
                        │ (Public Access)          │
                        └──────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │ STEP 1: Terms & Conditions       │
                    ├──────────────────────────────────┤
                    │ - Display T&C content            │
                    │ - Required scroll to bottom      │
                    │ - Acknowledge reading (required) │
                    │ Function: handleTermsScroll()    │
                    │ Function: validateTermsRead()    │
                    └──────────┬───────────────────────┘
                               │
                               ▼
                    ┌──────────────────────────────────┐
                    │ STEP 2: Enrollment Form          │
                    ├──────────────────────────────────┤
                    │ Section A: Personal Information  │
                    │ - First Name (required)          │
                    │ - Last Name (required)           │
                    │ - Middle Name (optional)         │
                    │ - Extension Name (optional)      │
                    │ - Date of Birth (required)       │
                    │ - Gender (required)              │
                    │ - Civil Status (required)        │
                    │ - Nationality (required)         │
                    │ - Religion (required)            │
                    │ - Address (required)             │
                    │                                  │
                    │ Section B: Contact Information   │
                    │ - Email (required)               │
                    │ - Phone Number (required)        │
                    │ - Validate email format          │
                    │ - Validate phone format          │
                    │                                  │
                    │ Section C: Academic Information  │
                    │ - Student Status (required)      │
                    │   ├─ New Student                 │
                    │   └─ Returning Student           │
                    │ - If Returning:                  │
                    │   └─ Student ID (required)       │
                    │ - Pathway (required)             │
                    │   ├─ Academic Pathway            │
                    │   └─ TechPro (TVL)               │
                    │ - Track (required)               │
                    │   If Academic:                   │
                    │   ├─ STEM                        │
                    │   ├─ HUMMS                       │
                    │   ├─ ABM                         │
                    │   └─ GAS                         │
                    │   If TechPro:                    │
                    │   └─ TechPro (auto-filled)       │
                    │ - Strand (required)              │
                    │   └─ Matches selected track      │
                    │ - Grade Level (required)         │
                    │   ├─ Grade 11                    │
                    │   └─ Grade 12                    │
                    │ - Learning Modality (required)   │
                    │   ├─ Face-to-Face                │
                    │   ├─ Modular (Distance)          │
                    │   └─ Blended Learning            │
                    │                                  │
                    │ Section D: Family Information    │
                    │ - Father's Name (optional)       │
                    │ - Father's Occupation (optional) │
                    │ - Mother's Name (optional)       │
                    │ - Mother's Occupation (optional) │
                    │ - Guardian Name (optional)       │
                    │ - Guardian Relation (optional)   │
                    │ - Guardian Phone (optional)      │
                    │                                  │
                    │ Section E: Previous School       │
                    │ - School Name (optional)         │
                    │ - School Address (optional)      │
                    │ - Years Attended (optional)      │
                    │                                  │
                    │ Section F: ID Photo              │
                    │ - Upload 2x2 ID Photo (required)│
                    │ - Accepted: JPG, PNG             │
                    │ - Max 5MB                        │
                    │ - Show preview                   │
                    │                                  │
                    │ Function: handleChange()         │
                    │ Function: validateForm()         │
                    │ Function: handleFormSubmit()     │
                    └──────────┬───────────────────────┘
                               │
                               ▼
                    ┌──────────────────────────────────┐
                    │ Validate All Required Fields     │
                    │ validateForm()                   │
                    │                                  │
                    │ Check Missing Fields:            │
                    │ - All required fields populated  │
                    │ - Email format valid             │
                    │ - Phone format valid             │
                    │ - Student ID if returning        │
                    │ - ID Photo uploaded              │
                    └──────────┬───────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
         Validation │ FAIL               │ PASS
            Error   │                     │
                    ▼                     ▼
         ┌──────────────────┐  ┌──────────────────────┐
         │ Show Error Alert │  │ Continue to Step 3   │
         │ - Field name     │  │                      │
         │ - Error message  │  └──────────┬───────────┘
         │ returnError()    │             │
         │ - Focus field    │             ▼
         │ - Prevent submit │  ┌──────────────────────────────┐
         │                  │  │ STEP 3: Student Declaration  │
         │ Await correction │  ├──────────────────────────────┤
         └──────────┬───────┘  │ Display Agreement Text:      │
                    │          │ "I hereby agree to the       │
                    │          │  terms and conditions..."    │
                    │          │                              │
                    │          │ Checkbox (required):         │
                    │          │ ☐ I agree                    │
                    │          │ - checkboxState              │
                    │          │ - setAgreedToTerms()         │
                    │          │                              │
                    │          │ Function: handleAgreement()  │
                    │          └──────────┬───────────────────┘
                    │                     │
                    │                     ▼
                    │        ┌────────────────────────┐
                    │        │ Agreement Confirmed?   │
                    │        │ agreedToTerms === true │
                    │        └────────┬───────────────┘
                    │                 │
         ┌──────────┴─────────┬──────┴──────┐
         │                    │             │
         ▼                    ▼             ▼
    (Retry)           (Continue)       (Disabled)
         │              ▼
         │  ┌──────────────────────────────┐
         │  │ STEP 4: Review & Confirm     │
         │  ├──────────────────────────────┤
         │  │ Display All Information      │
         │  │ - Personal Info section      │
         │  │ - Contact Info section       │
         │  │ - Academic Info section      │
         │  │ - Family Info section        │
         │  │ - Previous School section    │
         │  │ - ID Photo preview           │
         │  │                              │
         │  │ For Each Section:            │
         │  │ - Show all filled values     │
         │  │ - Show "— " for empty       │
         │  │ - Add "Edit" button (pencil) │
         │  │ - Return to Step 2 on edit   │
         │  │                              │
         │  │ Declaration Confirmation:    │
         │  │ ✅ Badge: "You have         │
         │  │    agreed to T&C"            │
         │  │                              │
         │  │ Function: displayReview()    │
         │  │ Function: handleEdit()       │
         │  │ Function: verifyAllData()    │
         │  └──────────┬───────────────────┘
         │             │
         │             ▼
         │  ┌──────────────────────────────┐
         │  │ Submit Application           │
         │  │ handleFinalEnroll()          │
         │  │                              │
         │  │ 1. Construct Payload:        │
         │  │    {                          │
         │  │    first_name,               │
         │  │    last_name,                │
         │  │    middle_name,              │
         │  │    extension_name,           │
         │  │    email,                    │
         │  │    phone,                    │
         │  │    date_of_birth,            │
         │  │    gender,                   │
         │  │    civil_status,             │
         │  │    nationality,              │
         │  │    religion,                 │
         │  │    address,                  │
         │  │    student_status,           │
         │  │    existing_student_id,      │
         │  │    pathway,                  │
         │  │    track,                    │
         │  │    strand,                   │
         │  │    grade_level,              │
         │  │    learning_modality,        │
         │  │    father_name,              │
         │  │    father_occupation,        │
         │  │    mother_name,              │
         │  │    mother_occupation,        │
         │  │    guardian_name,            │
         │  │    guardian_relation,        │
         │  │    guardian_phone,           │
         │  │    previous_school,          │
         │  │    previous_school_address,  │
         │  │    years_attended            │
         │  │    }                          │
         │  │                              │
         │  │ 2. API Call:                 │
         │  │    POST /api/applications    │
         │  │    Content-Type: JSON        │
         │  │                              │
         │  │ 3. Show "Submitting..."      │
         │  │    with spinner              │
         │  └──────────┬───────────────────┘
         │             │
         │      ┌──────┴─────┐
         │      │            │
         │      ▼            ▼
         │  (Success)    (Error)
         │      │            │
         │      │            ▼
         │      │  ┌──────────────────────┐
         │      │  │ Display Error Alert  │
         │      │  │ - API error message  │
         │      │  │ - Network error      │
         │      │  │ - Validation error   │
         │      │  │ setSubmitError()     │
         │      │  │ - Retry button       │
         │      │  └──────────┬───────────┘
         │      │             │
         │      │             └────────────┐
         │      │                          │
         │      ▼                          │
         │  ┌──────────────────────────────┐│
         │  │ STEP 5: Success Confirmation ││
         │  ├──────────────────────────────┤│
         │  │ Display:                      ││
         │  │ ✅ "Application Submitted!"  ││
         │  │                              ││
         │  │ Show Summary:                 ││
         │  │ - Student Name               ││
         │  │ - Email                      ││
         │  │ - Status (New/Returning)     ││
         │  │ - Pathway                    ││
         │  │ - Track                      ││
         │  │ - Strand                     ││
         │  │ - Grade Level                ││
         │  │ - Learning Modality          ││
         │  │                              ││
         │  │ Display Next Steps:          ││
         │  │ 1. Registrar will review    ││
         │  │ 2. Principal will approve   ││
         │  │ 3. Email with credentials   ││
         │  │                              ││
         │  │ Call to Action:              ││
         │  │ [← Back to Home]             ││
         │  │                              ││
         │  │ Function: setStep(5)         ││
         │  │ Function: sendConfirmEmail() ││
         │  └──────────────────────────────┘│
         │                                  │
         └──────────────────────────────────┘
                          │
                          ▼
            ┌────────────────────────────┐
            │  BACKEND PROCESSING        │
            ├────────────────────────────┤
            │ 1. Store in Database       │
            │    - Table: applications   │
            │    - Status: pending       │
            │                            │
            │ 2. Send Confirmation Email │
            │    - To: student email     │
            │    - Subject: Enrollment   │
            │      Application Received  │
            │    - Body: Details + wait  │
            │                            │
            │ 3. Trigger Workflows       │
            │    - Registrar notification│
            │    - Track application ID  │
            │    - Log timestamp         │
            │                            │
            │ 4. Queue Email Tasks       │
            │    - Application received  │
            │    - Under review          │
            │    - Forwarded to Principal│
            │    - Approved/Rejected     │
            └────────────────────────────┘
                          │
                          ▼
            ┌────────────────────────────┐
            │  REGISTRAR WORKFLOW        │
            ├────────────────────────────┤
            │ 1. Dashboard shows pending │
            │    enrollments             │
            │                            │
            │ 2. Registrar reviews:      │
            │    - All form data         │
            │    - ID photo              │
            │    - Pathway/Track/Strand  │
            │    - Contact info validity │
            │                            │
            │ 3. Decision:               │
            │    ├─ Accept → Forward to  │
            │    │           Principal   │
            │    └─ Reject → Email       │
            │               Applicant    │
            └────────────────────────────┘
                          │
                          ▼
            ┌────────────────────────────┐
            │  PRINCIPAL WORKFLOW        │
            ├────────────────────────────┤
            │ 1. Receives forwarded apps │
            │    from Registrar          │
            │                            │
            │ 2. Final Review:           │
            │    - All details           │
            │    - Registrar recommendation
            │    - Complete submission   │
            │                            │
            │ 3. Final Decision:         │
            │    ├─ Approve:             │
            │    │  ├─ Generate ID       │
            │    │  ├─ Create password   │
            │    │  ├─ Send email        │
            │    │  └─ Activate account  │
            │    │                       │
            │    └─ Reject:              │
            │       ├─ Set status        │
            │       ├─ Send email        │
            │       └─ Close application │
            └────────────────────────────┘
                          │
                          ▼
            ┌────────────────────────────┐
            │ STUDENT RECEIVES EMAIL     │
            ├────────────────────────────┤
            │ If APPROVED:               │
            │ - Student ID               │
            │ - Temporary Password       │
            │ - Login Link               │
            │ - Dashboard Instructions   │
            │ - First Steps Guide        │
            │                            │
            │ If REJECTED:               │
            │ - Rejection Reason         │
            │ - Appeal Instructions      │
            │ - Contact Info             │
            └────────────────────────────┘
                          │
                          ▼
                    ┌──────────┐
                    │   END    │
                    └──────────┘
```

---

# AUTHENTICATION & ROLE-BASED ROUTING FLOW

```
┌──────────────────────────────────────────────────────────────────┐
│              LOGIN VALIDATION & ROLE DETECTION                   │
└──────────────────────────────────────────────────────────────────┘

Input: ID + Password
  │
  ▼
┌──────────────────────────────┐
│ normalizeId(id)              │
├──────────────────────────────┤
│ 1. value.trim()              │
│ 2. value.toUpperCase()       │
│ 3. value.replace(/\s+/g, "")│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│ API: /api/auth/universal-login               │
├──────────────────────────────────────────────┤
│ POST /api/auth/universal-login               │
│ {                                            │
│   "id": "<normalized_id>",                   │
│   "password": "<password>"                   │
│ }                                            │
│                                              │
│ Server Validation:                           │
│ 1. Query Database (users table)              │
│ 2. Find user by ID                           │
│ 3. Verify password (bcrypt compare)          │
│ 4. Retrieve user role                        │
│ 5. Generate JWT token                        │
│ 6. Return response                           │
└──────────────┬───────────────────────────────┘
               │
    ┌──────────┴────────────┐
    │                       │
    ▼ (200 OK)              ▼ (401 Unauthorized)
┌────────────┐          ┌────────────────┐
│ Response:  │          │ Error Response │
├────────────┤          ├────────────────┤
│ {          │          │ {              │
│  token,    │          │  error: "..."  │
│  role,     │          │ }              │
│  student/  │          └────────┬───────┘
│  teacher/  │                   │
│  admin     │                   ▼
│ }          │          ┌──────────────────┐
└──────┬─────┘          │ Display Error    │
       │                │ - Invalid creds  │
       │                │ - Retry button   │
       │                └──────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ detectRole(server_response)  │
├──────────────────────────────┤
│ Receive role from server:    │
│ - "student"                  │
│ - "teacher"                  │
│ - "principal"                │
│ - "registrar"                │
│ - "accounting"               │
│ - "admin"                    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Save to localStorage()               │
├──────────────────────────────────────┤
│ - inform_token (main JWT)            │
│ - inform_role (user role)            │
│ - inform_user (JSON user object)     │
│ - inform_[role]_token (role-specific)│
└──────────────┬───────────────────────┘
               │
    ┌──────────┴──────────────┬─────────┬──────────┬──────────┐
    │                         │         │          │          │
    ▼                         ▼         ▼          ▼          ▼
 Student               Teacher        Principal  Registrar  Accounting
    │                   │              │          │          │
    ▼                   ▼              ▼          ▼          ▼
/dashboard        /teacher/        /principal-  /registrar- /accounting/
                  dashboard        dashboard    dashboard   dashboard
    │                   │              │          │          │
    ▼                   ▼              ▼          ▼          ▼
┌──────────────┐ ┌──────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│ Student      │ │ Teacher      │ │Principal│ │Registrar │ │Accounting│
│ Dashboard:   │ │ Dashboard:   │ │Dashboard│ │ Dashboard│ │ Dashboard│
│ - Home panel │ │ - Classes    │ │- Enroll │ │- Pending │ │- Tuition │
│ - Grades     │ │ - Grades     │ │  apps   │ │  apps    │ │- Payments│
│ - Attendance │ │ - Attendance │ │- Approve│ │- Verify  │ │- Reports │
│ - Profile    │ │ - Students   │ │- Reject │ │- Forward │ │- Billing │
│ - Announce   │ │ - Reports    │ │- Reports│ │- Reports │ │- History │
└──────────────┘ │ - Profile    │ └─────────┘ └──────────┘ └──────────┘
                 │ - Settings   │
                 └──────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │ User Successfully      │
            │ Accessed System        │
            │                        │
            │ Session Management:    │
            │ - Check token validity │
            │ - 30-min timeout       │
            │ - Auto logout          │
            │ - Refresh on activity  │
            └────────────────────────┘
```

---

# DASHBOARD ACCESS MATRIX

```
                    ┌─ CHECK AUTH ─┐
                    │ Token exists?│
                    └─────┬────────┘
                          │
                    ┌─────┴─────┐
                    │           │
               NO   ▼           ▼   YES
            ┌──────────┐   ┌──────────────┐
            │ Redirect │   │ Check Role   │
            │ /login   │   │ from Token   │
            └──────────┘   └──────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              Token Expired   Invalid Role   Valid Role
                    │             │             │
                    ▼             ▼             ▼
              ┌─────────┐   ┌─────────┐   ┌──────────┐
              │Redirect │   │Redirect │   │ Load     │
              │/login   │   │/login   │   │ Dashboard│
              └─────────┘   └─────────┘   └──────────┘
```
