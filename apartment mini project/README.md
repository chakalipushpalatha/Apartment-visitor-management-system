# Apartment Visitor Management System

A CRUD-style apartment visitor tracking project based on the supplied FSD student-management project structure. It uses Node.js, Express, MySQL and plain HTML/CSS/JavaScript.

## Features
- Dashboard with resident, visitor, today's visit and currently-inside counts
- Resident directory
- Security staff can register a visitor against a resident/flat
- Automatic entry timestamp and visitor status
- Record exit time by marking a visitor as Exited
- Search a visit record and view its details
- Update visit status and delete a visit record
- Resident list is available to support resident-facing visitor record lookup

## Requirements
- Node.js 18 or later
- MySQL Server and MySQL Workbench

## Setup
1. Extract the ZIP file.
2. Open MySQL Workbench and connect to your local MySQL server.
3. Open `schema.sql` and execute the complete script. It creates `apartment_visitor_db`, the three tables and two sample residents.
4. Open this project folder in VS Code.
5. Open the terminal in this folder and run:
   ```bash
   npm install
   ```
6. Check the MySQL settings in `app.js`. The default is:
   - host: `localhost`
   - user: `root`
   - password: `root`
   - database: `apartment_visitor_db`

   Change the password to your own MySQL password, or set `DB_PASSWORD` as an environment variable.
7. Start the server:
   ```bash
   npm start
   ```
8. Open `http://localhost:3000` in your browser.

## Pages
- `index.html` — Dashboard
- `list.html` — All visitor visit records
- `listOne.html` — Search a visit record
- `insert.html` — Register visitor / record entry
- `update.html` — Update visit status and record exit
- `delete.html` — Delete a visit record

## Database tables
- `residents(resident_id, name, flat_no, phone, email)`
- `visitors(visitor_id, name, phone, vehicle_no, purpose)`
- `visits(visit_id, resident_id, visitor_id, entry_time, exit_time, status)`

## Notes
- This is an academic/demo project, not a production security system. Add authentication, role-based access, audit logging and privacy controls before real deployment.
- Resident and visitor records are retained when a visit is deleted; only the visit record is deleted.
