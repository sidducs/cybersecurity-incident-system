import psycopg2

conn = psycopg2.connect(
    dbname='cybersecurity_db',
    user='postgres',
    password='2233',
    host='127.0.0.1',
    port='5432'
)
cur = conn.cursor()

# 6. INVESTIGATIONS
investigations_data = [
    (1, 1, 2, "Malware executable identified as LockBit 3.0 builder payload. Ingress vector traced to exposed RDP port on staging jumpbox. Lateral movement executed via SMB psexec.", "2026-02-01 03:00:00+05:30", "2026-02-01 06:15:00+05:30"),
    (2, 2, 3, "Phishing email contained spoofed DKIM signatures. 2 users entered passwords. Password resets enforced immediately; multi-factor auth tokens invalidated.", "2026-02-02 09:30:00+05:30", None),
    (3, 3, 4, "Parameter /api/v1/checkout/transaction was vulnerable to boolean SQL injection due to dynamic string concatenation in legacy stored procedure.", "2026-02-03 14:30:00+05:30", "2026-02-03 17:45:00+05:30"),
    (4, 4, 5, "SYN flood peaked at 410 Gbps and 65 Mpps. Sourced from Mirai-infected IoT devices. Mitigated via scrubbing center ACLs.", "2026-02-04 18:45:00+05:30", "2026-02-04 20:00:00+05:30"),
    (5, 5, 2, "Kernel CVE exploited. The backup service account was compromised via hardcoded API key in an uncommitted Git configuration file.", "2026-02-05 04:10:00+05:30", None),
    (6, 6, 6, "Data exfiltration script executed via cron job using base64 encoded chunks through HTTPS POST requests to offshore VPS hosting server.", "2026-02-06 02:00:00+05:30", "2026-02-06 05:20:00+05:30"),
    (7, 7, 3, "Brute force automated dictionary attack. Blocked offending /24 CIDR blocks on external perimeter border firewall.", "2026-02-07 11:15:00+05:30", "2026-02-07 12:20:00+05:30"),
    (8, 8, 4, "Host isolated. Memory dump revealed Emotet dropper attempting to download secondary ransomware stage. Payload stopped before execution.", "2026-02-08 10:45:00+05:30", "2026-02-08 12:45:00+05:30")
]
for inv in investigations_data:
    cur.execute("""
        INSERT INTO investigations (investigation_id, incident_id, analyst_id, findings, started_at, completed_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (investigation_id) DO NOTHING;
    """, inv)

# 7. RESPONSE_ACTIONS
responses_data = [
    (1, 1, 2, "Network Isolation", "Isolated PROD-DB-CLUSTER-01 network VLAN port to halt lateral spread.", "Completed", "2026-02-01 02:45:00+05:30"),
    (2, 1, 2, "Snapshot Recovery", "Restored PostgreSQL data volume from immutable hourly SAN snapshot taken at 01:00 UTC.", "Completed", "2026-02-01 05:30:00+05:30"),
    (3, 2, 3, "Credential Revocation", "Force-revoked all active session cookies and initiated emergency password reset for 14 compromised accounts.", "Completed", "2026-02-02 10:00:00+05:30"),
    (4, 3, 4, "WAF Rule Deployment", "Deployed AWS WAF custom regex inspection block on /api/v1/checkout URI.", "Completed", "2026-02-03 14:45:00+05:30"),
    (5, 3, 4, "Code Patch", "Patched database access layer with parameterized query prepared statements.", "Completed", "2026-02-03 18:00:00+05:30"),
    (6, 4, 5, "BGP Blackholing", "Advertised /32 route via BGP community to ISP scrubbing centers.", "Completed", "2026-02-04 19:00:00+05:30"),
    (7, 5, 2, "Account Suspension", "Disabled compromised service account 'svc_backup' and terminated active root processes.", "Completed", "2026-02-05 04:30:00+05:30"),
    (8, 6, 6, "Firewall Egress Block", "Blocked destination IP 45.154.255.80 and revoked AWS S3 bucket IAM read permissions.", "Completed", "2026-02-06 02:40:00+05:30"),
    (9, 7, 3, "IP Blacklisting", "Pushed 12 IP addresses to threat intelligence blocklist on corporate perimeter gateway.", "Completed", "2026-02-07 11:45:00+05:30"),
    (10, 8, 4, "Host Quarantine", "EDR client quarantined FIN-WORKSTATION-08 and sanitized malicious Word template file.", "Completed", "2026-02-08 11:00:00+05:30")
]
for resp in responses_data:
    cur.execute("""
        INSERT INTO response_actions (response_id, incident_id, performed_by, action_type, description, action_status, performed_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (response_id) DO NOTHING;
    """, resp)

# 8. INCIDENT_STATUS_HISTORY
history_data = [
    (1, 1, "New", "Investigating", 2, "2026-02-01 02:30:00+05:30", "Analyst Alex Rivera assigned to investigate ransomware alerts."),
    (2, 1, "Investigating", "Contained", 2, "2026-02-01 04:00:00+05:30", "Host isolated from enterprise network; encryption halted."),
    (3, 2, "New", "Investigating", 3, "2026-02-02 09:20:00+05:30", "David Chen began log analysis of phishing clicks."),
    (4, 3, "New", "Investigating", 4, "2026-02-03 14:15:00+05:30", "Maya Lin reviewing WAF payload logs."),
    (5, 3, "Investigating", "Contained", 4, "2026-02-03 15:00:00+05:30", "Temporary WAF blocking rule active."),
    (6, 3, "Contained", "Resolved", 4, "2026-02-03 18:20:00+05:30", "Software engineering released parameterized query patch."),
    (7, 4, "New", "Investigating", 5, "2026-02-04 18:35:00+05:30", "Vikram Rao opened DDoS emergency bridge."),
    (8, 4, "Investigating", "Resolved", 5, "2026-02-04 20:15:00+05:30", "Scrubbing center filtered volumetric attack; traffic normal."),
    (9, 5, "New", "Investigating", 2, "2026-02-05 03:55:00+05:30", "Kernel exploit triage in progress."),
    (10, 6, "New", "Investigating", 6, "2026-02-06 01:40:00+05:30", "Elena Rostova checking egress flow logs."),
    (11, 6, "Investigating", "Contained", 6, "2026-02-06 03:10:00+05:30", "Egress port and S3 API credentials revoked.")
]
for h in history_data:
    cur.execute("""
        INSERT INTO incident_status_history (history_id, incident_id, old_status, new_status, changed_by, changed_at, remarks)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (history_id) DO NOTHING;
    """, h)

# 9. RISK_ASSESSMENTS
risk_data = [
    (1, 1, 95.00, 100.00, 90.00, 95.00, "Critical", 2, "2026-02-01 02:40:00+05:30"),
    (2, 2, 70.00, 75.00, 72.50, 72.50, "High", 3, "2026-02-02 09:40:00+05:30"),
    (3, 3, 90.00, 90.00, 84.00, 88.00, "Critical", 4, "2026-02-03 14:20:00+05:30"),
    (4, 4, 75.00, 85.00, 68.00, 76.00, "High", 5, "2026-02-04 18:40:00+05:30"),
    (5, 5, 95.00, 95.00, 86.00, 92.00, "Critical", 2, "2026-02-05 04:00:00+05:30"),
    (6, 6, 92.00, 95.00, 87.50, 91.50, "Critical", 6, "2026-02-06 01:50:00+05:30"),
    (7, 7, 45.00, 50.00, 40.00, 45.00, "Medium", 3, "2026-02-07 11:20:00+05:30"),
    (8, 8, 70.00, 70.00, 64.00, 68.00, "High", 4, "2026-02-08 10:30:00+05:30")
]
for r in risk_data:
    cur.execute("""
        INSERT INTO risk_assessments (risk_id, incident_id, severity_score, asset_score, impact_score, risk_score, risk_level, calculated_by, calculated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (risk_id) DO NOTHING;
    """, r)

# 10. AUDIT_LOGS
audit_data = [
    (1, 1, 1, "INCIDENT_CREATED", "Sarah Connor logged ransomware outbreak on database cluster.", "2026-02-01 02:15:00+05:30"),
    (2, 2, 1, "INCIDENT_ASSIGNED", "Assigned incident 1 to Security Analyst Alex Rivera.", "2026-02-01 02:30:00+05:30"),
    (3, 2, 1, "CONTAINMENT_TRIGGERED", "VLAN isolation command issued to network switches.", "2026-02-01 02:45:00+05:30"),
    (4, 1, 3, "INCIDENT_CREATED", "WAF alert triggered automated creation of SQLi ticket.", "2026-02-03 14:05:00+05:30"),
    (5, 4, 3, "STATUS_RESOLVED", "Maya Lin marked SQLi incident resolved following code patch.", "2026-02-03 18:20:00+05:30"),
    (6, 1, 6, "INCIDENT_CREATED", "Netflow anomaly sensor flagged 120GB egress to offshore IP.", "2026-02-06 01:20:00+05:30")
]
for a in audit_data:
    cur.execute("""
        INSERT INTO audit_logs (audit_id, user_id, incident_id, action, description, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (audit_id) DO NOTHING;
    """, a)

conn.commit()
print("All child relational tables populated successfully in PostgreSQL!")

# Verify record counts
cur.execute("""
    SELECT 'roles' AS tbl, count(*) FROM roles
    UNION ALL SELECT 'users', count(*) FROM users
    UNION ALL SELECT 'assets', count(*) FROM assets
    UNION ALL SELECT 'incident_types', count(*) FROM incident_types
    UNION ALL SELECT 'incidents', count(*) FROM incidents
    UNION ALL SELECT 'investigations', count(*) FROM investigations
    UNION ALL SELECT 'response_actions', count(*) FROM response_actions
    UNION ALL SELECT 'incident_status_history', count(*) FROM incident_status_history
    UNION ALL SELECT 'risk_assessments', count(*) FROM risk_assessments
    UNION ALL SELECT 'audit_logs', count(*) FROM audit_logs
    UNION ALL SELECT 'incident_embeddings', count(*) FROM incident_embeddings;
""")

print("\n--- Final PostgreSQL cybersecurity_db Table Counts ---")
for tbl, cnt in cur.fetchall():
    print(f"  {tbl:25s} : {cnt} rows")

cur.close()
conn.close()

