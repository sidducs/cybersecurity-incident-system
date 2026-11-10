import json
import random

def generate_mysql_seed():
    sql = []
    sql.append("-- ============================================================================")
    sql.append("-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT")
    sql.append("-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System")
    sql.append("-- SEED DATASET FOR MYSQL 8.0+")
    sql.append("-- ============================================================================")
    sql.append("USE cybersecurity_db;")
    sql.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql.append("TRUNCATE TABLE incident_embeddings;")
    sql.append("TRUNCATE TABLE audit_logs;")
    sql.append("TRUNCATE TABLE risk_assessments;")
    sql.append("TRUNCATE TABLE incident_status_history;")
    sql.append("TRUNCATE TABLE response_actions;")
    sql.append("TRUNCATE TABLE investigations;")
    sql.append("TRUNCATE TABLE incidents;")
    sql.append("TRUNCATE TABLE assets;")
    sql.append("TRUNCATE TABLE incident_types;")
    sql.append("TRUNCATE TABLE users;")
    sql.append("TRUNCATE TABLE roles;")
    sql.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql.append("")

    # 1. ROLES
    sql.append("-- 1. ROLES")
    sql.append("INSERT INTO roles (role_id, role_name) VALUES")
    sql.append("    (1, 'Administrator'),")
    sql.append("    (2, 'Security Analyst');")
    sql.append("")

    # 2. USERS
    sql.append("-- 2. USERS")
    # Default password hash for 'Password@123'
    pwd_hash = "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
    sql.append("INSERT INTO users (user_id, role_id, full_name, email, password_hash, is_active, created_at) VALUES")
    sql.append(f"    (1, 1, 'Sarah Connor', 'sarah.connor@soc.corp', '{pwd_hash}', TRUE, '2026-01-10 08:00:00'),")
    sql.append(f"    (2, 2, 'Alex Rivera', 'alex.rivera@soc.corp', '{pwd_hash}', TRUE, '2026-01-11 09:30:00'),")
    sql.append(f"    (3, 2, 'David Chen', 'david.chen@soc.corp', '{pwd_hash}', TRUE, '2026-01-12 10:15:00'),")
    sql.append(f"    (4, 2, 'Maya Lin', 'maya.lin@soc.corp', '{pwd_hash}', TRUE, '2026-01-15 11:00:00'),")
    sql.append(f"    (5, 2, 'Vikram Rao', 'vikram.rao@soc.corp', '{pwd_hash}', TRUE, '2026-01-18 08:45:00'),")
    sql.append(f"    (6, 2, 'Elena Rostova', 'elena.rostova@soc.corp', '{pwd_hash}', TRUE, '2026-01-20 14:20:00');")
    sql.append("")

    # 3. ASSETS
    sql.append("-- 3. ASSETS")
    sql.append("INSERT INTO assets (asset_id, asset_name, asset_type, criticality, ip_address, department, is_active, created_at) VALUES")
    sql.append("    (1, 'PROD-DB-CLUSTER-01', 'Database', 'Critical', '10.0.1.10', 'Engineering', TRUE, '2026-01-01 00:00:00'),")
    sql.append("    (2, 'AUTH-SRV-CORE', 'Server', 'Critical', '10.0.1.15', 'Security', TRUE, '2026-01-01 00:00:00'),")
    sql.append("    (3, 'PAYMENT-API-GW', 'Cloud Resource', 'Critical', '10.0.2.50', 'Finance', TRUE, '2026-01-02 00:00:00'),")
    sql.append("    (4, 'EDGE-FIREWALL-HQ', 'Firewall', 'Critical', '192.168.1.1', 'IT Infrastructure', TRUE, '2026-01-02 00:00:00'),")
    sql.append("    (5, 'HR-PORTAL-WEB', 'Server', 'High', '10.0.4.12', 'Human Resources', TRUE, '2026-01-05 00:00:00'),")
    sql.append("    (6, 'DEV-BUILD-RUNNER', 'Server', 'Medium', '10.0.3.22', 'Engineering', TRUE, '2026-01-05 00:00:00'),")
    sql.append("    (7, 'FIN-WORKSTATION-08', 'Workstation', 'High', '192.168.10.45', 'Finance', TRUE, '2026-01-08 00:00:00'),")
    sql.append("    (8, 'SOC-MONITOR-WS01', 'Workstation', 'Low', '192.168.20.101', 'Security Operations', TRUE, '2026-01-08 00:00:00'),")
    sql.append("    (9, 'MAIL-EXCHANGE-01', 'Server', 'High', '10.0.1.30', 'IT Infrastructure', TRUE, '2026-01-10 00:00:00'),")
    sql.append("    (10, 'ANALYTICS-DATALAKE', 'Cloud Resource', 'Critical', '10.0.5.88', 'Data Analytics', TRUE, '2026-01-10 00:00:00');")
    sql.append("")

    # 4. INCIDENT_TYPES
    sql.append("-- 4. INCIDENT_TYPES")
    sql.append("INSERT INTO incident_types (incident_type_id, type_name, description) VALUES")
    sql.append("    (1, 'Ransomware', 'Extortion software encrypting sensitive server volumes and demanding digital ransom payment.'),")
    sql.append("    (2, 'Phishing Campaign', 'Deceptive emails impersonating executives or services designed to harvest corporate credentials.'),")
    sql.append("    (3, 'SQL Injection', 'Malicious SQL fragments injected into API parameters to extract or manipulate backend databases.'),")
    sql.append("    (4, 'DDoS Volumetric', 'High volume distributed network traffic flooding edge routers to disrupt business service.'),")
    sql.append("    (5, 'Privilege Escalation', 'Attacker elevating unprivileged account permissions to root or domain administrator.'),")
    sql.append("    (6, 'Data Exfiltration', 'Covert extraction and transmission of proprietary company IP or customer data outside boundary.'),")
    sql.append("    (7, 'Brute Force Auth', 'Automated high frequency credential stuffing against SSH, RDP, or VPN gateways.'),")
    sql.append("    (8, 'Zero-Day Exploit', 'Active exploitation of an unpatched software vulnerability in core enterprise stacks.');")
    sql.append("")

    # 5. INCIDENTS (15 realistic incidents)
    sql.append("-- 5. INCIDENTS")
    incidents_data = [
        (1, 1, 1, 2, 1, "Ransomware encryption detected on PROD-DB-CLUSTER-01", 
         "LockBit variant observed appending .locked extensions on /var/lib/postgresql database partition. Canary tokens tripped.", 
         "Critical", "Contained", "Critical", 95.00, "2026-02-01 02:15:00", "2026-02-01 06:30:00", None),
        (2, 2, 2, 3, 5, "Executive phishing emails harvested HR portal credentials", 
         "Targeted spear-phishing campaign posing as CEO urgent memo redirected 14 employees to spoofed SSO login clone.", 
         "High", "Investigating", "High", 72.50, "2026-02-02 09:10:00", "2026-02-02 11:45:00", None),
        (3, 3, 1, 4, 3, "Blind SQL Injection detected on Payment API endpoint", 
         "WAF logged repeated time-based blind SQLi payloads on /api/v1/checkout/transaction parameter from external IP 185.220.101.5.", 
         "Critical", "Resolved", "Critical", 88.00, "2026-02-03 14:05:00", "2026-02-03 18:20:00", "2026-02-03 18:20:00"),
        (4, 4, 2, 5, 4, "400Gbps SYN-flood volumetric DDoS attacking EDGE-FIREWALL-HQ", 
         "Upstream transit circuits saturated. BGP flowspec scrubbing initiated to mitigate multi-vector volumetric UDP/SYN flood.", 
         "High", "Resolved", "High", 76.00, "2026-02-04 18:30:00", "2026-02-04 20:15:00", "2026-02-04 20:15:00"),
        (5, 5, 3, 2, 2, "Unauthorized sudo root privilege escalation on AUTH-SRV-CORE", 
         "Local service account 'svc_backup' exploited sudo dirty_pipe CVE to spawn interactive root shell and dump /etc/shadow.", 
         "Critical", "Investigating", "Critical", 92.00, "2026-02-05 03:40:00", "2026-02-05 07:10:00", None),
        (6, 6, 4, 6, 10, "Suspicious 120GB egress transfer to offshore IP from DataLake", 
         "Anomalous midnight outbound data transfer over encrypted TLS tunnel detected from S3 analytics datalake to 45.154.255.80.", 
         "Critical", "Contained", "Critical", 91.50, "2026-02-06 01:20:00", "2026-02-06 05:40:00", None),
        (7, 7, 2, 3, 2, "Brute force password spraying against SSH gateway", 
         "Over 45,000 failed authentication attempts within 10 minutes originating from Russian and Tor exit relays.", 
         "Medium", "Resolved", "Medium", 45.00, "2026-02-07 11:00:00", "2026-02-07 12:30:00", "2026-02-07 12:30:00"),
        (8, 2, 5, 4, 7, "Macro-enabled malicious invoice opened on FIN-WORKSTATION-08", 
         "Accountant opened Word attachment containing VBA downloader that contacted known Emotet C2 staging infrastructure.", 
         "High", "Contained", "High", 68.00, "2026-02-08 10:15:00", "2026-02-08 13:00:00", None),
        (9, 8, 1, 2, 9, "Zero-Day remote code execution attempt on MAIL-EXCHANGE-01", 
         "Exploitation attempt targeting unauthenticated HTTP request smuggling in webmail frontend proxy parser.", 
         "Critical", "Investigating", "Critical", 89.00, "2026-02-09 16:45:00", "2026-02-09 19:00:00", None),
        (10, 3, 3, 5, 5, "Error-based SQL injection on HR feedback portal", 
         "Single unauthorized user submitted quotes inside suggestion box, disclosing internal PostgreSQL schema table names.", 
         "Low", "Resolved", "Low", 22.00, "2026-02-10 09:00:00", "2026-02-10 10:15:00", "2026-02-10 10:15:00"),
        (11, 7, 4, None, 4, "Automated credential stuffing attempts on customer portal", 
         "Distributed botnet cycling breached credential dumps against web customer login portal.", 
         "Medium", "New", "Medium", 48.00, "2026-02-11 14:00:00", "2026-02-11 14:00:00", None),
        (12, 2, 5, None, 9, "Suspicious phishing report from Sales team regarding IT upgrade", 
         "Broadcast email claimed urgent password reset needed before IT hardware maintenance window.", 
         "Medium", "New", "Medium", 35.00, "2026-02-12 08:30:00", "2026-02-12 08:30:00", None),
        (13, 6, 2, 3, 1, "Database snapshot backup downloaded to unauthorized personal drive", 
         "Database engineer created unencrypted local backup dump and uploaded it to personal Google Drive repository.", 
         "High", "Resolved", "High", 65.00, "2026-02-13 13:20:00", "2026-02-13 17:50:00", "2026-02-13 17:50:00"),
        (14, 4, 3, None, 4, "Spike in UDP port 53 DNS amplification traffic", 
         "DNS recursive query reflection detected by netflow collector targeting secondary edge router VIP.", 
         "Low", "False Positive", "Low", 15.00, "2026-02-14 11:10:00", "2026-02-14 11:50:00", "2026-02-14 11:50:00"),
        (15, 5, 1, 6, 6, "Developer workstation running suspicious container with host root mount", 
         "Container runtime security agent alerted on Docker container executing with privileged flag and / host root mounted.", 
         "Medium", "Investigating", "Medium", 52.00, "2026-02-15 15:40:00", "2026-02-15 16:30:00", None)
    ]

    sql.append("INSERT INTO incidents (incident_id, incident_type_id, reported_by, assigned_to, asset_id, title, description, severity, status, priority, risk_score, reported_at, updated_at, resolved_at) VALUES")
    inc_rows = []
    for inc in incidents_data:
        iid, itid, rep_by, ass_to, aid, title, desc, sev, st, pri, rs, r_at, u_at, res_at = inc
        ass_str = f"{ass_to}" if ass_to is not None else "NULL"
        res_str = f"'{res_at}'" if res_at is not None else "NULL"
        esc_desc = desc.replace("'", "''")
        esc_title = title.replace("'", "''")
        inc_rows.append(f"    ({iid}, {itid}, {rep_by}, {ass_str}, {aid}, '{esc_title}', '{esc_desc}', '{sev}', '{st}', '{pri}', {rs:.2f}, '{r_at}', '{u_at}', {res_str})")
    sql.append(",\n".join(inc_rows) + ";")
    sql.append("")

    # 6. INVESTIGATIONS
    sql.append("-- 6. INVESTIGATIONS")
    investigations_data = [
        (1, 1, 2, "Malware executable identified as LockBit 3.0 builder payload. Ingress vector traced to exposed RDP port on staging jumpbox. Lateral movement executed via SMB psexec.", "2026-02-01 03:00:00", "2026-02-01 06:15:00"),
        (2, 2, 3, "Phishing email contained spoofed DKIM signatures. 2 users entered passwords. Password resets enforced immediately; multi-factor auth tokens invalidated.", "2026-02-02 09:30:00", None),
        (3, 3, 4, "Parameter /api/v1/checkout/transaction was vulnerable to boolean SQL injection due to dynamic string concatenation in legacy stored procedure.", "2026-02-03 14:30:00", "2026-02-03 17:45:00"),
        (4, 4, 5, "SYN flood peaked at 410 Gbps and 65 Mpps. Sourced from Mirai-infected IoT devices. Mitigated via scrubbing center ACLs.", "2026-02-04 18:45:00", "2026-02-04 20:00:00"),
        (5, 5, 2, "Kernel CVE exploited. The backup service account was compromised via hardcoded API key in an uncommitted Git configuration file.", "2026-02-05 04:10:00", None),
        (6, 6, 6, "Data exfiltration script executed via cron job using base64 encoded chunks through HTTPS POST requests to offshore VPS hosting server.", "2026-02-06 02:00:00", "2026-02-06 05:20:00"),
        (7, 7, 3, "Brute force automated dictionary attack. Blocked offending /24 CIDR blocks on external perimeter border firewall.", "2026-02-07 11:15:00", "2026-02-07 12:20:00"),
        (8, 8, 4, "Host isolated. Memory dump revealed Emotet dropper attempting to download secondary ransomware stage. Payload stopped before execution.", "2026-02-08 10:45:00", "2026-02-08 12:45:00")
    ]
    sql.append("INSERT INTO investigations (investigation_id, incident_id, analyst_id, findings, started_at, completed_at) VALUES")
    inv_rows = []
    for inv in investigations_data:
        invid, inc_id, an_id, findings, s_at, c_at = inv
        c_str = f"'{c_at}'" if c_at is not None else "NULL"
        esc_f = findings.replace("'", "''")
        inv_rows.append(f"    ({invid}, {inc_id}, {an_id}, '{esc_f}', '{s_at}', {c_str})")
    sql.append(",\n".join(inv_rows) + ";")
    sql.append("")

    # 7. RESPONSE_ACTIONS
    sql.append("-- 7. RESPONSE_ACTIONS")
    responses_data = [
        (1, 1, 2, "Network Isolation", "Isolated PROD-DB-CLUSTER-01 network VLAN port to halt lateral spread.", "Completed", "2026-02-01 02:45:00"),
        (2, 1, 2, "Snapshot Recovery", "Restored PostgreSQL data volume from immutable hourly SAN snapshot taken at 01:00 UTC.", "Completed", "2026-02-01 05:30:00"),
        (3, 2, 3, "Credential Revocation", "Force-revoked all active session cookies and initiated emergency password reset for 14 compromised accounts.", "Completed", "2026-02-02 10:00:00"),
        (4, 3, 4, "WAF Rule Deployment", "Deployed AWS WAF custom regex inspection block on /api/v1/checkout URI.", "Completed", "2026-02-03 14:45:00"),
        (5, 3, 4, "Code Patch", "Patched database access layer with parameterized query prepared statements.", "Completed", "2026-02-03 18:00:00"),
        (6, 4, 5, "BGP Blackholing", "Advertised /32 route via BGP community to ISP scrubbing centers.", "Completed", "2026-02-04 19:00:00"),
        (7, 5, 2, "Account Suspension", "Disabled compromised service account 'svc_backup' and terminated active root processes.", "Completed", "2026-02-05 04:30:00"),
        (8, 6, 6, "Firewall Egress Block", "Blocked destination IP 45.154.255.80 and revoked AWS S3 bucket IAM read permissions.", "Completed", "2026-02-06 02:40:00"),
        (9, 7, 3, "IP Blacklisting", "Pushed 12 IP addresses to threat intelligence blocklist on corporate perimeter gateway.", "Completed", "2026-02-07 11:45:00"),
        (10, 8, 4, "Host Quarantine", "EDR client quarantined FIN-WORKSTATION-08 and sanitized malicious Word template file.", "Completed", "2026-02-08 11:00:00")
    ]
    sql.append("INSERT INTO response_actions (response_id, incident_id, performed_by, action_type, description, action_status, performed_at) VALUES")
    resp_rows = []
    for resp in responses_data:
        rid, inc_id, p_by, act_type, desc, act_st, p_at = resp
        esc_d = desc.replace("'", "''")
        resp_rows.append(f"    ({rid}, {inc_id}, {p_by}, '{act_type}', '{esc_d}', '{act_st}', '{p_at}')")
    sql.append(",\n".join(resp_rows) + ";")
    sql.append("")

    # 8. INCIDENT_STATUS_HISTORY
    sql.append("-- 8. INCIDENT_STATUS_HISTORY")
    history_data = [
        (1, 1, "New", "Investigating", 2, "2026-02-01 02:30:00", "Analyst Alex Rivera assigned to investigate ransomware alerts."),
        (2, 1, "Investigating", "Contained", 2, "2026-02-01 04:00:00", "Host isolated from enterprise network; encryption halted."),
        (3, 2, "New", "Investigating", 3, "2026-02-02 09:20:00", "David Chen began log analysis of phishing clicks."),
        (4, 3, "New", "Investigating", 4, "2026-02-03 14:15:00", "Maya Lin reviewing WAF payload logs."),
        (5, 3, "Investigating", "Contained", 4, "2026-02-03 15:00:00", "Temporary WAF blocking rule active."),
        (6, 3, "Contained", "Resolved", 4, "2026-02-03 18:20:00", "Software engineering released parameterized query patch."),
        (7, 4, "New", "Investigating", 5, "2026-02-04 18:35:00", "Vikram Rao opened DDoS emergency bridge."),
        (8, 4, "Investigating", "Resolved", 5, "2026-02-04 20:15:00", "Scrubbing center filtered volumetric attack; traffic normal."),
        (9, 5, "New", "Investigating", 2, "2026-02-05 03:55:00", "Kernel exploit triage in progress."),
        (10, 6, "New", "Investigating", 6, "2026-02-06 01:40:00", "Elena Rostova checking egress flow logs."),
        (11, 6, "Investigating", "Contained", 6, "2026-02-06 03:10:00", "Egress port and S3 API credentials revoked.")
    ]
    sql.append("INSERT INTO incident_status_history (history_id, incident_id, old_status, new_status, changed_by, changed_at, remarks) VALUES")
    hist_rows = []
    for h in history_data:
        hid, inc_id, o_st, n_st, chg_by, chg_at, rem = h
        esc_rem = rem.replace("'", "''")
        hist_rows.append(f"    ({hid}, {inc_id}, '{o_st}', '{n_st}', {chg_by}, '{chg_at}', '{esc_rem}')")
    sql.append(",\n".join(hist_rows) + ";")
    sql.append("")

    # 9. RISK_ASSESSMENTS
    sql.append("-- 9. RISK_ASSESSMENTS")
    risk_data = [
        (1, 1, 95.00, 100.00, 90.00, 95.00, "Critical", 2, "2026-02-01 02:40:00"),
        (2, 2, 70.00, 75.00, 72.50, 72.50, "High", 3, "2026-02-02 09:40:00"),
        (3, 3, 90.00, 90.00, 84.00, 88.00, "Critical", 4, "2026-02-03 14:20:00"),
        (4, 4, 75.00, 85.00, 68.00, 76.00, "High", 5, "2026-02-04 18:40:00"),
        (5, 5, 95.00, 95.00, 86.00, 92.00, "Critical", 2, "2026-02-05 04:00:00"),
        (6, 6, 92.00, 95.00, 87.50, 91.50, "Critical", 6, "2026-02-06 01:50:00"),
        (7, 7, 45.00, 50.00, 40.00, 45.00, "Medium", 3, "2026-02-07 11:20:00"),
        (8, 8, 70.00, 70.00, 64.00, 68.00, "High", 4, "2026-02-08 10:30:00")
    ]
    sql.append("INSERT INTO risk_assessments (risk_id, incident_id, severity_score, asset_score, impact_score, risk_score, risk_level, calculated_by, calculated_at) VALUES")
    risk_rows = []
    for r in risk_data:
        rk_id, inc_id, ss, as_sc, is_sc, rs, rl, cb, ca = r
        risk_rows.append(f"    ({rk_id}, {inc_id}, {ss:.2f}, {as_sc:.2f}, {is_sc:.2f}, {rs:.2f}, '{rl}', {cb}, '{ca}')")
    sql.append(",\n".join(risk_rows) + ";")
    sql.append("")

    # 10. AUDIT_LOGS
    sql.append("-- 10. AUDIT_LOGS")
    audit_data = [
        (1, 1, 1, "INCIDENT_CREATED", "Sarah Connor logged ransomware outbreak on database cluster.", "2026-02-01 02:15:00"),
        (2, 2, 1, "INCIDENT_ASSIGNED", "Assigned incident 1 to Security Analyst Alex Rivera.", "2026-02-01 02:30:00"),
        (3, 2, 1, "CONTAINMENT_TRIGGERED", "VLAN isolation command issued to network switches.", "2026-02-01 02:45:00"),
        (4, 1, 3, "INCIDENT_CREATED", "WAF alert triggered automated creation of SQLi ticket.", "2026-02-03 14:05:00"),
        (5, 4, 3, "STATUS_RESOLVED", "Maya Lin marked SQLi incident resolved following code patch.", "2026-02-03 18:20:00"),
        (6, 1, 6, "INCIDENT_CREATED", "Netflow anomaly sensor flagged 120GB egress to offshore IP.", "2026-02-06 01:20:00")
    ]
    sql.append("INSERT INTO audit_logs (audit_id, user_id, incident_id, action, description, created_at) VALUES")
    aud_rows = []
    for a in audit_data:
        aid, uid, inc_id, act, desc, cat = a
        esc_desc = desc.replace("'", "''")
        aud_rows.append(f"    ({aid}, {uid}, {inc_id}, '{act}', '{esc_desc}', '{cat}')")
    sql.append(",\n".join(aud_rows) + ";")
    sql.append("")

    # 11. INCIDENT_EMBEDDINGS (Vector Mock as JSON in MySQL)
    sql.append("-- 11. INCIDENT_EMBEDDINGS (Synthetic 384-dimensional dense vectors stored as JSON)")
    random.seed(42)
    emb_rows = []
    for i in range(1, 16):
        # Generate 384 random normalized float values
        vec = [round(random.uniform(-0.15, 0.15), 5) for _ in range(384)]
        vec_json = json.dumps(vec)
        emb_rows.append(f"    ({i}, {i}, '{vec_json}', 'all-MiniLM-L6-v2', '2026-02-01 03:00:00')")
    
    sql.append("INSERT INTO incident_embeddings (embedding_id, incident_id, embedding, model_name, created_at) VALUES")
    sql.append(",\n".join(emb_rows) + ";")
    sql.append("")

    return "\n".join(sql)

seed_sql = generate_mysql_seed()
seed_path = r'D:\DBMS Mini Project\database\seed_data_mysql.sql'
with open(seed_path, 'w', encoding='utf-8') as f:
    f.write(seed_sql)
print(f'Successfully generated MySQL seed file: {seed_path} ({len(seed_sql)} bytes)')

