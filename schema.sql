-- SAU Transport Database Schema for PostgreSQL
-- Tables: Users, Vehicles, Trips
-- Includes PKs, FKs, UNIQUE, NOT NULL, CHECK constraints

-- Create Users table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('student', 'driver', 'admin')),
    student_id VARCHAR(20),
    department VARCHAR(100),
    year INTEGER CHECK (year IS NULL OR (year >= 1 AND year <= 5)),
    total_trips INTEGER DEFAULT 0 CHECK (total_trips >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Vehicles table
CREATE TABLE Vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    driver_id INTEGER UNIQUE REFERENCES Users(id) ON DELETE RESTRICT,
    capacity INTEGER DEFAULT 4 CHECK (capacity > 0),
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    current_status VARCHAR(10) DEFAULT 'offline' CHECK (current_status IN ('waiting', 'confirm', 'offline')),
    current_passengers INTEGER DEFAULT 0 CHECK (current_passengers >= 0),
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    current_address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_eco_friendly BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Trips table
CREATE TABLE Trips (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES Vehicles(id) ON DELETE RESTRICT,
    driver_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE RESTRICT,
    student_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE RESTRICT,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    feedback_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_phone ON Users(phone);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_vehicles_driver_id ON Vehicles(driver_id);
CREATE INDEX idx_vehicles_status ON Vehicles(current_status);
CREATE INDEX idx_trips_vehicle_id ON Trips(vehicle_id);
CREATE INDEX idx_trips_driver_id ON Trips(driver_id);
CREATE INDEX idx_trips_student_id ON Trips(student_id);
CREATE INDEX idx_trips_status ON Trips(status);
