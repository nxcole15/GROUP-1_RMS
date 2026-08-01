/**
 * modules/student/enrollmentController.js
 * Student-facing enrollment operations.
 */
const EnrollmentModel = require("./enrollmentModel");
const ConfigModel     = require("../shared/configModel");

async function getMyEnrollment(req, res, next) {
  try {
    const { student_id } = req.student;
    const config = await ConfigModel.getEnrollmentConfig();
    const enrollment = await EnrollmentModel.findByStudentAndTerm(
      student_id, config.active_term
    );

    if (!enrollment) {
      return res.json({ enrollment: null, message: "No enrollment found for this term." });
    }

    const subjects = await Promise.all(
      enrollment.subjects.map((sid) => ConfigModel.getSubjectById(sid))
    );
    enrollment.subjects = subjects
      .filter(Boolean)
      .map(({ id, code, name, units }) => ({ id, code, name, units }));

    res.json({ enrollment });
  } catch (err) { next(err); }
}

async function getAvailableSubjects(req, res, next) {
  try {
    const subjects = await ConfigModel.getSubjects();
    res.json({
      subjects: subjects.map((s) => ({
        id:             s.id,
        code:           s.code,
        name:           s.name,
        units:          s.units,
        teacher_name:   s.teacher_name,
        max_capacity:   s.max_capacity,
        enrolled_count: s.enrolled_count,
        is_full:        s.enrolled_count >= s.max_capacity,
      })),
    });
  } catch (err) { next(err); }
}

async function submitEnrollment(req, res, next) {
  try {
    const { student_id } = req.student;
    const { subjects }   = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "Please select at least one subject." });
    }

    const config = await ConfigModel.getEnrollmentConfig();

    if (new Date() > config.deadline) {
      return res.status(400).json({
        error: `Enrollment is closed. The deadline was ${config.deadline.toLocaleString()}.`,
      });
    }

    const existing = await EnrollmentModel.findByStudentAndTerm(student_id, config.active_term);
    if (existing) {
      return res.status(409).json({
        error:  "You already have an enrollment record for this term.",
        status: existing.status,
      });
    }

    for (const sid of subjects) {
      const subject = await ConfigModel.getSubjectById(sid);
      if (!subject) {
        return res.status(400).json({ error: `Subject ID ${sid} does not exist.` });
      }
      if (subject.enrolled_count >= subject.max_capacity) {
        return res.status(400).json({
          error: `This subject is full: ${subject.name} (${subject.code}).`,
        });
      }
    }

    const enrollment = await EnrollmentModel.create({
      student_id,
      term: config.active_term,
      subjects,
    });

    res.status(201).json({
      message:          "Enrollment submitted successfully. Awaiting admin approval.",
      reference_number: `ENR-${enrollment.id}`,
      enrollment,
    });
  } catch (err) { next(err); }
}

module.exports = { getMyEnrollment, getAvailableSubjects, submitEnrollment };
