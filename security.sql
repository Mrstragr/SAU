-- Security SQL for SAU Transport Database
-- Defines roles: admin_role, driver_role, student_role
-- Grants appropriate permissions using CREATE ROLE, GRANT, REVOKE

-- Create roles
CREATE ROLE admin_role;
CREATE ROLE driver_role;
CREATE ROLE student_role;

-- Grant permissions to admin_role (full access)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_role;

-- Grant permissions to driver_role
-- Drivers can SELECT/UPDATE their own data in Users and Vehicles, SELECT/INSERT/UPDATE Trips
GRANT SELECT, UPDATE ON Users TO driver_role;
GRANT SELECT, UPDATE ON Vehicles TO driver_role;
GRANT SELECT, INSERT, UPDATE ON Trips TO driver_role;

-- Row-level security (RLS) policies for driver_role (example using policies)
-- Note: Enable RLS on tables first: ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
-- Policy for Users: Drivers can only access their own record
CREATE POLICY driver_users_policy ON Users
FOR ALL USING (role = 'driver' AND id = current_setting('app.current_user_id')::int);

-- Policy for Vehicles: Drivers can only access their assigned vehicle
CREATE POLICY driver_vehicles_policy ON Vehicles
FOR ALL USING (driver_id = current_setting('app.current_user_id')::int);

-- Policy for Trips: Drivers can access trips where they are the driver
CREATE POLICY driver_trips_policy ON Trips
FOR ALL USING (driver_id = current_setting('app.current_user_id')::int);

-- Grant permissions to student_role
-- Students can only SELECT from Vehicles and Trips, INSERT/UPDATE their own Trips
GRANT SELECT ON Vehicles TO student_role;
GRANT SELECT, INSERT, UPDATE ON Trips TO student_role;

-- RLS policies for student_role
-- Policy for Trips: Students can only access their own trips
CREATE POLICY student_trips_policy ON Trips
FOR ALL USING (student_id = current_setting('app.current_user_id')::int);

-- Revoke unnecessary permissions (examples)
-- Revoke DELETE on Trips for non-admins
REVOKE DELETE ON Trips FROM driver_role;
REVOKE DELETE ON Trips FROM student_role;

-- Revoke UPDATE on sensitive fields (e.g., total_trips in Users for non-admins)
-- Note: Use column-level grants if needed, but RLS covers most cases
