"use strict";

const fs = require("fs");
const express = require("express");
const { Pool } = require("pg");

// The password can come from a file (Docker secret) or from DB_PASSWORD.
function readPassword() {
  const file = process.env.DB_PASSWORD_FILE;
  if (file) {
    return fs.readFileSync(file, "utf8").trim();
  }
  return process.env.DB_PASSWORD || "";
}

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "notes",
  user: process.env.DB_USER || "notes",
  password: readPassword(),
  connectionTimeoutMillis: 3000,
});

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(503).json({ status: "unhealthy", error: err.message });
  }
});

app.get("/api/notes", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, text, created_at FROM notes ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notes", async (req, res) => {
  const text = req.body && req.body.text;
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO notes (text) VALUES ($1) RETURNING id, text, created_at",
      [text]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`notes-api listening on port ${PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}
