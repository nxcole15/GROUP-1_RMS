-- Add missing columns to staff_notifications table
ALTER TABLE staff_notifications 
ADD COLUMN reference_id VARCHAR(50) DEFAULT NULL AFTER type;

ALTER TABLE staff_notifications 
ADD COLUMN reference_type VARCHAR(50) DEFAULT NULL AFTER reference_id;

ALTER TABLE staff_notifications 
ADD COLUMN link_url VARCHAR(255) DEFAULT NULL AFTER reference_type;
