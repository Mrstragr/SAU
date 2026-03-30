-- MySQL schema for SAU Transport Database
-- Engine: InnoDB, charset: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS sau_transport
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE sau_transport;

-- Drop tables in FK-safe order (if re-running)
DROP TABLE IF EXISTS Trips;
DROP TABLE IF EXISTS Vehicles;
DROP TABLE IF EXISTS Users;

-- Users table: students, drivers, admin
CREATE TABLE Users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(32) NULL,
  password_hash VARCHAR(191) NOT NULL,
  role ENUM('student','driver','admin') NOT NULL,
  student_id VARCHAR(32) NULL,
  department VARCHAR(120) NULL,
  year TINYINT UNSIGNED NULL,
  total_trips INT UNSIGNED NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_users_email (email),
  KEY ix_users_role (role),
  KEY ix_users_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vehicles table
CREATE TABLE Vehicles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_number VARCHAR(32) NOT NULL,
  driver_id BIGINT UNSIGNED NOT NULL,
  capacity TINYINT UNSIGNED NOT NULL,
  battery_level TINYINT UNSIGNED NOT NULL,
  current_status ENUM('waiting','confirm','offline') NOT NULL,
  current_passengers TINYINT UNSIGNED NOT NULL DEFAULT 0,
  current_lat DECIMAL(10,6) NULL,
  current_lng DECIMAL(10,6) NULL,
  current_address VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_eco_friendly TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_vehicles_vehicle_number (vehicle_number),
  KEY ix_vehicles_driver_id (driver_id),
  CONSTRAINT fk_vehicles_driver
    FOREIGN KEY (driver_id)
    REFERENCES Users (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trips table
CREATE TABLE Trips (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehicle_id BIGINT UNSIGNED NOT NULL,
  driver_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NULL,
  start_location VARCHAR(255) NOT NULL,
  end_location VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  status ENUM('completed','in-progress','cancelled','scheduled') NOT NULL,
  rating TINYINT UNSIGNED NULL,
  feedback_comment VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_trips_vehicle_id (vehicle_id),
  KEY ix_trips_driver_id (driver_id),
  KEY ix_trips_student_id (student_id),
  CONSTRAINT fk_trips_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES Vehicles (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_trips_driver
    FOREIGN KEY (driver_id)
    REFERENCES Users (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_trips_student
    FOREIGN KEY (student_id)
    REFERENCES Users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;


