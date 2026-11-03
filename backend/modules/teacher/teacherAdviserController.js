/**
 * modules/teacher/teacherAdviserController.js
 * Controller for teacher to view their advisees
 */
const AdviserModel = require("../admin/adviserModel");
const AdminSettingsModel = require("../admin/adminSettingsModel");

const TeacherAdviserController = {
  /**
   * GET /api/teacher/advisees
   * Get list of students assigned to this teacher as adviser
   */
  async getMyAdvisees(req, res) {
    try {
      // Get teacher's numeric database ID from authenticated teacher
      const teacherId = req.teacher.id;

      // Get active academic configuration
      const activeConfig = await AdminSettingsModel.getActiveConfig();
      if (!activeConfig) {
        return res.json({
          success: true,
          advisees: [],
          academicPeriod: null,
          message: "Academic period has not been configured",
        });
      }

      // Get advisees for this teacher
      const advisees = await AdviserModel.getAdviseesForTeacher(
        teacherId,
        activeConfig.id
      );

      // Group advisees by grade, track, and strand
      const grouped = advisees.reduce((acc, student) => {
        const key = `${student.grade_level}-${student.track}-${student.strand}`;
        if (!acc[key]) {
          acc[key] = {
            gradeLevel: student.grade_level,
            track: student.track,
            strand: student.strand,
            students: [],
          };
        }
        acc[key].students.push(student);
        return acc;
      }, {});

      res.json({
        success: true,
        advisees,
        grouped: Object.values(grouped),
        total: advisees.length,
        academicPeriod: {
          schoolYear: activeConfig.school_year,
          term: activeConfig.current_term,
        },
      });
    } catch (error) {
      console.error("Error fetching advisees:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch advisees",
        error: error.message,
      });
    }
  },
};

module.exports = TeacherAdviserController;
