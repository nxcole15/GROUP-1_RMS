/**
 * modules/notifications/staffNotificationController.js
 * Controller for staff (admin, principal, registrar, teacher, accounting) notifications
 */
const StaffNotificationModel = require("./staffNotificationModel");

/**
 * GET /api/staff-notifications
 * Get notifications for the authenticated staff member
 */
async function getMyNotifications(req, res, next) {
  try {
    const role = req.admin?.role || req.teacher?.role || req.user?.role;
    // For teachers, use the numeric id, not teacher_id string
    const recipient = req.admin?.admin_id || req.teacher?.id || req.user?.id;

    if (!role || !recipient) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get notifications for this specific user
    const personalNotifs = await StaffNotificationModel.findByStaff(role, recipient);
    // Get role-wide notifications (recipient = 'ALL')
    const roleNotifs = await StaffNotificationModel.findByRole(role);
    
    // Combine and sort by created_at
    const notifications = [...personalNotifs, ...roleNotifs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const unread_count = await StaffNotificationModel.countUnread(role, recipient);

    res.json({ 
      notifications, 
      unread_count,
      role,
      recipient 
    });
  } catch (err) { 
    next(err); 
  }
}

/**
 * POST /api/staff-notifications/read
 * Mark all notifications as read for the authenticated staff member
 */
async function markAllRead(req, res, next) {
  try {
    const role = req.admin?.role || req.teacher?.role || req.user?.role;
    // For teachers, use the numeric id, not teacher_id string
    const recipient = req.admin?.admin_id || req.teacher?.id || req.user?.id;

    if (!role || !recipient) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await StaffNotificationModel.markAllRead(role, recipient);
    
    res.json({ 
      message: "All notifications marked as read.", 
      unread_count: 0 
    });
  } catch (err) { 
    next(err); 
  }
}

/**
 * PATCH /api/staff-notifications/:id/read
 * Mark a specific notification as read
 */
async function markOneRead(req, res, next) {
  try {
    const { id } = req.params;
    await StaffNotificationModel.markOneRead(id);
    
    res.json({ 
      message: "Notification marked as read.",
      id 
    });
  } catch (err) { 
    next(err); 
  }
}

/**
 * DELETE /api/staff-notifications/:id
 * Delete a specific notification
 */
async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    const role = req.admin?.role || req.teacher?.role || req.user?.role;
    // For teachers, use the numeric id, not teacher_id string
    const recipient = req.admin?.admin_id || req.teacher?.id || req.user?.id;

    if (!role || !recipient) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await StaffNotificationModel.delete(id, role, recipient);
    
    res.json({ 
      message: "Notification deleted.",
      id 
    });
  } catch (err) { 
    next(err); 
  }
}

module.exports = { 
  getMyNotifications, 
  markAllRead, 
  markOneRead,
  deleteNotification
};
