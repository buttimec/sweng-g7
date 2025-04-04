-- Release 1

-- Drop the database if it exists
DROP DATABASE IF EXISTS trinity_transit;

-- Create the database
CREATE DATABASE trinity_transit;

-- Use the database for the transit
USE trinity_transit;

-- Create a table which contains transport providers
CREATE TABLE TransportProviders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    vehicleType VARCHAR(50)
);

-- Create a table for bus stops
CREATE TABLE BusStop (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    location VARCHAR(50)
);

-- Create a table for routes
CREATE TABLE Routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    startName VARCHAR(50),
    startLocation VARCHAR(50) 
);

-- Create a table for personal user details
CREATE TABLE PersonalDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(50),
    home VARCHAR(200),
    work VARCHAR(200)
);

-- Create a table for favorite routes (many-to-many relationship)
CREATE TABLE RoutesFavourites (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    startName VARCHAR(50),
    startLocation VARCHAR(50) 
);

-- Create a table for favorite transport providers (many-to-many relationship)
CREATE TABLE ProvidersFavourites (
    provider_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    vehicleType VARCHAR(50)
);

CREATE TABLE Photo (
    photo_id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(50),
    data VARBINARY(MAX)
);

CREATE TABLE favourite_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (provider_id) REFERENCES TransportProviders(id),
    FOREIGN KEY (user_id) REFERENCES PersonalDetails(id)
);


