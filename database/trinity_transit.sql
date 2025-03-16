-- Release 1

-- Drop the database if it exists
DROP DATABASE IF EXISTS trinity_transit;

-- Create the database
CREATE DATABASE trinity_transit;

-- Use the database for the transit
USE trinity_transit;

-- Delete any tables which currently exist in the database
DROP TABLE IF EXISTS buses;

-- Create a table which contains buses
CREATE TABLE TransportProviders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR (50),
    vehicleType VARCHAR (50)
);


CREATE TABLE BusStop (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR (50),
    location VARCHAR (50),
);

CREATE TABLE Routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR (50),
    startLocation INT,
    FOREIGN KEY startLocation REFERENCES BusStop(id)
)

CREATE TABLE RoutesStops (
    route_id INT,
    stop_id INT,
    FOREIGN KEY route_id REFERENCES Routes(id)
    FOREIGN KEY stop_id REFERENCES BusStop(id)
)


CREATE TABLE PersonalDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR (50),
    email VARCHAR (50),
    home VARCHAR (200),
    work VARCHAR (200),
);

CREATE TABLE RoutesFavourites (
    route_id INT,
    user_id INT,
    FOREIGN KEY route_id REFERENCES Routes(id)
    FOREIGN KEY user_id REFERENCES PersonalDetails(id)
)

CREATE TABLE ProvidersFavourites (
    provider_id INT,
    user_id INT,
    FOREIGN KEY provider_id REFERENCES TransportProviders(id)
    FOREIGN KEY user_id REFERENCES PersonalDetails(id)
)

