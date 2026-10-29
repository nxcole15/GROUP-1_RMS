/**
 * modules/fees/feeController.js
 * Fee management API handlers for Accounting
 */
const FeeModel = require("./feeModel");

// ==================== FEE ITEMS MANAGEMENT ====================

async function getAllFeeItems(req, res, next) {
  try {
    const items = await FeeModel.getAllFeeItems();
    res.json({ fee_items: items });
  } catch (err) {
    next(err);
  }
}

async function createFeeItem(req, res, next) {
  try {
    const { item_name, description, default_amount } = req.body;
    const created_by = req.admin.admin_id;

    if (!item_name || item_name.trim().length === 0) {
      return res.status(400).json({ error: "Fee item name is required" });
    }

    if (default_amount === undefined || parseFloat(default_amount) < 0) {
      return res.status(400).json({ error: "Default amount is required and must be non-negative" });
    }

    const item = await FeeModel.createFeeItem({
      item_name: item_name.trim(),
      description: description?.trim(),
      default_amount: parseFloat(default_amount),
      created_by
    });

    res.status(201).json({ 
      message: "Fee item created successfully",
      fee_item: item 
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Fee item with this name already exists" });
    }
    next(err);
  }
}

async function updateFeeItem(req, res, next) {
  try {
    const { id } = req.params;
    const { item_name, description, default_amount } = req.body;

    if (!item_name || item_name.trim().length === 0) {
      return res.status(400).json({ error: "Fee item name is required" });
    }

    if (default_amount !== undefined && parseFloat(default_amount) < 0) {
      return res.status(400).json({ error: "Default amount must be non-negative" });
    }

    const item = await FeeModel.updateFeeItem(parseInt(id), {
      item_name: item_name.trim(),
      description: description?.trim(),
      default_amount: default_amount !== undefined ? parseFloat(default_amount) : undefined
    });

    if (!item) {
      return res.status(404).json({ error: "Fee item not found" });
    }

    res.json({ 
      message: "Fee item updated successfully",
      fee_item: item 
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Fee item with this name already exists" });
    }
    next(err);
  }
}

async function archiveFeeItem(req, res, next) {
  try {
    const { id } = req.params;
    const affectedCount = await FeeModel.archiveFeeItem(parseInt(id));
    
    res.json({ 
      message: "Fee item archived successfully",
      affected_assessments: affectedCount,
      info: affectedCount > 0 
        ? `Removed from ${affectedCount} student assessment(s) and recalculated their totals` 
        : "No student assessments were affected"
    });
  } catch (err) {
    next(err);
  }
}

async function deleteFeeItem(req, res, next) {
  try {
    const { id } = req.params;
    const affectedCount = await FeeModel.deleteFeeItem(parseInt(id));
    
    res.json({ 
      message: "Fee item permanently deleted",
      affected_assessments: affectedCount,
      info: affectedCount > 0 
        ? `Removed from ${affectedCount} student assessment(s) and recalculated their totals` 
        : "No student assessments were affected"
    });
  } catch (err) {
    next(err);
  }
}

// ==================== STUDENT ASSESSMENTS ====================

async function getStudentsWithFees(req, res, next) {
  try {
    // Get current academic config
    const school_year = req.query.school_year || "2026-2027";
    const term = req.query.term || "Term 1";

    const students = await FeeModel.getStudentsWithAssessmentStatus(school_year, term);
    const stats = await FeeModel.getAssessmentStats(school_year, term);

    res.json({ 
      students,
      stats,
      school_year,
      term
    });
  } catch (err) {
    next(err);
  }
}

async function getStudentAssessment(req, res, next) {
  try {
    const { student_id } = req.params;
    const school_year = req.query.school_year || "2026-2027";
    const term = req.query.term || "Term 1";

    const assessment = await FeeModel.getCompleteAssessment(student_id, school_year, term);
    
    if (!assessment) {
      return res.json({ 
        message: "No assessment found for this student",
        assessment: null 
      });
    }

    // Get payment info
    const PaymentModel = require("../payments/paymentModel");
    const summary = await PaymentModel.computeSummary(student_id);

    res.json({ 
      assessment,
      payment_summary: summary
    });
  } catch (err) {
    next(err);
  }
}

async function assignFees(req, res, next) {
  try {
    const { student_id } = req.params;
    const {
      school_year,
      term,
      line_items, // Array of { fee_item_id, amount }
      discount_amount,
      discount_reason,
      notes
    } = req.body;
    const assessed_by = req.admin.admin_id;

    // Validation
    if (!school_year || !term) {
      return res.status(400).json({ error: "School year and term are required" });
    }

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ error: "At least one fee item is required" });
    }

    // Validate line items
    for (const item of line_items) {
      if (!item.fee_item_id || !item.amount) {
        return res.status(400).json({ error: "Each line item must have fee_item_id and amount" });
      }
      if (parseFloat(item.amount) < 0) {
        return res.status(400).json({ error: "Amount cannot be negative" });
      }
    }

    const assessment = await FeeModel.upsertStudentAssessment({
      student_id,
      school_year,
      term,
      line_items,
      discount_amount: parseFloat(discount_amount) || 0,
      discount_reason,
      assessed_by,
      notes
    });

    // Send notification to student
    const db = require("../../config/db");
    await db.query(
      `INSERT INTO notifications (student_id, message, type, created_at)
       VALUES (?, ?, 'payment', NOW())`,
      [
        student_id,
        `Your tuition fees for ${term} SY ${school_year} have been assessed. Total: ₱${assessment.net_assessment.toLocaleString()}. Please check your dashboard for the breakdown.`
      ]
    );

    res.json({ 
      message: "Fees assigned successfully",
      assessment 
    });
  } catch (err) {
    next(err);
  }
}

async function bulkAssignFees(req, res, next) {
  try {
    const {
      student_ids, // Array of student IDs
      school_year,
      term,
      line_items,
      discount_amount,
      discount_reason,
      notes
    } = req.body;
    const assessed_by = req.admin.admin_id;

    // Validation
    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: "Student IDs array is required" });
    }

    if (!school_year || !term) {
      return res.status(400).json({ error: "School year and term are required" });
    }

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ error: "At least one fee item is required" });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Assign fees to each student
    for (const student_id of student_ids) {
      try {
        await FeeModel.upsertStudentAssessment({
          student_id,
          school_year,
          term,
          line_items,
          discount_amount: parseFloat(discount_amount) || 0,
          discount_reason,
          assessed_by,
          notes
        });

        // Send notification
        const db = require("../../config/db");
        const total = line_items.reduce((sum, item) => sum + parseFloat(item.amount), 0) - (parseFloat(discount_amount) || 0);
        await db.query(
          `INSERT INTO notifications (student_id, message, type, created_at)
           VALUES (?, ?, 'payment', NOW())`,
          [
            student_id,
            `Your tuition fees for ${term} SY ${school_year} have been assessed. Total: ₱${total.toLocaleString()}. Please check your dashboard for the breakdown.`
          ]
        );

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          student_id,
          error: error.message
        });
      }
    }

    res.json({ 
      message: `Fees assigned to ${results.success} student(s)`,
      results 
    });
  } catch (err) {
    next(err);
  }
}

async function deleteAssessment(req, res, next) {
  try {
    const { student_id } = req.params;
    const school_year = req.query.school_year || "2026-2027";
    const term = req.query.term || "Term 1";

    await FeeModel.deleteStudentAssessment(student_id, school_year, term);
    res.json({ message: "Assessment deleted successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Fee Items
  getAllFeeItems,
  createFeeItem,
  updateFeeItem,
  archiveFeeItem,
  deleteFeeItem,
  
  // Student Assessments
  getStudentsWithFees,
  getStudentAssessment,
  assignFees,
  bulkAssignFees,
  deleteAssessment
};

// ==================== STUDENT-FACING ENDPOINTS ====================

/**
 * Get own assessment (for students)
 * Uses student token to get their own assessment
 */
async function getMyAssessment(req, res, next) {
  try {
    const student_id = req.student?.student_id; // From student auth middleware
    
    if (!student_id) {
      return res.status(401).json({ error: "Student authentication required" });
    }
    
    const school_year = req.query.school_year || "2026-2027";
    const term = req.query.term || "Term 1";

    const assessment = await FeeModel.getCompleteAssessment(student_id, school_year, term);
    
    if (!assessment) {
      return res.json({ 
        message: "No assessment found for this term",
        assessment: null 
      });
    }

    // Get payment info
    const PaymentModel = require("../payments/paymentModel");
    const summary = await PaymentModel.computeSummary(student_id);

    res.json({ 
      assessment,
      payment_summary: summary
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Fee Items
  getAllFeeItems,
  createFeeItem,
  updateFeeItem,
  archiveFeeItem,
  deleteFeeItem,
  
  // Student Assessments (Admin)
  getStudentsWithFees,
  getStudentAssessment,
  assignFees,
  bulkAssignFees,
  deleteAssessment,
  
  // Student-facing
  getMyAssessment
};
