-- ── FILE: backend/src/db/migrations/002_seed_routers.sql ──

INSERT INTO router_fingerprints (vendor, model, known_cve_ids, default_credentials, risk_base_score)
VALUES
  ('TP-Link', 'Archer C6',
   ARRAY['CVE-2023-1389', 'CVE-2021-44827'],
   '[{"user":"admin","pass":"admin"}]'::jsonb,
   9.1),

  ('TP-Link', 'TL-WR840N',
   ARRAY['CVE-2022-30024'],
   '[{"user":"admin","pass":"admin"}]'::jsonb,
   7.5),

  ('D-Link', 'DIR-615',
   ARRAY['CVE-2019-16920', 'CVE-2018-10822'],
   '[{"user":"admin","pass":""}]'::jsonb,
   8.5),

  ('D-Link', 'DIR-825',
   ARRAY['CVE-2022-28958'],
   '[{"user":"admin","pass":"admin"}]'::jsonb,
   8.8),

  ('Netgear', 'R6400',
   ARRAY['CVE-2021-45732', 'CVE-2022-36429'],
   '[{"user":"admin","pass":"password"}]'::jsonb,
   8.0),

  ('Netgear', 'WNR2000',
   ARRAY['CVE-2016-10176', 'CVE-2017-6334'],
   '[{"user":"admin","pass":"password"}]'::jsonb,
   8.8),

  ('Asus', 'RT-N12',
   ARRAY['CVE-2018-20334', 'CVE-2014-9583'],
   '[{"user":"admin","pass":"admin"}]'::jsonb,
   9.5),

  ('Linksys', 'WRT54G',
   ARRAY['CVE-2014-8244', 'CVE-2013-3568'],
   '[{"user":"","pass":"admin"}]'::jsonb,
   7.2),

  ('Tenda', 'AC6',
   ARRAY['CVE-2020-10987', 'CVE-2018-14558'],
   '[{"user":"admin","pass":"admin"}]'::jsonb,
   9.1),

  ('Huawei', 'HG8245H',
   ARRAY['CVE-2017-17321', 'CVE-2021-22330'],
   '[{"user":"telecomadmin","pass":"admintelecom"}]'::jsonb,
   8.0)

ON CONFLICT (vendor, model) DO NOTHING;
