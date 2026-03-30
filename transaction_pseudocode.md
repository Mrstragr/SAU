# Transaction Pseudocode for Book a Ride Operation

## Overview
The "Book a Ride" operation must be atomic to ensure data consistency. It involves:
1. Finding an available vehicle (status = 'waiting', current_passengers < capacity)
2. Creating a new trip record
3. Updating the vehicle's status and passenger count

## Pseudocode

```sql
-- Book a Ride Transaction Pseudocode
BEGIN TRANSACTION;

-- Step 1: Find an available vehicle
SELECT v.id, v.vehicle_number, v.capacity, v.current_passengers
FROM Vehicles v
WHERE v.current_status = 'waiting'
  AND v.current_passengers < v.capacity
  AND v.is_active = TRUE
ORDER BY v.battery_level DESC  -- Prefer higher battery vehicles
LIMIT 1
FOR UPDATE;  -- Lock the row to prevent concurrent bookings

-- If no vehicle found, ROLLBACK and return error

-- Step 2: Insert new trip record
INSERT INTO Trips (vehicle_id, driver_id, student_id, start_location, end_location, status)
VALUES (selected_vehicle_id, selected_driver_id, current_student_id, student_start_location, student_end_location, 'pending');

-- Step 3: Update vehicle status and passenger count
UPDATE Vehicles
SET current_passengers = current_passengers + 1,
    current_status = CASE
        WHEN current_passengers + 1 >= capacity THEN 'confirm'
        ELSE 'confirm'
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE id = selected_vehicle_id;

-- Step 4: Commit the transaction
COMMIT;

-- On any error during steps 2-3, ROLLBACK the entire transaction
-- This ensures no partial updates occur
```

## Key Features
- **Atomicity**: All operations succeed or all fail
- **Isolation**: Row-level locking prevents race conditions
- **Consistency**: Vehicle capacity and status remain valid
- **Durability**: Changes are permanent once committed

## Error Handling
- If vehicle becomes unavailable during transaction: ROLLBACK
- If trip insertion fails: ROLLBACK
- If vehicle update fails: ROLLBACK
- Return appropriate error messages to user
