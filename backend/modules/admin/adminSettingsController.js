/**
 * modules/admin/adminSettingsController.js
 * Controller for system settings management
 */
const AdminSettingsModel = require('./adminSettingsModel');

/**
 * GET /api/admin/settings/academic-config
 * Get active academic configuration
 */
async function getAcademicConfig(req, res, next) {
  try {
    const config = await AdminSettingsModel.getActiveConfig();
    
    if (!config) {
      return res.status(404).json({ 
        error: 'No active school year configured' 
      });
    }

    res.json({ active: config });
  } catch (err) {
    console.error('Get academic config error:', err);
    next(err);
  }
}

/**
 * GET /api/admin/settings/school-years
 * Get all school years
 */
async function getSchoolYears(req, res, next) {
  try {
    const schoolYears = await AdminSettingsModel.getAllSchoolYears();
    res.json({ school_years: schoolYears });
  } catch (err) {
    console.error('Get school years error:', err);
    next(err);
  }
}

/**
 * POST /api/admin/settings/school-years
 * Create new school year
 */
async function createSchoolYear(req, res, next) {
  try {
    const { school_year, starting_term } = req.body;
    const admin_id = req.admin?.admin_id || 'ADMIN';

    // Validation
    if (!school_year || !starting_term) {
      return res.status(400).json({ 
        error: 'School year and starting term are required' 
      });
    }

    if (!['Term 1', 'Term 2', 'Term 3'].includes(starting_term)) {
      return res.status(400).json({ 
        error: 'Invalid term. Must be Term 1, Term 2, or Term 3' 
      });
    }

    // Create school year
    const newId = await AdminSettingsModel.createSchoolYear({
      school_year,
      starting_term,
      created_by: admin_id
    });

    // Send notifications
    await AdminSettingsModel.notifyStaff(
      'New School Year',
      `School Year ${school_year} has been created and is now active, starting with ${starting_term}.`,
      'year_change'
    );

    await AdminSettingsModel.notifyStudents(
      `Welcome to School Year ${school_year}! The new academic year has begun.`
    );

    res.status(201).json({
      success: true,
      message: `School year ${school_year} created successfully`,
      school_year_id: newId
    });
  } catch (err) {
    console.error('Create school year error:', err);
    next(err);
  }
}

/**
 * PUT /api/admin/settings/school-years/:id
 * Update school year details
 */
async function updateSchoolYear(req, res, next) {
  try {
    const { id } = req.params;
    const { school_year, current_term } = req.body;
    const admin_id = req.admin?.admin_id || 'ADMIN';

    const updated = await AdminSettingsModel.updateSchoolYear(id, {
      school_year,
      current_term,
      last_modified_by: admin_id
    });

    res.json({
      success: true,
      message: 'School year updated successfully',
      school_year: updated
    });
  } catch (err) {
    console.error('Update school year error:', err);
    next(err);
  }
}

/**
 * DELETE /api/admin/settings/school-years/:id
 * Delete school year (only completed ones)
 */
async function deleteSchoolYear(req, res, next) {
  try {
    const { id } = req.params;

    await AdminSettingsModel.deleteSchoolYear(id);

    res.json({
      success: true,
      message: 'School year deleted successfully'
    });
  } catch (err) {
    if (err.message.includes('Cannot delete')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Delete school year error:', err);
    next(err);
  }
}

/**
 * POST /api/admin/settings/complete-term
 * Complete current term and advance to next
 */
async function completeTerm(req, res, next) {
  try {
    const { school_year_id } = req.body;
    const admin_id = req.admin?.admin_id || 'ADMIN';

    if (!school_year_id) {
      return res.status(400).json({ 
        error: 'School year ID is required' 
      });
    }

    // Get current config before completing
    const config = await AdminSettingsModel.getSchoolYearById(school_year_id);
    if (!config) {
      return res.status(404).json({ error: 'School year not found' });
    }

    const currentTerm = config.current_term;
    const schoolYear = config.school_year;

    // Complete the term
    const result = await AdminSettingsModel.completeTerm(school_year_id, admin_id);

    // Send notifications based on what happened
    if (result.school_year_completed) {
      // School year completed (Term 3 done)
      await AdminSettingsModel.notifyStaff(
        'School Year Completed',
        `School Year ${schoolYear} has been completed! All three terms are now finalized.`,
        'year_change'
      );

      await AdminSettingsModel.notifyStudents(
        `School Year ${schoolYear} has been completed. Thank you for a wonderful year! See you next school year.`
      );

      res.json({
        success: true,
        message: `School Year ${schoolYear} has been completed`,
        current_term: result.current_term,
        school_year_completed: true
      });
    } else {
      // Term completed, advancing to next term
      await AdminSettingsModel.notifyStaff(
        'Term Completed',
        `${currentTerm} for School Year ${schoolYear} has been completed. ${result.current_term} is now active.`,
        'term_change'
      );

      await AdminSettingsModel.notifyStudents(
        `${currentTerm} has ended and grades are now final. Welcome to ${result.current_term}!`
      );

      res.json({
        success: true,
        message: `${currentTerm} completed. Now in ${result.current_term}.`,
        current_term: result.current_term,
        school_year_completed: false
      });
    }
  } catch (err) {
    if (err.message.includes('Only active')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Complete term error:', err);
    next(err);
  }
}

/**
 * PUT /api/admin/settings/enrollment-config
 * Update enrollment period configuration
 */
async function updateEnrollmentConfig(req, res, next) {
  try {
    const { school_year_id, start_date, end_date, open_now } = req.body;
    const admin_id = req.admin?.admin_id || 'ADMIN';

    if (!school_year_id) {
      return res.status(400).json({ 
        error: 'School year ID is required' 
      });
    }

    // Get current config
    const config = await AdminSettingsModel.getSchoolYearById(school_year_id);
    if (!config) {
      return res.status(404).json({ error: 'School year not found' });
    }

    const updated = await AdminSettingsModel.updateEnrollmentConfig(school_year_id, {
      start_date,
      end_date,
      open_now,
      last_modified_by: admin_id
    });

    // Send notification if enrollment was opened
    if (open_now) {
      await AdminSettingsModel.notifyStaff(
        'Enrollment Opened',
        `Enrollment period for SY ${config.school_year} is now open until ${end_date || 'TBD'}.`,
        'enrollment_change'
      );

      await AdminSettingsModel.notifyStudents(
        `Enrollment for School Year ${config.school_year} is now open! Apply before ${end_date || 'the deadline'}.`
      );
    }

    res.json({
      success: true,
      message: open_now 
        ? 'Enrollment period updated and opened' 
        : 'Enrollment period updated',
      enrollment_is_open: updated.enrollment_is_open
    });
  } catch (err) {
    console.error('Update enrollment config error:', err);
    next(err);
  }
}

module.exports = {
  getAcademicConfig,
  getSchoolYears,
  createSchoolYear,
  updateSchoolYear,
  deleteSchoolYear,
  completeTerm,
  updateEnrollmentConfig
};
