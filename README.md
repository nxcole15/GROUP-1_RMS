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

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MySQL database
- Gmail account (with App Password for email functionality)

### Frontend Setup
1. Install dependencies:
   ```bash
   cd GROUP-1_RMS
   npm install
   ```

2. Create `.env.local` from the template:
   ```bash
   cp app/.env.example app/.env.local
   ```

3. Update `app/.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open in browser:
   ```
   http://localhost:3000
   ```

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   npm install
   ```

2. Create `.env` from the template:
   ```bash
   cp .env.example .env
   ```

3. Update `server/.env` with your configuration:
   ```env
   # Database Configuration
   PORT=4000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_database_password
   DB_NAME=smart_student_service

   # Email Configuration (Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM="CFEI INFORM System" <your_email@gmail.com>
   ```

4. Set up the database:
   - Create MySQL database: `smart_student_service`
   - Run migrations:
     ```bash
     node database/migrate.js
     ```

5. Start the backend server:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

6. Server will be available at:
   ```
   http://localhost:4000
   ```

### Environment Variables

#### Frontend (`app/.env.local`)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000` |

#### Backend (`server/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `4000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | Your password |
| `DB_NAME` | Database name | `smart_student_service` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email account | `your_email@gmail.com` |
| `SMTP_PASS` | Email app password | Your 16-char app password |
| `EMAIL_FROM` | Sender email format | `"CFEI INFORM System" <your_email@gmail.com>` |

### Gmail Configuration for Email Sending

To enable email notifications (enrollment confirmations, credentials, etc.):

1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification" if not already enabled
   - Generate "App Password" for Mail/Windows
   - Copy the 16-character password
3. Add to `server/.env`:
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_char_app_password
   ```

> **Note:** Never use your actual Gmail password; always use an App Password for security.

### Linting
```bash
npm run lint
```

---

## 7) Implementation Notes
- Several dashboards currently use **mock arrays/UI state** to illustrate the workflow steps.
- To make the system fully real, replace mock arrays with **API-backed calls** and store workflow state on the server.
- Ensure the workflow direction for requests matches your policy:
  - Grades: **Student → Teacher → Admin → Student**
  - Documents: **Student → Teacher → Admin → Student**

---

## 8) Environment File Security

### ⚠️ Important: Never Commit `.env` Files

The `.env` files contain sensitive information (database passwords, email credentials, API keys) and should **NEVER** be committed to version control.

### How to Use `.env.example` Files

1. **Copy the example file:**
   ```bash
   # Frontend
   cp app/.env.example app/.env.local

   # Backend
   cp server/.env.example server/.env
   ```

2. **Add your actual credentials:**
   - Edit the copied files with your real values
   - These files are git-ignored and will not be pushed

3. **What's Committed:**
   - ✅ `app/.env.example` - Template with placeholder values
   - ✅ `server/.env.example` - Template with placeholder values
   - ✅ `.gitignore` - Rules to exclude `.env` files

4. **What's NOT Committed:**
   - ❌ `app/.env.local` - Local configuration
   - ❌ `server/.env` - Server configuration with credentials
   - ❌ Any other `.env*` files

### For New Team Members

When cloning the repository:
```bash
# Create local env files from templates
cp app/.env.example app/.env.local
cp server/.env.example server/.env

# Add your credentials to the new files
# (These files won't be tracked by git)
```

---

## 9) Features

### Student Portal
- ✅ Self-service enrollment with automatic credentials
- ✅ Dynamic dashboard with student name from enrollment
- ✅ Grade request workflows with status tracking
- ✅ Document request management
- ✅ Tuition/fee tracking
- ✅ Real-time notifications
- ✅ JOBERT AI assistant integration

### Teacher Dashboard
- ✅ Grade request processing
- ✅ Document review and approval
- ✅ Attendance monitoring

### Admin/Registrar Dashboard
- ✅ Application review and approval
- ✅ Grade request verification
- ✅ Document release management
- ✅ Enrollment configuration

### Email Notifications
- ✅ Enrollment confirmation with auto-generated credentials
- ✅ Grade updates
- ✅ Document notifications
- ✅ System alerts

---

## 10) Troubleshooting

### Email Not Sending
- Verify Gmail App Password is correct (16 characters)
- Check that 2-Step Verification is enabled on Gmail account
- Verify `SMTP_USER` and `SMTP_PASS` in `server/.env`
- Check server logs for error details

### Database Connection Issues
- Ensure MySQL is running
- Verify database credentials in `server/.env`
- Check that database `smart_student_service` exists
- Run: `node server/database/migrate.js` to set up tables

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` in `app/.env.local` matches backend URL
- Check that backend server is running on the specified port
- Look for CORS errors in browser console

