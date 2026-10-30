"use strict";

const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || "dev";

// Items are kept in memory only: they disappear when the container restarts.
const items = [{ id: 1, name: "first item" }];
let nextId = 2;

app.get("/", (req, res) => {
  res.json({
    service: "items-api",
    version: VERSION,
    node: process.version,
    env: process.env.NODE_ENV || "development",
    uid: process.getuid(),
  });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/items", (req, res) => res.json(items));

app.post("/api/items", (req, res) => {
  const name = req.body && req.body.name;
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }
  const item = { id: nextId++, name };
  items.push(item);
  res.status(201).json(item);
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`items-api ${VERSION} listening on port ${PORT}`);
});

// Graceful shutdown: docker stop sends SIGTERM to PID 1.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    console.log(`received ${signal}, shutting down`);
    server.close(() => process.exit(0));
  });
}
