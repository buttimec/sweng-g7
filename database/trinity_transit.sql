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
CREATE TABLE buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR (50)
);


INSERT INTO buses (name, description)
VALUES 
    ('1A'),
    ('2C'),
    ('41'),
    ('500X'),
    ('197'),
    ('436'),
    ('3'),
    ('7A');
