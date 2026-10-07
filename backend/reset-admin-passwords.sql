USE smart_student_service;

-- Reset passwords for ADMIN001, ADMIN002, ADMIN003 to "admin123"
UPDATE admins 
SET password = '$2a$10$u90HiCbXFVX3gWf5ZSt5uOcYFEp1.kC9E4DHfm0joUi5IGNMNSL2y' 
WHERE admin_id IN ('ADMIN001', 'ADMIN002', 'ADMIN003');

SELECT admin_id, full_name, role, email, LENGTH(password) as password_length 
FROM admins 
WHERE admin_id IN ('ADMIN001', 'ADMIN002', 'ADMIN003');
