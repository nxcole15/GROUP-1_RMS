/**
 * modules/notifications/notificationService.js
 * Service for creating notifications across the system
 * Import this service in any controller that needs to trigger notifications
 */

const NotificationModel = require("./notificationModel");
const StaffNotificationModel = require("./staffNotificationModel");

const NotificationService = {
  /**
   * Create a notification for a student
   */
  async notifyStudent({ student_id, message, type = 'info', link_url = null }) {
    try {
      return await NotificationModel.create({ student_id, message, type, link_url });
    } catch (error) {
      console.error('Error creating student notification:', error);
      // Don't throw - notifications are nice-to-have, not critical
    }
  },

  /**
   * Create a notification for a specific staff member
   */
  async notifyStaff({ recipient, role, message, type = 'info', reference_id = null, reference_type = null, link_url = null }) {
    try {
      return await StaffNotificationModel.create({ 
        recipient, 
        role, 
        message, 
        type, 
        reference_id, 
        reference_type, 
        link_url 
      });
    } catch (error) {
      console.error('Error creating staff notification:', error);
    }
  },

  /**
   * Create notification for all users of a specific role
   */
  async notifyRole({ role, message, type = 'info', reference_id = null, reference_type = null, link_url = null }) {
    try {
      return await StaffNotificationModel.createForRole({ 
        role, 
        message, 
        type, 
        reference_id, 
        reference_type, 
        link_url 
      });
    } catch (error) {
      console.error('Error creating role notification:', error);
    }
  },

  // ── Specific notification types ──

  /**
   * Notify when a grade is submitted for review
   */
  async notifyGradeSubmitted({ student_id, student_name, subject, term, grade, teacher_name, request_id }) {
    // Notify the student
    await this.notifyStudent({
      student_id,
      message: `${teacher_name} submitted your ${subject} grade (${grade}) for ${term}. Awaiting review.`,
      type: 'grade_submitted',
      link_url: '/dashboard'
    });

    // Notify principals
    await this.notifyRole({
      role: 'principal',
      message: `Grade Submitted for Review: ${student_name} - ${subject} (Term: ${term}, Score: ${grade})`,
      type: 'grade_request',
      reference_id: request_id,
      reference_type: 'grade_request',
      link_url: '/admin/principal/dashboard'
    });
  },

  /**
   * Notify when a grade is approved
   */
  async notifyGradeApproved({ student_id, student_name, subject, term, grade, approved_by }) {
    await this.notifyStudent({
      student_id,
      message: `Your ${subject} grade (${grade}) for ${term} has been approved by ${approved_by}.`,
      type: 'grade_approved',
      link_url: '/dashboard'
    });
  },

  /**
   * Notify when a grade is rejected
   */
  async notifyGradeRejected({ student_id, teacher_id, student_name, subject, term, grade, reason, rejected_by }) {
    // Notify student
    await this.notifyStudent({
      student_id,
      message: `Your ${subject} grade submission for ${term} requires revision. Reason: ${reason}`,
      type: 'grade_rejected',
      link_url: '/dashboard'
    });

    // Notify teacher
    if (teacher_id) {
      await this.notifyStaff({
        recipient: teacher_id,
        role: 'teacher',
        message: `Grade submission rejected for ${student_name} - ${subject} (${term}). Reason: ${reason}`,
        type: 'grade_rejected',
        link_url: '/teacher/dashboard'
      });
    }
  },

  /**
   * Notify when a document is requested
   */
  async notifyDocumentRequested({ student_id, student_name, document_type, document_id, teacher_id }) {
    // Notify the teacher (adviser) first - they need to approve before registrar
    if (teacher_id) {
      await this.notifyStaff({
        recipient: teacher_id,
        role: 'teacher',
        message: `New Document Request: ${student_name} requested ${document_type}`,
        type: 'document_request',
        reference_id: document_id,
        reference_type: 'document',
        link_url: '/teacher/dashboard'
      });
    }

    // Also notify principal (full access)
    await this.notifyRole({
      role: 'principal',
      message: `Document Request: ${student_name} requested ${document_type}`,
      type: 'document_request',
      reference_id: document_id,
      reference_type: 'document',
      link_url: '/admin/principal/dashboard'
    });
  },

  /**
   * Notify registrar when teacher approves document
   */
  async notifyDocumentApprovedByTeacher({ student_id, student_name, document_type, document_id }) {
    // Notify registrar to process the document
    await this.notifyRole({
      role: 'registrar',
      message: `Document Request Approved: ${student_name} - ${document_type} (Ready for processing)`,
      type: 'document_approved',
      reference_id: document_id,
      reference_type: 'document',
      link_url: '/admin/registrar/dashboard'
    });

    // Also notify principal (full access)
    await this.notifyRole({
      role: 'principal',
      message: `Document Approved by Teacher: ${student_name} - ${document_type}`,
      type: 'document_approved',
      reference_id: document_id,
      reference_type: 'document',
      link_url: '/admin/principal/dashboard'
    });
  },

  /**
   * Notify when a document is ready
   */
  async notifyDocumentReady({ student_id, document_type, document_id }) {
    await this.notifyStudent({
      student_id,
      message: `Your ${document_type} is ready for pickup!`,
      type: 'document_ready',
      link_url: '/documents'
    });
  },

  /**
   * Notify when enrollment is approved
   */
  async notifyEnrollmentApproved({ student_id, student_name, school_year }) {
    await this.notifyStudent({
      student_id,
      message: `Congratulations! Your enrollment for ${school_year} has been approved.`,
      type: 'enrollment_approved',
      link_url: '/dashboard'
    });
  },

  /**
   * Notify when a new enrollment is submitted
   */
  async notifyNewEnrollment({ student_name, grade_level, track }) {
    // Notify registrar
    await this.notifyRole({
      role: 'registrar',
      message: `New Enrollment: ${student_name} (Grade ${grade_level} - ${track})`,
      type: 'enrollment',
      link_url: '/admin/registrar/dashboard'
    });

    // Also notify principal (full access)
    await this.notifyRole({
      role: 'principal',
      message: `New Enrollment: ${student_name} (Grade ${grade_level} - ${track})`,
      type: 'enrollment',
      link_url: '/admin/principal/dashboard'
    });
  },

  /**
   * Notify when payment is received
   */
  async notifyPaymentReceived({ student_id, amount, payment_type, receipt_number }) {
    await this.notifyStudent({
      student_id,
      message: `Payment of ₱${amount.toLocaleString()} received. Receipt #${receipt_number}`,
      type: 'payment_received',
      link_url: '/dashboard'
    });
  },

  /**
   * Notify accounting of new payment
   */
  async notifyNewPayment({ student_name, amount, payment_type, payment_id }) {
    await this.notifyRole({
      role: 'accounting',
      message: `New Payment: ${student_name} paid ₱${amount.toLocaleString()} (${payment_type})`,
      type: 'payment',
      reference_id: payment_id,
      reference_type: 'payment',
      link_url: '/accounting/dashboard'
    });
  },

  /**
   * Notify when fees are assigned to student
   */
  async notifyFeesAssigned({ student_id, total_amount, assigned_by }) {
    await this.notifyStudent({
      student_id,
      message: `Your fees have been assessed: ₱${total_amount.toLocaleString()}. View details in your dashboard.`,
      type: 'fee_assigned',
      link_url: '/dashboard'
    });
  },

  /**
   * Notify student of balance due
   */
  async notifyBalanceDue({ student_id, balance_amount }) {
    await this.notifyStudent({
      student_id,
      message: `Payment reminder: You have a balance of ₱${balance_amount.toLocaleString()}`,
      type: 'balance_due',
      link_url: '/dashboard'
    });
  }
};

module.exports = NotificationService;
