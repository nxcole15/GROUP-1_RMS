USE smart_student_service;

-- Insert PRINCIPAL01 with password: principal2026
INSERT INTO admins (admin_id, password, full_name, role, email)
VALUES ('PRINCIPAL01', '$2a$10$XXvgD2PGAEqY5NxvLz/duOvsq0l5.HodhOd08HY.KosICd0vGBXPm', 'School Principal', 'principal', 'principal@cfei.edu')
ON DUPLICATE KEY UPDATE password = '$2a$10$XXvgD2PGAEqY5NxvLz/duOvsq0l5.HodhOd08HY.KosICd0vGBXPm';

-- Insert REGISTRAR02 with password: registrar2026
INSERT INTO admins (admin_id, password, full_name, role, email)
VALUES ('REGISTRAR02', '$2a$10$R1IX0gelGUX/p9dKlwMsdexxxgWqvBa1eGjh0lCbSDa3UgGVrDHeS', 'Registrar Office', 'registrar', 'registrar@cfei.edu')
ON DUPLICATE KEY UPDATE password = '$2a$10$R1IX0gelGUX/p9dKlwMsdexxxgWqvBa1eGjh0lCbSDa3UgGVrDHeS';

-- Insert ACCOUNTING03 with password: accounting2026
INSERT INTO admins (admin_id, password, full_name, role, email)
VALUES ('ACCOUNTING03', '$2a$10$A8jZKVJ2aaxZOmTv5Vm/juql46n.fqGn/twe68DIJ2dwBkFHUyT66', 'Accounting Office', 'accounting', 'accounting@cfei.edu')
ON DUPLICATE KEY UPDATE password = '$2a$10$A8jZKVJ2aaxZOmTv5Vm/juql46n.fqGn/twe68DIJ2dwBkFHUyT66';

-- Show the created accounts
SELECT admin_id, full_name, role, email, LENGTH(password) as password_length 
FROM admins 
WHERE admin_id IN ('PRINCIPAL01', 'REGISTRAR02', 'ACCOUNTING03');
