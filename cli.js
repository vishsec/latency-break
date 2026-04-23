#!/usr/bin/env node

const http = require("http");
const https = require("https");

const url = process.argv[2];

if (!url) {
  console.error("Usage: latency-break <url>");
  process.exit(1);
}

const client = url.startsWith("https") ? https : http;

const start = Date.now();

client.get(url, (res) => {
  const end = Date.now();
  const cliTotal = end - start;

  const total = res.headers["x-total-time"];
  const db = res.headers["x-db-time"];
  const pre = res.headers["x-pre-db-time"];
  const post = res.headers["x-post-db-time"];

  console.log("\nRequest breakdown:\n");

  // If no instrumentation headers
  if (!total) {
    console.log("No server-side timing headers found.\n");
    console.log(`Total (client measured): ${cliTotal}ms\n`);
    return;
  }

  //  Print breakdown
  console.log(`├── Server (pre-DB):  ${pre}`);
  console.log(`├── DB:               ${db}`);
  console.log(`├── Server (post-DB): ${post}`);
  console.log(`└── Total:            ${total}`);

  // Parse numbers safely
  const timings = {
    pre: parseFloat(pre),
    db: parseFloat(db),
    post: parseFloat(post),
  };

  // Detect bottleneck
  const slowest = Object.entries(timings).sort((a, b) => b[1] - a[1])[0];

  console.log(`\n Bottleneck: ${slowest[0]} (${slowest[1]}ms)`);

  //  Smart hint
  if (slowest[0] === "db") {
    console.log("DB is slow. Consider indexing or optimizing queries.");
  } else if (slowest[0] === "pre") {
    console.log("Pre-processing is slow. Check validation/middleware.");
  } else if (slowest[0] === "post") {
    console.log("Post-processing is slow. Check response handling.");
  }

  console.log("");

}).on("error", (err) => {
  console.error("Error:", err.message);
});