-- ============================================================
-- Migration: Enhance Document Workflow (SIMPLE VERSION FOR RAILWAY)
-- Description: Add multi-step approval workflow for documents
-- Run each ALTER TABLE separately if one fails
-- ============================================================

-- 1. First, modify status column
ALTER TABLE documents 
MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'student_requested';

-- 2. Add columns one by one (ignore errors if column exists)

ALTER TABLE documents ADD COLUMN teacher_id VARCHAR(20) NULL AFTER student_id;

ALTER TABLE documents ADD COLUMN teacher_reviewed_at DATETIME NULL;

ALTER TABLE documents ADD COLUMN registrar_id VARCHAR(20) NULL;

ALTER TABLE documents ADD COLUMN registrar_forwarded_at DATETIME NULL;

ALTER TABLE documents ADD COLUMN principal_id VARCHAR(20) NULL;

ALTER TABLE documents ADD COLUMN principal_reviewed_at DATETIME NULL;

ALTER TABLE documents ADD COLUMN pickup_date DATE NULL;

ALTER TABLE documents ADD COLUMN pickup_time TIME NULL;

ALTER TABLE documents ADD COLUMN pickup_location VARCHAR(200) NULL;

ALTER TABLE documents ADD COLUMN released_at DATETIME NULL;

ALTER TABLE documents ADD COLUMN released_by VARCHAR(20) NULL;

-- 3. Add indexes (ignore errors if index exists)

CREATE INDEX idx_documents_teacher ON documents(teacher_id);

CREATE INDEX idx_documents_registrar ON documents(registrar_id);

CREATE INDEX idx_documents_principal ON documents(principal_id);

CREATE INDEX idx_documents_status ON documents(status);
