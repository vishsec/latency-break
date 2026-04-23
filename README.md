# latency-break

CLI tool to analyze API latency and identify bottlenecks.

---

## Usage

Run directly with npx:

```bash
npx latencybreak <url>
```


To install:

```bash 
npm install latency-break
```

To run installed package:

```bash 
latency-break <url>
```


# latency-break

CLI tool to analyze API latency and break it down into meaningful segments (DB, server logic, total time).

It helps you identify **where your API is slow**, not just how slow it is.

---

## How it works

This tool sends an HTTP request to your API and reads **timing headers** returned by the server.

If the server is instrumented, it returns:

```text id="q2v8mc"
X-Total-Time
X-DB-Time
X-Pre-DB-Time
X-Post-DB-Time


## for demo 

Use demo folder

start the server
```bash
node index.js
```

then run directly with npx or the installed package, As stated above. 

