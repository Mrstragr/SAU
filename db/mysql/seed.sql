-- Seed data for SAU Transport (MySQL)
USE sau_transport;
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (preserve IDs via auto-increment restart)
TRUNCATE TABLE Trips;
TRUNCATE TABLE Vehicles;
TRUNCATE TABLE Users;

-- Insert Students
INSERT INTO Users (name, email, phone, password_hash, role, student_id, department, year, total_trips, is_active)
VALUES
('Arjun Mehta', 'arjun.mehta@sau.ac.in', '+91 98765 43215', '$2b$12$hashedpassword1', 'student', 'SAU2023001', 'Computer Science', 2, 0, 1),
('Priya Gupta', 'priya.gupta@sau.ac.in', '+91 98765 43216', '$2b$12$hashedpassword2', 'student', 'SAU2023002', 'Economics', 1, 0, 1);

-- Insert Drivers
INSERT INTO Users (name, email, phone, password_hash, role, total_trips, is_active)
VALUES
('Raj Nath', 'raj.nath@sau.ac.in', '+91 98765 43210', '$2b$12$hashedpassword3', 'driver', 1250, 1),
('Surya', 'surya@sau.ac.in', '+91 98765 43211', '$2b$12$hashedpassword4', 'driver', 980, 1),
('Atul', 'atul@sau.ac.in', '+91 98765 43212', '$2b$12$hashedpassword5', 'driver', 1560, 0),
('Rohit', 'rohit@sau.ac.in', '+91 98765 43213', '$2b$12$hashedpassword6', 'driver', 720, 1),
('Suryanshu', 'suryanshu@sau.ac.in', '+91 98765 43214', '$2b$12$hashedpassword7', 'driver', 1100, 1);

-- Insert Admin
INSERT INTO Users (name, email, phone, password_hash, role, is_active)
VALUES ('Admin User', 'admin@sau.ac.in', '+91 98765 43217', '$2b$12$hashedpassword8', 'admin', 1);

-- Capture driver and student IDs by email
SET @driver_raj_id = (SELECT id FROM Users WHERE email = 'raj.nath@sau.ac.in');
SET @driver_surya_id = (SELECT id FROM Users WHERE email = 'surya@sau.ac.in');
SET @driver_atul_id = (SELECT id FROM Users WHERE email = 'atul@sau.ac.in');
SET @driver_rohit_id = (SELECT id FROM Users WHERE email = 'rohit@sau.ac.in');
SET @driver_suryanshu_id = (SELECT id FROM Users WHERE email = 'suryanshu@sau.ac.in');

SET @student_arjun_id = (SELECT id FROM Users WHERE email = 'arjun.mehta@sau.ac.in');
SET @student_priya_id = (SELECT id FROM Users WHERE email = 'priya.gupta@sau.ac.in');

-- Vehicles
INSERT INTO Vehicles (vehicle_number, driver_id, capacity, battery_level, current_status, current_passengers, current_lat, current_lng, current_address, is_active, is_eco_friendly)
VALUES
('SAU-001', @driver_raj_id, 4, 85, 'waiting', 0, 28.6139, 77.2090, 'Main Gate, SAU Campus', 1, 1),
('SAU-002', @driver_surya_id, 4, 92, 'confirm', 3, 28.6145, 77.2095, 'Library Building, SAU Campus', 1, 1),
('SAU-003', @driver_atul_id, 4, 45, 'offline', 0, 28.6140, 77.2085, 'Cafeteria, SAU Campus', 1, 1),
('SAU-004', @driver_rohit_id, 4, 78, 'waiting', 1, 28.6135, 77.2100, 'Academic Block, SAU Campus', 1, 1),
('SAU-005', @driver_suryanshu_id, 4, 88, 'waiting', 0, 28.6142, 77.2088, 'Hostel Area, SAU Campus', 1, 1);

-- Capture vehicle IDs by vehicle_number
SET @veh_1 = (SELECT id FROM Vehicles WHERE vehicle_number = 'SAU-001');
SET @veh_2 = (SELECT id FROM Vehicles WHERE vehicle_number = 'SAU-002');

-- Trips
INSERT INTO Trips (vehicle_id, driver_id, student_id, start_location, end_location, start_time, end_time, status, rating, feedback_comment)
VALUES
(@veh_1, @driver_raj_id, @student_arjun_id, 'Main Gate, SAU Campus', 'Main Road (2km away)', '2024-01-15 14:30:00', '2024-01-15 14:45:00', 'completed', 5, 'Great service, very punctual!'),
(@veh_2, @driver_surya_id, @student_priya_id, 'Library Building, SAU Campus', 'Main Road (2km away)', '2024-01-15 15:00:00', NULL, 'in-progress', NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;


