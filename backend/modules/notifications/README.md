# Real-Time Notification System

## Overview
This notification system provides real-time updates to all users (students, teachers, principals, registrars, accounting) whenever important actions occur in the system.

## Architecture

### Tables
- `notifications` - Student notifications
- `staff_notifications` - Admin/Teacher/Principal/Registrar/Accounting notifications

### Backend Components
- `notificationModel.js` - Student notification database operations
- `staffNotificationModel.js` - Staff notification database operations
- `notificationService.js` - **Main service for creating notifications** (import this!)
- `notificationsController.js` - Student notification API endpoints
- `staffNotificationController.js` - Staff notification API endpoints
- `notificationsRoutes.js` - Student notification routes
- `staffNotificationRoutes.js` - Staff notification routes

### Frontend Components
- `useNotifications.ts` - React hooks for polling notifications
  - `useStaffNotifications()` - For admin/teacher dashboards
  - `useStudentNotifications()` - For student dashboard

## How to Use

### Step 1: Run the Migration
```bash
# In Railway or local MySQL
SOURCE backend/database/migrations/009-enhance-notifications-system.sql;
```

### Step 2: Import NotificationService in Your Controller
```javascript
const NotificationService = require("../notifications/notificationService");
```

### Step 3: Call Notification Functions

#### Example: When a grade is submitted
```javascript
// In gradeRequestController.js - submitGrade()
await NotificationService.notifyGradeSubmitted({
  student_id: studentId,
  student_name: studentName,
  subject: subjectName,
  term: term,
  grade: score,
  teacher_name: teacherName,
  request_id: requestId
});
```

#### Example: When a document is requested
```javascript
// In documentsController.js - requestDocument()
await NotificationService.notifyDocumentRequested({
  student_id: req.student.student_id,
  student_name: studentName,
  document_type: documentType,
  document_id: newDocumentId
});
```

#### Example: When payment is received
```javascript
// In paymentsController.js - recordPayment()
await NotificationService.notifyPaymentReceived({
  student_id: studentId,
  amount: amount,
  payment_type: paymentType,
  receipt_number: receiptNumber
});

await NotificationService.notifyNewPayment({
  student_name: studentName,
  amount: amount,
  payment_type: paymentType,
  payment_id: paymentId
});
```

#### Example: When fees are assigned
```javascript
// In feeController.js - assignFeesToStudent()
await NotificationService.notifyFeesAssigned({
  student_id: studentId,
  total_amount: netAssessment,
  assigned_by: adminName
});
```

## Frontend Integration

### For Admin/Teacher/Staff Dashboards

```typescript
import { useStaffNotifications } from '@/app/hooks/useNotifications';

function AdminDashboard() {
  const role = "principal"; // or "registrar", "teacher", "accounting", "admin"
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useStaffNotifications(role);

  return (
    <div>
      <button>
        🔔 Notifications ({unreadCount})
      </button>
      
      <div className="notification-dropdown">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            onClick={() => markAsRead(notif.id)}
            className={notif.read ? 'read' : 'unread'}
          >
            <h4>{notif.title}</h4>
            <p>{notif.message}</p>
            <span>{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### For Student Dashboard

```typescript
import { useStudentNotifications } from '@/app/hooks/useNotifications';

function StudentDashboard() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useStudentNotifications();

  // Same UI as above
}
```

## Available Notification Functions

### Student Notifications
- `notifyStudent({ student_id, message, type, link_url })`

### Staff Notifications
- `notifyStaff({ recipient, role, message, type, reference_id, reference_type, link_url })`
- `notifyRole({ role, message, type, reference_id, reference_type, link_url })`

### Pre-built Notification Types
- `notifyGradeSubmitted()` - Grade submitted for review
- `notifyGradeApproved()` - Grade approved
- `notifyGradeRejected()` - Grade rejected/needs revision
- `notifyDocumentRequested()` - New document request
- `notifyDocumentReady()` - Document ready for pickup
- `notifyEnrollmentApproved()` - Enrollment approved
- `notifyNewEnrollment()` - New enrollment submitted
- `notifyPaymentReceived()` - Payment recorded
- `notifyNewPayment()` - Notify accounting of payment
- `notifyFeesAssigned()` - Fees assigned to student
- `notifyBalanceDue()` - Payment reminder

## Notification Types
- `grade_request` - Grade submission/review
- `grade_submitted` - Grade submitted (student side)
- `grade_approved` - Grade approved
- `grade_rejected` - Grade needs revision
- `document_request` - Document requested
- `document_ready` - Document ready
- `enrollment` - Enrollment activity
- `enrollment_approved` - Enrollment approved
- `payment` - Payment activity
- `payment_received` - Payment confirmation
- `fee_assigned` - Fees assessed
- `balance_due` - Payment reminder
- `info` - General information

## Polling Behavior
- Frontend polls every **30 seconds** by default
- Can be customized: `useStaffNotifications(role, true, 60000)` for 60 seconds
- Notifications auto-refresh without page reload
- Optimistic UI updates for instant feedback

## Testing
1. Create a test notification manually:
```javascript
await NotificationService.notifyStaff({
  recipient: 'ADMIN001',
  role: 'principal',
  message: 'Test notification',
  type: 'info'
});
```

2. Check in frontend - should appear within 30 seconds

## Next Steps for Full Implementation
1. ✅ Run migration 009
2. ✅ Add NotificationService imports to all relevant controllers
3. ✅ Call notification functions after key actions
4. ✅ Test each notification type
5. ✅ Update frontend dashboards to use notification hooks

## Files to Update
- `backend/modules/gradeRequests/gradeRequestController.js` - Add grade notifications
- `backend/modules/documents/documentsController.js` - Add document notifications
- `backend/modules/student/enrollmentController.js` - Add enrollment notifications
- `backend/modules/payments/paymentsController.js` - Add payment notifications
- `backend/modules/fees/feeController.js` - Add fee notifications
- `frontend/app/components/AdminDashboardShell.tsx` - Replace current polling
- `frontend/app/dashboard/page.tsx` - Add student notification UI
- `frontend/app/teacher/dashboard/page.tsx` - Add teacher notifications
