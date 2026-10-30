import express from "express";
import { quotes, randomQuote } from "./quotes";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.get("/", (_req, res) => {
  res.json({
    service: "quotes-service",
    // Compiled JavaScript runs from dist/, TypeScript sources are not needed at run time.
    runtime: "node " + process.version,
    uid: process.getuid ? process.getuid() : null,
    endpoints: ["/quotes", "/quotes/random", "/health"],
  });
});

app.get("/quotes", (_req, res) => res.json(quotes));
app.get("/quotes/random", (_req, res) => res.json(randomQuote()));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`quotes-service listening on port ${port}`);
});

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    console.log(`received ${signal}, shutting down`);
    server.close(() => process.exit(0));
  });
}
