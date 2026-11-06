const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "apartment_visitor_db"
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    console.error("Create the database by running schema.sql, then restart the server.");
    return;
  }
  console.log("Connected to MySQL database: apartment_visitor_db");
});

function query(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, rows) => err ? reject(err) : resolve(rows));
  });
}
function asyncRoute(handler) {
  return (req, res) => handler(req, res).catch(err => {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  });
}

app.get("/api/stats", asyncRoute(async (req, res) => {
  const [r] = await query("SELECT COUNT(*) AS total FROM residents");
  const [v] = await query("SELECT COUNT(*) AS total FROM visitors");
  const [inside] = await query("SELECT COUNT(*) AS total FROM visits WHERE status='Inside'");
  const [today] = await query("SELECT COUNT(*) AS total FROM visits WHERE DATE(entry_time)=CURDATE()");
  res.json({ residents: r.total, visitors: v.total, inside: inside.total, today: today.total });
}));

app.get("/api/residents", asyncRoute(async (req, res) => {
  res.json(await query("SELECT * FROM residents ORDER BY flat_no"));
}));
app.post("/api/residents", asyncRoute(async (req, res) => {
  const { name, flat_no, phone, email } = req.body;
  if (!name || !flat_no || !phone) return res.status(400).json({ error: "Name, flat number and phone are required." });
  const result = await query("INSERT INTO residents(name,flat_no,phone,email) VALUES(?,?,?,?)", [name, flat_no, phone, email || null]);
  res.status(201).json({ message: "Resident added successfully.", resident_id: result.insertId });
}));
app.put("/api/residents/:id", asyncRoute(async (req, res) => {
  const { name, flat_no, phone, email } = req.body;
  const result = await query("UPDATE residents SET name=?,flat_no=?,phone=?,email=? WHERE resident_id=?", [name, flat_no, phone, email || null, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: "Resident not found." });
  res.json({ message: "Resident updated successfully." });
}));

app.get("/api/visitors", asyncRoute(async (req, res) => {
  res.json(await query("SELECT * FROM visitors ORDER BY visitor_id DESC"));
}));
app.get("/api/visits", asyncRoute(async (req, res) => {
  const rows = await query(`SELECT vi.visit_id, vi.resident_id, vi.visitor_id, vi.entry_time, vi.exit_time, vi.status,
    v.name AS visitor_name, v.phone AS visitor_phone, v.vehicle_no, v.purpose,
    r.name AS resident_name, r.flat_no
    FROM visits vi JOIN visitors v ON vi.visitor_id=v.visitor_id
    JOIN residents r ON vi.resident_id=r.resident_id ORDER BY vi.entry_time DESC`);
  res.json(rows);
}));
app.get("/api/visits/:id", asyncRoute(async (req, res) => {
  const rows = await query(`SELECT vi.*, v.name AS visitor_name, v.phone AS visitor_phone, v.vehicle_no, v.purpose,
    r.name AS resident_name, r.flat_no FROM visits vi
    JOIN visitors v ON vi.visitor_id=v.visitor_id JOIN residents r ON vi.resident_id=r.resident_id
    WHERE vi.visit_id=?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Visit record not found." });
  res.json(rows[0]);
}));

// Security staff register a visitor and create a visit in one operation.
app.post("/api/visits", asyncRoute(async (req, res) => {
  const { resident_id, name, phone, vehicle_no, purpose } = req.body;
  if (!resident_id || !name || !phone || !purpose) {
    return res.status(400).json({ error: "Resident, visitor name, phone and purpose are required." });
  }
  const resident = await query("SELECT resident_id FROM residents WHERE resident_id=?", [resident_id]);
  if (!resident.length) return res.status(400).json({ error: "Please select a valid resident." });
  const visitor = await query("INSERT INTO visitors(name,phone,vehicle_no,purpose) VALUES(?,?,?,?)",
    [name, phone, vehicle_no || null, purpose]);
  const visit = await query("INSERT INTO visits(resident_id,visitor_id,status) VALUES(?,?,'Inside')",
    [resident_id, visitor.insertId]);
  res.status(201).json({ message: "Visitor registered. Entry recorded successfully.", visit_id: visit.insertId });
}));

app.put("/api/visits/:id", asyncRoute(async (req, res) => {
  const { status } = req.body;
  if (!["Inside", "Exited"].includes(status)) return res.status(400).json({ error: "Status must be Inside or Exited." });
  const result = status === "Exited"
    ? await query("UPDATE visits SET status='Exited', exit_time=NOW() WHERE visit_id=?", [req.params.id])
    : await query("UPDATE visits SET status='Inside', exit_time=NULL WHERE visit_id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: "Visit record not found." });
  res.json({ message: status === "Exited" ? "Visitor exit time recorded." : "Visit marked as inside." });
}));
app.delete("/api/visits/:id", asyncRoute(async (req, res) => {
  const result = await query("DELETE FROM visits WHERE visit_id=?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: "Visit record not found." });
  res.json({ message: "Visit record deleted." });
}));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Apartment Visitor Management System running at http://localhost:${PORT}`));
