# ER Diagram for SAU Transport Database

## Text-Based ER Diagram

```
+----------------+       +-----------------+       +----------------+
|     Users      |       |    Vehicles     |       |     Trips      |
+----------------+       +-----------------+       +----------------+
| id (PK)        |       | id (PK)         |       | id (PK)        |
| name           |       | vehicle_number  |       | vehicle_id (FK)|
| email (UQ)     |       | driver_id (FK)  |       | driver_id (FK) |
| phone (UQ)     |       | capacity        |       | student_id (FK)|
| password_hash  |       | battery_level   |       | start_location |
| role           |       | current_status  |       | end_location   |
| student_id     |       | current_passengers|     | start_time     |
| department     |       | current_lat     |       | end_time       |
| year           |       | current_lng     |       | status         |
| total_trips    |       | current_address |       | rating         |
| is_active      |       | is_active       |       | feedback_comment|
| created_at     |       | is_eco_friendly |       | created_at     |
| updated_at     |       | created_at      |       | updated_at     |
+----------------+       | updated_at      |       +----------------+
          |1             +-----------------+
          |                           |1
          |                           |
          |1                          |M
          +---------------------------+
                      |M
                      |
                      |M
                      |
+----------------+       +----------------+
|   Students     |       |   Drivers      |
+----------------+       +----------------+
| (subset of Users|       | (subset of Users|
| where role='student')|  | where role='driver')|
+----------------+       +----------------+
```

## Relationships
- Users (Driver) 1:1 Vehicles (via driver_id FK in Vehicles)
- Vehicles 1:M Trips (via vehicle_id FK in Trips)
- Users (Driver) 1:M Trips (via driver_id FK in Trips)
- Users (Student) M:1 Trips (via student_id FK in Trips)

## Mermaid ER Diagram Code

```mermaid
erDiagram
    Users ||--o{ Vehicles : "1:1 (driver)"
    Vehicles ||--o{ Trips : "1:M"
    Users ||--o{ Trips : "1:M (driver)"
    Users ||--o{ Trips : "M:1 (student)"

    Users {
        int id PK
        string name
        string email UK
        string phone UK
        string password_hash
        string role "enum: student, driver, admin"
        string student_id
        string department
        int year
        int total_trips
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    Vehicles {
        int id PK
        string vehicle_number UK
        int driver_id FK
        int capacity
        int battery_level
        string current_status "enum: waiting, confirm, offline"
        int current_passengers
        decimal current_lat
        decimal current_lng
        string current_address
        boolean is_active
        boolean is_eco_friendly
        timestamp created_at
        timestamp updated_at
    }

    Trips {
        int id PK
        int vehicle_id FK
        int driver_id FK
        int student_id FK
        string start_location
        string end_location
        timestamp start_time
        timestamp end_time
        string status "enum: pending, in-progress, completed, cancelled"
        int rating
        string feedback_comment
        timestamp created_at
        timestamp updated_at
    }
