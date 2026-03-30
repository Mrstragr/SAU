-- Sample Data INSERT statements for SAU Transport Database
-- Based on mockData.js and db.json
-- Inserts users (students, drivers, admin), vehicles, and trips

-- Insert Users (Students)
INSERT INTO Users (id, name, email, phone, password_hash, role, student_id, department, year, total_trips, is_active) VALUES
(20, 'Arjun Mehta', 'arjun.mehta@sau.ac.in', '+91 98765 43215', '$2b$12$hashedpassword1', 'student', 'SAU2023001', 'Computer Science', 2, 0, TRUE),
(21, 'Priya Gupta', 'priya.gupta@sau.ac.in', '+91 98765 43216', '$2b$12$hashedpassword2', 'student', 'SAU2023002', 'Economics', 1, 0, TRUE);

-- Insert Users (Drivers)
INSERT INTO Users (id, name, email, phone, password_hash, role, total_trips, is_active) VALUES
(22, 'Raj Nath', 'raj.nath@sau.ac.in', '+91 98765 43210', '$2b$12$hashedpassword3', 'driver', 1250, TRUE),
(23, 'Surya', 'surya@sau.ac.in', '+91 98765 43211', '$2b$12$hashedpassword4', 'driver', 980, TRUE),
(24, 'Atul', 'atul@sau.ac.in', '+91 98765 43212', '$2b$12$hashedpassword5', 'driver', 1560, FALSE),
(25, 'Rohit', 'rohit@sau.ac.in', '+91 98765 43213', '$2b$12$hashedpassword6', 'driver', 720, TRUE),
(26, 'Suryanshu', 'suryanshu@sau.ac.in', '+91 98765 43214', '$2b$12$hashedpassword7', 'driver', 1100, TRUE);

-- Insert Users (Admin)
INSERT INTO Users (id, name, email, phone, password_hash, role, is_active) VALUES
(27, 'Admin User', 'admin@sau.ac.in', '+91 98765 43217', '$2b$12$hashedpassword8', 'admin', TRUE);

-- Insert Vehicles
INSERT INTO Vehicles (id, vehicle_number, driver_id, capacity, battery_level, current_status, current_passengers, current_lat, current_lng, current_address, is_active, is_eco_friendly) VALUES
(1, 'SAU-001', 22, 4, 85, 'waiting', 0, 28.6139, 77.2090, 'Main Gate, SAU Campus', TRUE, TRUE),
(2, 'SAU-002', 23, 4, 92, 'confirm', 3, 28.6145, 77.2095, 'Library Building, SAU Campus', TRUE, TRUE),
(3, 'SAU-003', 24, 4, 45, 'offline', 0, 28.6140, 77.2085, 'Cafeteria, SAU Campus', TRUE, TRUE),
(4, 'SAU-004', 25, 4, 78, 'waiting', 1, 28.6135, 77.2100, 'Academic Block, SAU Campus', TRUE, TRUE),
(5, 'SAU-005', 26, 4, 88, 'waiting', 0, 28.6142, 77.2088, 'Hostel Area, SAU Campus', TRUE, TRUE);

-- Insert Trips
INSERT INTO Trips (vehicle_id, driver_id, student_id, start_location, end_location, start_time, end_time, status, rating, feedback_comment) VALUES
(1, 22, 20, 'Main Gate, SAU Campus', 'Main Road (2km away)', '2024-01-15 14:30:00+00', '2024-01-15 14:45:00+00', 'completed', 5, 'Great service, very punctual!'),
(2, 23, 21, 'Library Building, SAU Campus', 'Main Road (2km away)', '2024-01-15 15:00:00+00', NULL, 'in-progress', NULL, NULL);
