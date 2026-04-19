# NetworkAudit Router CVE Dataset

An open mapping of consumer router models to known CVEs and default credentials, intended for security research, education, and integration with network audit tools.

## Why This Exists

Consumer routers are among the most commonly exploited devices in home and small-office networks. Most users never change default credentials or update firmware. This dataset provides a structured, machine-readable reference for security tools to identify vulnerable hardware based on network metadata.

## Schema

```json
{
  "version": "string",
  "last_updated": "YYYY-MM-DD",
  "license": "MIT",
  "description": "string",
  "routers": [
    {
      "vendor": "string — manufacturer name",
      "models": ["string — model name(s)"],
      "gateway_ips": ["string — common default gateway IPs for this model"],
      "known_cves": [
        {
          "id": "string — CVE identifier (e.g. CVE-2023-1389)",
          "cvss_score": "number — CVSS v3.1 base score (0.0–10.0)",
          "severity": "string — CRITICAL | HIGH | MEDIUM | LOW",
          "description": "string — brief description of the vulnerability"
        }
      ],
      "default_creds": [
        {
          "user": "string — default username (empty string if none)",
          "pass": "string — default password (empty string if none)"
        }
      ],
      "risk_score": "number — composite risk score (0.0–10.0)"
    }
  ]
}
```

## Data Sources

- [NVD NIST](https://nvd.nist.gov/) — authoritative CVE database with CVSS scores
- Vendor security advisories (TP-Link, D-Link, Netgear, Asus, Linksys, Tenda, Huawei)
- [CVEdetails.com](https://www.cvedetails.com/) — aggregated CVE data with vendor filtering

## Verification

Every CVE in this dataset can be verified at:
```
https://nvd.nist.gov/vuln/detail/{CVE-ID}
```

Example: https://nvd.nist.gov/vuln/detail/CVE-2023-1389

## Current Coverage

10 router models from 7 vendors: TP-Link, D-Link, Netgear, Asus, Linksys, Tenda, Huawei.

## Contributing

1. Fork the repository
2. Add your router entry to `router-cve-mapping.json` following the schema above
3. Each CVE must include a link to its NVD entry in your PR description
4. Open a pull request with the title: `dataset: add {Vendor} {Model}`

**Requirements for PRs:**
- CVE ID must exist on nvd.nist.gov
- CVSS score must match the NVD record
- Default credentials must be verifiable from vendor documentation or a public source
- No speculative or unverified entries

## License

MIT License — free to use in any security tool, research, or educational project with attribution.
