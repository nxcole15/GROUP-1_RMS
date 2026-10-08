# Grade Systems - Two Different Features

## Important: These are TWO SEPARATE systems!

### 1. **Grade Requests** (Student-Initiated)
**Who uses it:** Students request their grades from teachers
**Database table:** `grade_request_config`
**API endpoints:** `/api/grade-requests/*`
**UI Location:** Principal Dashboard > Grade Requests panel
**Flow:**
1. Student goes to "My Grades" and clicks "Request Grade"
2. Request goes to Teacher
3. Teacher submits the grade
4. Grade goes to Principal for approval
5. Principal approves
6. Grade is released to student

**Open/Close Control:**
- Principal clicks "Open" or "Close" buttons in Grade Requests panel
- Updates `grade_request_config` table
- Controls whether students can REQUEST grades

### 2. **Grade Submission** (Teacher-Initiated) 
**Who uses it:** Teachers submit grades directly (no student request needed)
**Database table:** `grade_submission_config`
**API endpoints:** `/api/admin/grade-submission-config/*` and `/api/teacher/grade-submission/*`
**UI Location:** Teacher Dashboard > Grade Management
**Flow:**
1. Teacher opens Teacher Dashboard
2. Selects subject and enters grades
3. Submits directly (auto-approved, no principal review needed)
4. Students can see grades in their dashboard

**Open/Close Control:**
- Uses separate Grade Submission Control (different from Grade Requests)
- Updates `grade_submission_config` table
- Controls whether teachers can SUBMIT grades

## Current Issue

**Problem:** Grade Request open/close buttons show "Term 1 opened" but nothing changes

**Likely Cause:** The `grade_request_config` table in Railway production either:
1. Doesn't exist
2. Has no data (no rows for Term 1, 2, 3)

**Solution:** Run the SQL fix in Railway:
```sql
-- File: backend/database/railway-fix-grade-request-config.sql

CREATE TABLE IF NOT EXISTS grade_request_config (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  term        ENUM('Term 1','Term 2','Term 3') NOT NULL UNIQUE,
  is_open     TINYINT(1)   NOT NULL DEFAULT 0,
  opened_by   VARCHAR(20)  NULL,
  opened_at   DATETIME     NULL,
  closed_by   VARCHAR(20)  NULL,
  closed_at   DATETIME     NULL
);

INSERT IGNORE INTO grade_request_config (term, is_open)
VALUES ('Term 1', 0), ('Term 2', 0), ('Term 3', 0);
```

## Testing After Fix

### Test Grade Requests (Student-Initiated):
1. Login as Principal
2. Go to Grade Requests panel
3. Click "Open" for Term 1
4. Should see badge change from "Closed" to "Open"
5. Login as Student
6. Go to My Grades
7. Should see "Grade Request Window: Open for Term 1"
8. Should be able to click "Request Grade" button

### Test Grade Submission (Teacher-Initiated):
1. Login as Principal  
2. Go to separate Grade Submission Control section
3. Click "Open Now" for Term 1
4. Login as Teacher
5. Go to Teacher Dashboard
6. Should see green banner "Grade Submission Open for Term 1"
7. Should be able to submit grades

## Key Files

### Grade Requests:
- **Backend Controller:** `backend/modules/gradeRequests/gradeRequestController.js`
- **Backend Routes:** `backend/modules/gradeRequests/gradeRequestRoutes.js`
- **Database Table:** `grade_request_config`
- **Frontend:** `frontend/app/components/AdminDashboardShell.tsx` (toggleTerm function)

### Grade Submission:
- **Backend Controller:** `backend/modules/admin/adminController.js` (openGradeSubmissionNow, closeGradeSubmissionNow)
- **Backend Routes:** `backend/modules/admin/adminRoutes.js`
- **Database Table:** `grade_submission_config`
- **Frontend Teacher:** `frontend/app/teacher/dashboard/page.tsx`

## Common Mistakes to Avoid

❌ **DON'T** mix up the two systems
❌ **DON'T** update `grade_submission_config` when working on Grade Requests
❌ **DON'T** use `/api/admin/grade-submission-config/*` for Grade Requests

✅ **DO** check which system you're working on first
✅ **DO** use the correct database table for each system
✅ **DO** use the correct API endpoints for each system
