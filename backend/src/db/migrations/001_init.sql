-- ── FILE: backend/src/db/migrations/001_init.sql ──

CREATE TABLE IF NOT EXISTS router_fingerprints (
  id                  SERIAL PRIMARY KEY,
  vendor              VARCHAR(100) NOT NULL,
  model               VARCHAR(200) NOT NULL,
  firmware_pattern    VARCHAR(500),
  default_credentials JSONB,
  known_cve_ids       TEXT[],
  risk_base_score     DECIMAL(3,1),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_router_vendor_model UNIQUE (vendor, model)
);

CREATE INDEX IF NOT EXISTS idx_router_vendor ON router_fingerprints(vendor);

CREATE TABLE IF NOT EXISTS cve_cache (
  cve_id       VARCHAR(30) PRIMARY KEY,
  cvss_score   DECIMAL(3,1),
  cvss_vector  VARCHAR(200),
  description  TEXT,
  affected_cpe TEXT[],
  severity     VARCHAR(20),
  fetched_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cve_severity ON cve_cache(severity);

CREATE TABLE IF NOT EXISTS scan_results (
  id                 SERIAL PRIMARY KEY,
  device_fingerprint VARCHAR(64),
  network_type       VARCHAR(20),
  security_type      VARCHAR(20),
  gateway_ip         INET,
  dns_servers        INET[],
  findings           JSONB,
  overall_score      DECIMAL(3,1),
  scanned_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_device ON scan_results(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_scan_time ON scan_results(scanned_at DESC);
