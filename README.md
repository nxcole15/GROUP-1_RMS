# INFORM Self-Service Student Information Kiosk

A web-based kiosk system for students, teachers, and administrators to manage academic information such as grades, schedule, tuition/fees, documents, and notifications.

---

## 1) Actors & What They Do

### Student (Student Portal)
Can view their own:
- **Grades**
- **Schedule**
- **Tuition / Fees** and payment status
- **Documents** (requests + approved downloads)
- **Notifications** (alerts and updates)

Also can initiate requests:
- **Grade requests** when the request window opens
- **Document requests** (e.g., TOR / Certificate)

### Teacher (Teacher Dashboard)
Can process incoming requests and update student status:
- Prepare/manage **Grade requests** for release
- Handle **document approvals** (depending on your workflow model)
- Monitor related information (ex: time logs)

### Admin / Registrar (Admin Dashboard)
Can verify and approve before release:
- **Grade request verification**
- **Document approval & release date management**
- Receive/monitor student-related activities and notifications

> The UI currently demonstrates the workflows; some pages may use mock UI state until fully wired to the backend.

---

## 2) End-to-End Request Flows (Core Workflows)

### A) Grade Request Flow (Recommended Flow Direction)
**Student → Teacher → Admin → Student**

1. **Student** opens the term and clicks **“Request Grade”** per subject.
2. The system records the request as **Pending** for that subject.
3. **Teacher** prepares or processes the grade for release.
4. **Teacher** forwards/releases the grade state to the **Admin** stage.
5. **Admin** verifies the grade request (and/or submitted grade).
6. After verification, the system marks the grade as **Released**.
7. **Student** sees the released grades in their **My Grades** panel.

### B) Document Request Flow
**Student → Teacher → Admin → Student**

1. **Student** selects a document type from **Available Documents**.
2. Student confirms the request.
3. The document request becomes **Pending**.
4. **Teacher** reviews/validates (or prepares recommendation, depending on your policy).
5. **Admin** approves the request and assigns a **Release Date**.
6. **Student** sees the document under **Approved Documents** and can download it.

---

## 3) UI Sections (What You See)

### Student Portal (`app/dashboard/page.tsx`)
- **Dashboard/Home**
  - Quick stats (general average, tuition status, balance, pending docs)
  - Quick access tiles
  - Recent grades preview
  - JOBERT assistant shortcuts
- **My Grades**
  - Term selector (Term 1 / 2 / 3)
  - “Not available” / “Request open” states
  - Per-subject request state machine (mock)
- **My Schedule**
  - Day selector + class cards
- **Tuition Fee**
  - Fee summary + fee item table
- **Documents**
  - Available documents cards
  - Pending requests list
  - Approved documents list with download links
- **Notifications**
  - Unread / Read sections
  - Mark as read / dismiss interactions

### Shared UX
- **JOBERT chat assistant** posts to `POST /api/jobert`
- **Premium dashboard styling** uses a consistent orange/yellow/red identity with dark mode support

---

## 4) Backend / API Touchpoints
- JOBERT chat uses:
  - `POST /api/jobert` with `{ message, history }`

Other dashboard data may be:
- Mocked in UI components for demonstration
- Or wired to backend endpoints progressively (e.g., grades/documents/notifications/payment)

---

## 5) Tech Stack
- **Next.js (App Router)**
- **React**
- **Bootstrap**
- **Custom CSS** (premium orange/yellow/red theme)

---

## 6) Setup

### Web
1. Install dependencies:
   - `npm install`
2. Start the dev server:
   - `npm run dev`
3. Open in browser:
   - `http://localhost:3000`

### Lint
- `npm run lint`

---

## 7) Implementation Notes
- Several dashboards currently use **mock arrays/UI state** to illustrate the workflow steps.
- To make the system fully real, replace mock arrays with **API-backed calls** and store workflow state on the server.
- Ensure the workflow direction for requests matches your policy:
  - Grades: **Student → Teacher → Admin → Student**
  - Documents: **Student → Teacher → Admin → Student**

