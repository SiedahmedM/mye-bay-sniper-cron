# eBay auction polling worker

A small Node.js process that calls the MyeBaySniper application's auction endpoints on a fixed schedule. This repository contains the timer loop and HTTP requests; the receiving application's auction logic lives elsewhere.

## What it runs

[index.js](index.js) makes authenticated HTTPS GET requests using Node's built-in `https` module:

| Endpoint | Schedule |
| --- | --- |
| `/api/cron/check-snipes` | Once at startup, then every 5 seconds |
| `/api/cron/check-auction-results` | Every 2 minutes |

Each request includes `CRON_SECRET` in the `x-cron-secret` header. The process logs the status code and the first 100 characters of the response, plus a heartbeat once a minute.

Keeping this loop in its own process lets the web application receive frequent checks without owning a persistent timer.

## Run it

Use Node.js and provide the secret expected by the receiving app. There are no npm dependencies to install.

Before starting your own instance, change `API_HOST` in `index.js` to your application's hostname. It is currently fixed to `mye-bay-sniper.vercel.app`, and startup immediately makes a request to that host.

```sh
export CRON_SECRET="your-local-test-secret"
npm start
```

For PowerShell, set the variable with `$env:CRON_SECRET = "your-local-test-secret"` before `npm start`.

## Operating limits

This is a continuously running process, so it needs a host or process manager that keeps it alive and restarts it after an exit. No deployment configuration is included.

Requests have a 25-second timeout setting. Interval callbacks do not wait for earlier requests to finish, so polls can overlap. Errors are logged; retries, backoff, and coordination between multiple instances are not implemented.

Check the script's syntax without making network requests with `node --check index.js`. There is no automated test suite.
