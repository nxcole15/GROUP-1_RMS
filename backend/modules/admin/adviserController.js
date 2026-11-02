/**
 * modules/admin/adviserController.js
 * Controller for adviser assignment operations
 */
const AdviserModel = require("./adviserModel");
const AdminSettingsModel = require("./adminSettingsModel");

const AdviserController = {
  /**
   * GET /api/admin/advisers/students
   * Get students list with filter options and adviser information
   */
  async getStudents(req, res) {
    try {
      // Get active academic configuration
      const activeConfig = await AdminSettingsModel.getActiveConfig();
      if (!activeConfig) {
        return res.status(400).json({
          success: false,
          message: "Academic period has not been configured. Please contact the Principal Admin.",
        });
      }

      const {
        gradeLevel,
        track,
        strand,
        adviserStatus,
        searchQuery,
        page = 1,
        limit = 50,
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const students = await AdviserModel.getStudentsWithAdvisers({
        gradeLevel,
        track,
        strand,
        adviserStatus,
        schoolYearId: activeConfig.id,
        searchQuery,
        limit: parseInt(limit),
        offset,
      });

      const total = await AdviserModel.getStudentsCount({
        gradeLevel,
        track,
        strand,
        adviserStatus,
        schoolYearId: activeConfig.id,
        searchQuery,
      });

      res.json({
        success: true,
        students,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        academicPeriod: {
          schoolYear: activeConfig.school_year,
          term: activeConfig.current_term,
          schoolYearId: activeConfig.id,
        },
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch students",
        error: error.message,
      });
    }
  },

  /**
   * GET /api/admin/advisers/teachers
   * Get all available teachers for adviser assignment
   */
  async getTeachers(req, res) {
    try {
      const teachers = await AdviserModel.getAvailableTeachers();
      res.json({
        success: true,
        teachers,
      });
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch teachers",
        error: error.message,
      });
    }
  },

  /**
   * POST /api/admin/advisers/assign
   * Assign adviser to a student or multiple students
   */
  async assignAdviser(req, res) {
    try {
      const { studentIds, teacherId, replace = false } = req.body;
      const assignedBy = req.admin.admin_id;

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one student",
        });
      }

      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: "Please select a teacher to assign as adviser",
        });
      }

      // Get active academic configuration
      const activeConfig = await AdminSettingsModel.getActiveConfig();
      if (!activeConfig) {
        return res.status(400).json({
          success: false,
          message: "Academic period has not been configured",
        });
      }

      if (studentIds.length === 1) {
        // Single assignment
        const result = await AdviserModel.assignAdviser({
          studentId: studentIds[0],
          teacherId,
          schoolYearId: activeConfig.id,
          assignedBy,
          replace,
        });

        if (!result.success) {
          return res.status(409).json({
            success: false,
            message: result.message,
            requiresConfirmation: true,
          });
        }

        return res.json({
          success: true,
          message: result.replaced
            ? "Adviser has been successfully changed"
            : "Adviser has been successfully assigned",
          replaced: result.replaced,
        });
      } else {
        // Bulk assignment
        const results = await AdviserModel.bulkAssignAdviser({
          studentIds,
          teacherId,
          schoolYearId: activeConfig.id,
          assignedBy,
          replace,
        });

        const totalSuccess = results.success.length + results.replaced.length;
        const totalSkipped = results.skipped.length;
        const totalErrors = results.errors.length;

        if (totalSkipped > 0 && !replace) {
          return res.status(409).json({
            success: false,
            message: `${totalSkipped} student(s) already have an adviser. Do you want to replace their current adviser?`,
            requiresConfirmation: true,
            skipped: results.skipped,
          });
        }

        return res.json({
          success: true,
          message: `Successfully assigned adviser to ${totalSuccess} student(s)`,
          results: {
            success: totalSuccess,
            skipped: totalSkipped,
            errors: totalErrors,
          },
        });
      }
    } catch (error) {
      console.error("Error assigning adviser:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign adviser",
        error: error.message,
      });
    }
  },

  /**
   * DELETE /api/admin/advisers/:assignmentId
   * Remove adviser assignment
   */
  async removeAdviser(req, res) {
    try {
      const { assignmentId } = req.params;

      if (!assignmentId) {
        return res.status(400).json({
          success: false,
          message: "Assignment ID is required",
        });
      }

      await AdviserModel.removeAdviser(assignmentId);

      res.json({
        success: true,
        message: "Adviser assignment has been removed",
      });
    } catch (error) {
      console.error("Error removing adviser:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove adviser",
        error: error.message,
      });
    }
  },

  /**
   * GET /api/admin/advisers/stats
   * Get adviser assignment statistics
   */
  async getStats(req, res) {
    try {
      const activeConfig = await AdminSettingsModel.getActiveConfig();
      if (!activeConfig) {
        return res.status(400).json({
          success: false,
          message: "Academic period has not been configured",
        });
      }

      const stats = await AdviserModel.getAdviserStats(activeConfig.id);

      res.json({
        success: true,
        stats,
        academicPeriod: {
          schoolYear: activeConfig.school_year,
          term: activeConfig.current_term,
        },
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch statistics",
        error: error.message,
      });
    }
  },

  /**
   * GET /api/admin/advisers/filters
   * Get filter options (tracks, strands)
   */
  async getFilterOptions(req, res) {
    try {
      const { track } = req.query;

      const tracks = await AdviserModel.getTracks();
      const strands = await AdviserModel.getStrands(track);

      res.json({
        success: true,
        tracks,
        strands,
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch filter options",
        error: error.message,
      });
    }
  },
};

module.exports = AdviserController;
