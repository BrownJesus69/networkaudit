# NetworkAudit

NetworkAudit is a network security audit tool. A mobile app collects
metadata about the Wi-Fi network a device is connected to (security type,
gateway IP, DNS servers, router vendor, signal strength, etc.) and sends it
to a backend API, which cross-references the router against known CVEs,
checks the gateway IP's reputation, and returns a set of findings, a
composite security score, and a letter grade.

## How the pieces relate

```
mobile/    Expo / React Native app — gathers network info on-device and
           calls the backend's /scan endpoint to get a security report.

backend/   Express + TypeScript API — receives scan input, looks up CVEs
           for the router vendor (NVD), checks IP reputation (AbuseIPDB,
           AlienVault OTX), geolocates the gateway, scores the network,
           and persists results to Postgres.

dataset/   Open dataset (router-cve-mapping.json) mapping consumer router
           models to known CVEs and default credentials. See
           dataset/README.md for its schema and contribution guidelines.
```

The mobile app is the client; the backend is the API and scoring engine it
talks to. The dataset is a standalone data source that backend services can
draw on (e.g. for offline/local CVE lookups) independent of the live NVD API.

## Running the backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and API keys
npm run migrate         # run DB migrations
npm run dev              # start the API with hot reload (nodemon + ts-node)
```

Other useful scripts: `npm run build` (compile to `dist/`), `npm start` (run
the compiled build), `npm run typecheck`.

Required environment variables (see `backend/.env.example`):

- `DATABASE_URL` — Postgres connection string (e.g. Neon)
- `NVD_API_KEY` — NVD (National Vulnerability Database) API key
- `ABUSEIPDB_KEY` — AbuseIPDB API key
- `OTX_API_KEY` — AlienVault OTX API key
- `PORT`, `NODE_ENV`
- `CENSYS_API_ID`, `CENSYS_API_SECRET` — optional

A `render.yaml` and `backend/Dockerfile` are included for deployment.

## Running the mobile app

```bash
cd mobile
npm install
npm start        # expo start
npm run android   # or: npm run ios / npm run web
```

The mobile app expects the backend API to be reachable; point it at your
running backend instance (local or deployed).

## Dataset

`dataset/router-cve-mapping.json` is an open, contributable mapping of
router models to CVEs and default credentials. See `dataset/README.md` for
the schema and how to contribute new entries.
