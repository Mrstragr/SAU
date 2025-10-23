-- Advanced RDBMS Features for SAU Transport Database
-- Includes VIEW, TRIGGER, and Transaction pseudocode

-- VIEW: DriverPerformance
-- Calculates driver_name, vehicle_number, average_rating, and total_trips_completed
-- JOINs Users (drivers), Vehicles, and Trips
CREATE VIEW DriverPerformance AS
SELECT
    u.id AS driver_id,
    u.name AS driver_name,
    v.vehicle_number,
    ROUND(AVG(t.rating), 2) AS average_rating,
    COUNT(t.id) AS total_trips_completed
FROM
    Users u
LEFT JOIN
    Vehicles v ON u.id = v.driver_id
LEFT JOIN
    Trips t ON u.id = t.driver_id AND t.status = 'completed'
WHERE
    u.role = 'driver'
GROUP BY
    u.id, u.name, v.vehicle_number;

-- TRIGGER: Update total_trips in Users when trip status changes to 'completed'
-- Automatically increments total_trips for the driver
CREATE OR REPLACE FUNCTION update_driver_total_trips()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE Users
        SET total_trips = total_trips + 1
        WHERE id = NEW.driver_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_trips
AFTER UPDATE ON Trips
FOR EACH ROW
EXECUTE FUNCTION update_driver_total_trips();

-- Transaction Pseudocode for "Book a Ride" Operation
-- Ensures atomicity: INSERT Trip AND UPDATE Vehicle.current_passengers / current_status
-- Uses BEGIN/COMMIT/ROLLBACK for ACID compliance

-- Pseudocode (to be implemented in application code or stored procedure):
/*
BEGIN TRANSACTION;
    -- Step 1: Check vehicle availability (current_passengers < capacity AND status != 'offline')
    SELECT current_passengers, capacity, current_status
    FROM Vehicles
    WHERE id = :vehicle_id FOR UPDATE;  -- Lock row to prevent concurrent bookings

    IF current_passengers >= capacity OR current_status = 'offline' THEN
        ROLLBACK;
        RAISE EXCEPTION 'Vehicle not available for booking';
    END IF;

    -- Step 2: Insert new Trip record
    INSERT INTO Trips (vehicle_id, driver_id, student_id, start_location, end_location, status)
    VALUES (:vehicle_id, :driver_id, :student_id, :start_location, :end_location, 'pending');

    -- Step 3: Update Vehicle: increment current_passengers and set status to 'confirm' if needed
    UPDATE Vehicles
    SET current_passengers = current_passengers + 1,
        current_status = CASE WHEN current_passengers + 1 >= capacity THEN 'confirm' ELSE current_status END
    WHERE id = :vehicle_id;

COMMIT;
-- On any error (e.g., constraint violation), ROLLBACK automatically
*/
