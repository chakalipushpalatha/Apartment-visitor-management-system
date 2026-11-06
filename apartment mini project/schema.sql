CREATE DATABASE IF NOT EXISTS apartment_visitor_db;
USE apartment_visitor_db;

CREATE TABLE IF NOT EXISTS residents (
  resident_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  flat_no VARCHAR(20) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS visitors (
  visitor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  vehicle_no VARCHAR(30),
  purpose VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS visits (
  visit_id INT AUTO_INCREMENT PRIMARY KEY,
  resident_id INT NOT NULL,
  visitor_id INT NOT NULL,
  entry_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exit_time DATETIME NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Inside',
  CONSTRAINT fk_visit_resident FOREIGN KEY (resident_id)
    REFERENCES residents(resident_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_visit_visitor FOREIGN KEY (visitor_id)
    REFERENCES visitors(visitor_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Optional sample residents for testing
INSERT INTO residents (name, flat_no, phone, email)
SELECT 'Ananya Rao', 'A-101', '9876543210', 'ananya@example.com'
WHERE NOT EXISTS (SELECT 1 FROM residents WHERE flat_no='A-101');
INSERT INTO residents (name, flat_no, phone, email)
SELECT 'Rahul Sharma', 'B-204', '9876501234', 'rahul@example.com'
WHERE NOT EXISTS (SELECT 1 FROM residents WHERE flat_no='B-204');
