# Normalization Documentation for SAU Transport Database

The database design for the Users, Vehicles, and Trips tables follows the principles of normalization up to the Third Normal Form (3NF) to ensure data integrity, reduce redundancy, and eliminate anomalies during insert, update, and delete operations. Below is a step-by-step documentation of the normalization process based on the current Mongoose models and logical data requirements.

## Step 1: First Normal Form (1NF)
- **Requirements for 1NF**: Eliminate repeating groups, ensure all attributes are atomic (single-valued), and identify a primary key for each entity.
- **Application**:
  - **Users Table**: 
    - Atomic attributes: `name` (single string), `email` (single unique string), `phone` (single unique string), `password_hash` (single string), `role` (single enum value), `student_id` (single string, optional for non-students), `department` (single string, optional), `year` (single integer, optional), `total_trips` (single integer for drivers), `is_active` (single boolean).
    - No repeating groups (e.g., no arrays of phones or departments).
    - Primary Key: `id` (SERIAL, auto-incrementing integer).
  - **Vehicles Table**:
    - Atomic attributes: `vehicle_number` (single unique string), `driver_id` (single FK to Users), `capacity` (single integer), `battery_level` (single integer 0-100), `current_status` (single enum), `current_passengers` (single integer >=0), `current_location_lat`/`lng` (single decimals, split from object for atomicity), `current_location_address` (single string), `is_active` (single boolean), `is_eco_friendly` (single boolean).
    - No repeating groups (location split into separate atomic fields).
    - Primary Key: `id` (SERIAL).
  - **Trips Table**:
    - Atomic attributes: `vehicle_id` (single FK), `driver_id` (single FK), `student_id` (single FK), `start_location` (single string), `end_location` (single string), `start_time` (single timestamp), `end_time` (single timestamp, nullable), `status` (single enum), `rating` (single integer 1-5, nullable), `feedback_comment` (single string, nullable).
    - No repeating groups (feedback as single comment).
    - Primary Key: `id` (SERIAL).
- **Result**: All tables are in 1NF with atomic values and unique identifiers.

## Step 2: Second Normal Form (2NF)
- **Requirements for 2NF**: Must be in 1NF, and all non-key attributes must be fully functionally dependent on the entire primary key (no partial dependencies). Applicable if primary keys are composite.
- **Application**:
  - All tables use a single-column primary key (`id`), so there are no composite keys and thus no partial dependencies possible.
  - **Users**: All attributes (e.g., `email`, `role`, `total_trips`) depend fully on `id`.
  - **Vehicles**: All attributes (e.g., `battery_level`, `current_status`) depend fully on `id`. `driver_id` is a FK but fully dependent.
  - **Trips**: All attributes (e.g., `start_location`, `status`) depend fully on `id`. FKs (`vehicle_id`, `driver_id`, `student_id`) are fully dependent.
- **Result**: Tables are in 2NF as there are no partial dependencies.

## Step 3: Third Normal Form (3NF)
- **Requirements for 3NF**: Must be in 2NF, and no non-key attribute depends on another non-key attribute (no transitive dependencies).
- **Application**:
  - **Users**:
    - No transitive dependencies: e.g., `department` and `year` are optional student details directly dependent on `id` (not on `role` or each other). `total_trips` depends only on `id` (updated via trigger for drivers). `role` enum ensures consistency.
    - CHECK constraints prevent invalid data (e.g., `year` 1-5).
  - **Vehicles**:
    - No transitive dependencies: e.g., `battery_level` and `current_status` depend directly on `id`, not on `driver_id` or `vehicle_number`. Location fields are independent.
    - CHECK constraints: `battery_level` (0-100), `current_passengers` (>=0), `capacity` (>0), enum for `current_status`.
    - One-to-One with User via `driver_id` FK (enforced with UNIQUE if needed, but model allows one vehicle per driver).
  - **Trips**:
    - No transitive dependencies: e.g., `end_time` and `rating` depend directly on `id`, not on `vehicle_id` or `driver_id`. `status` enum and `rating` CHECK (1-5) ensure validity.
    - Many-to-One relationships via FKs to Users (driver/student) and Vehicles.
  - **Relationships**:
    - Users (Driver) 1:1 Vehicles (via `driver_id` FK in Vehicles).
    - Vehicles 1:M Trips (via `vehicle_id` FK in Trips).
    - Users (Driver) 1:M Trips (via `driver_id` FK).
    - Users (Student) M:1 Trips (via `student_id` FK).
    - All FKs use ON DELETE CASCADE/RESTRICT as appropriate (e.g., RESTRICT to prevent deleting active drivers with vehicles).
- **Result**: Tables are in 3NF, eliminating redundancy (e.g., driver details not duplicated in Vehicles/Trips; referenced via FKs). This design supports the relational requirements while mapping the NoSQL models faithfully.

## Additional Notes
- **Denormalization Trade-offs**: Added `total_trips` to Users for efficient querying (updated via trigger), which is a minor denormalization for performance but maintained via RDBMS features.
- **Integrity**: PKs, FKs, UNIQUE, NOT NULL, and CHECK constraints enforce business rules.
- **Further Normalization**: BCNF or 4NF not pursued as relationships are simple and no multi-valued dependencies exist.
