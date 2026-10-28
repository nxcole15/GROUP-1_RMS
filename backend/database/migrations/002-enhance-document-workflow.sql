-- ============================================================
-- Migration: Enhance Document Workflow
-- Description: Add multi-step approval workflow for documents
-- Student → Teacher → Registrar → Principal → Ready for Pickup
-- ============================================================

-- 1. Modify status column to include new workflow states
ALTER TABLE documents 
MODIFY COLUMN status ENUM(
  'student_requested',
  'teacher_approved',
  'registrar_forwarded',
  'principal_approved',
  'principal_rejected',
  'ready_for_pickup',
  'released',
  'rejected'
) NOT NULL DEFAULT 'student_requested';

-- 2. Add new columns for tracking workflow
ALTER TABLE documents 
ADD COLUMN teacher_id VARCHAR(20) NULL AFTER student_id,
ADD COLUMN teacher_reviewed_at DATETIME NULL AFTER admin_timestamp,
ADD COLUMN registrar_id VARCHAR(20) NULL AFTER teacher_id,
ADD COLUMN registrar_forwarded_at DATETIME NULL AFTER teacher_reviewed_at,
ADD COLUMN principal_id VARCHAR(20) NULL AFTER registrar_id,
ADD COLUMN principal_reviewed_at DATETIME NULL AFTER registrar_forwarded_at,
ADD COLUMN pickup_date DATE NULL AFTER expected_release_date,
ADD COLUMN pickup_time TIME NULL AFTER pickup_date,
ADD COLUMN pickup_location VARCHAR(200) NULL AFTER pickup_time,
ADD COLUMN released_at DATETIME NULL AFTER pickup_location,
ADD COLUMN released_by VARCHAR(20) NULL AFTER released_at;

-- 3. Update existing records to new status
UPDATE documents 
SET status = 'student_requested' 
WHERE status = 'pending';

UPDATE documents 
SET status = 'principal_approved' 
WHERE status = 'approved';

UPDATE documents 
SET status = 'principal_rejected' 
WHERE status = 'rejected';

-- 4. Add indexes for better query performance
CREATE INDEX idx_documents_teacher ON documents(teacher_id);
CREATE INDEX idx_documents_registrar ON documents(registrar_id);
CREATE INDEX idx_documents_principal ON documents(principal_id);
CREATE INDEX idx_documents_status ON documents(status);

SELECT 'Migration 002: Document workflow enhancement completed successfully!' as status;
