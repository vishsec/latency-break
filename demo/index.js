const express = require("express");
const { Pool } = require("pg");


const app = express();
const port = 3003;

app.listen(port, () => {
    console.log("lets start this server...");
});

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "latencyBreak-db",
    password: "latenvishu",
    port: 5433
});



app.use(async (req, res, next) => {
  const start = process.hrtime.bigint();

  res.locals.timing = {
    start,
    dbTime: 0n,
    preDbEnd: 0n,
    postDbStart: 0n,
  };

  res.on("finish", () => {
    const total = Number(process.hrtime.bigint() - start) / 1e6;

    const db = Number(res.locals.timing.dbTime) / 1e6;
const totalMs = total;

const preDb = Number(res.locals.timing.preDbEnd - res.locals.timing.start) / 1e6;
const postDb = Number(
  process.hrtime.bigint() - res.locals.timing.postDbStart
) / 1e6;

console.log({
  total: totalMs.toFixed(2) + "ms",
  preDb: preDb.toFixed(2) + "ms",
  db: db.toFixed(2) + "ms",
  postDb: postDb.toFixed(2) + "ms",
});

const timings = { preDb, db, postDb };
const slowest = Object.entries(timings).sort((a, b) => b[1] - a[1])[0];

console.log(`Slowest part: ${slowest[0]} (${slowest[1].toFixed(2)}ms)`);
  });

  next();
});


async function timedQuery(query, params, res) {
  const start = process.hrtime.bigint();

  const result = await pool.query(query, params);

  const duration = process.hrtime.bigint() - start;
  res.locals.timing.dbTime += duration;

  return result;
}

app.get("/users", async (req, res) => {
  try {
    const t = res.locals.timing;

    // PRE-DB work (simulate server logic)
    await new Promise(r => setTimeout(r, 20));
    t.preDbEnd = process.hrtime.bigint();

    // DB work
    await timedQuery("SELECT pg_sleep(0.3)", [], res);

    t.postDbStart = process.hrtime.bigint();

    const result = await timedQuery(
      "SELECT generate_series(1, 5) as id",
      [],
      res
    );

    // POST-DB work
    await new Promise(r => setTimeout(r, 10));

    const end = process.hrtime.bigint();

    // calculations
    const total = Number(end - t.start) / 1e6;
    const db = Number(t.dbTime) / 1e6;
    const preDb = Number(t.preDbEnd - t.start) / 1e6;
    const postDb = Number(end - t.postDbStart) / 1e6;

    // erquired headers (important for CLI)
    res.set("X-Total-Time", total.toFixed(2) + "ms");
    res.set("X-DB-Time", db.toFixed(2) + "ms");
    res.set("X-Pre-DB-Time", preDb.toFixed(2) + "ms");
    res.set("X-Post-DB-Time", postDb.toFixed(2) + "ms");

    res.json({
      data: result.rows,
      timing: {
        total,
        db,
        preDb,
        postDb,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});




