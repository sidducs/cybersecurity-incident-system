import psycopg2
from sentence_transformers import SentenceTransformer

print("Loading sentence-transformers model 'all-MiniLM-L6-v2'...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully!")

conn = psycopg2.connect(
    dbname='cybersecurity_db',
    user='postgres',
    password='2233',
    host='127.0.0.1',
    port='5432'
)
cur = conn.cursor()

# 1. ROLES
cur.execute("""
    INSERT INTO roles (role_id, role_name) VALUES
        (1, 'Administrator'),
        (2, 'Security Analyst')
    ON CONFLICT (role_id) DO NOTHING;
""")

# 2. USERS
pwd_hash = "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
users = [
    (1, 1, 'Sarah Connor', 'sarah.connor@soc.corp', pwd_hash, True, '2026-01-10 08:00:00+05:30'),
    (2, 2, 'Alex Rivera', 'alex.rivera@soc.corp', pwd_hash, True, '2026-01-11 09:30:00+05:30'),
    (3, 2, 'David Chen', 'david.chen@soc.corp', pwd_hash, True, '2026-01-12 10:15:00+05:30'),
    (4, 2, 'Maya Lin', 'maya.lin@soc.corp', pwd_hash, True, '2026-01-15 11:00:00+05:30'),
    (5, 2, 'Vikram Rao', 'vikram.rao@soc.corp', pwd_hash, True, '2026-01-18 08:45:00+05:30'),
    (6, 2, 'Elena Rostova', 'elena.rostova@soc.corp', pwd_hash, True, '2026-01-20 14:20:00+05:30')
]
for u in users:
    cur.execute("""
        INSERT INTO users (user_id, role_id, full_name, email, password_hash, is_active, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO NOTHING;
    """, u)

# 3. ASSETS
assets = [
    (1, 'PROD-DB-CLUSTER-01', 'Database', 'Critical', '10.0.1.10', 'Engineering', True),
    (2, 'AUTH-SRV-CORE', 'Server', 'Critical', '10.0.1.15', 'Security', True),
    (3, 'PAYMENT-API-GW', 'Cloud Resource', 'Critical', '10.0.2.50', 'Finance', True),
    (4, 'EDGE-FIREWALL-HQ', 'Firewall', 'Critical', '192.168.1.1', 'IT Infrastructure', True),
    (5, 'HR-PORTAL-WEB', 'Server', 'High', '10.0.4.12', 'Human Resources', True),
    (6, 'DEV-BUILD-RUNNER', 'Server', 'Medium', '10.0.3.22', 'Engineering', True),
    (7, 'FIN-WORKSTATION-08', 'Workstation', 'High', '192.168.10.45', 'Finance', True),
    (8, 'SOC-MONITOR-WS01', 'Workstation', 'Low', '192.168.20.101', 'Security Operations', True),
    (9, 'MAIL-EXCHANGE-01', 'Server', 'High', '10.0.1.30', 'IT Infrastructure', True),
    (10, 'ANALYTICS-DATALAKE', 'Cloud Resource', 'Critical', '10.0.5.88', 'Data Analytics', True)
]
for a in assets:
    cur.execute("""
        INSERT INTO assets (asset_id, asset_name, asset_type, criticality, ip_address, department, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (asset_id) DO NOTHING;
    """, a)

# 4. INCIDENT_TYPES
incident_types = [
    (1, 'Ransomware', 'Extortion software encrypting sensitive server volumes and demanding digital ransom payment.'),
    (2, 'Phishing Campaign', 'Deceptive emails impersonating executives or services designed to harvest corporate credentials.'),
    (3, 'SQL Injection', 'Malicious SQL fragments injected into API parameters to extract or manipulate backend databases.'),
    (4, 'DDoS Volumetric', 'High volume distributed network traffic flooding edge routers to disrupt business service.'),
    (5, 'Privilege Escalation', 'Attacker elevating unprivileged account permissions to root or domain administrator.'),
    (6, 'Data Exfiltration', 'Covert extraction and transmission of proprietary company IP or customer data outside boundary.'),
    (7, 'Brute Force Auth', 'Automated high frequency credential stuffing against SSH, RDP, or VPN gateways.'),
    (8, 'Zero-Day Exploit', 'Active exploitation of an unpatched software vulnerability in core enterprise stacks.')
]
for it in incident_types:
    cur.execute("""
        INSERT INTO incident_types (incident_type_id, type_name, description)
        VALUES (%s, %s, %s)
        ON CONFLICT (incident_type_id) DO NOTHING;
    """, it)

# 5. INCIDENTS
incidents = [
    (1, 1, 1, 2, 1, "Ransomware encryption detected on PROD-DB-CLUSTER-01", 
     "LockBit variant observed appending .locked extensions on /var/lib/postgresql database partition. Canary tokens tripped.", 
     "Critical", "Contained", "Critical", 95.00, "2026-02-01 02:15:00+05:30", "2026-02-01 06:30:00+05:30", None),
    (2, 2, 2, 3, 5, "Executive phishing emails harvested HR portal credentials", 
     "Targeted spear-phishing campaign posing as CEO urgent memo redirected 14 employees to spoofed SSO login clone.", 
     "High", "Investigating", "High", 72.50, "2026-02-02 09:10:00+05:30", "2026-02-02 11:45:00+05:30", None),
    (3, 3, 1, 4, 3, "Blind SQL Injection detected on Payment API endpoint", 
     "WAF logged repeated time-based blind SQLi payloads on /api/v1/checkout/transaction parameter from external IP 185.220.101.5.", 
     "Critical", "Resolved", "Critical", 88.00, "2026-02-03 14:05:00+05:30", "2026-02-03 18:20:00+05:30", "2026-02-03 18:20:00+05:30"),
    (4, 4, 2, 5, 4, "400Gbps SYN-flood volumetric DDoS attacking EDGE-FIREWALL-HQ", 
     "Upstream transit circuits saturated. BGP flowspec scrubbing initiated to mitigate multi-vector volumetric UDP/SYN flood.", 
     "High", "Resolved", "High", 76.00, "2026-02-04 18:30:00+05:30", "2026-02-04 20:15:00+05:30", "2026-02-04 20:15:00+05:30"),
    (5, 5, 3, 2, 2, "Unauthorized sudo root privilege escalation on AUTH-SRV-CORE", 
     "Local service account 'svc_backup' exploited sudo dirty_pipe CVE to spawn interactive root shell and dump /etc/shadow.", 
     "Critical", "Investigating", "Critical", 92.00, "2026-02-05 03:40:00+05:30", "2026-02-05 07:10:00+05:30", None),
    (6, 6, 4, 6, 10, "Suspicious 120GB egress transfer to offshore IP from DataLake", 
     "Anomalous midnight outbound data transfer over encrypted TLS tunnel detected from S3 analytics datalake to 45.154.255.80.", 
     "Critical", "Contained", "Critical", 91.50, "2026-02-06 01:20:00+05:30", "2026-02-06 05:40:00+05:30", None),
    (7, 7, 2, 3, 2, "Brute force password spraying against SSH gateway", 
     "Over 45,000 failed authentication attempts within 10 minutes originating from Russian and Tor exit relays.", 
     "Medium", "Resolved", "Medium", 45.00, "2026-02-07 11:00:00+05:30", "2026-02-07 12:30:00+05:30", "2026-02-07 12:30:00+05:30"),
    (8, 2, 5, 4, 7, "Macro-enabled malicious invoice opened on FIN-WORKSTATION-08", 
     "Accountant opened Word attachment containing VBA downloader that contacted known Emotet C2 staging infrastructure.", 
     "High", "Contained", "High", 68.00, "2026-02-08 10:15:00+05:30", "2026-02-08 13:00:00+05:30", None),
    (9, 8, 1, 2, 9, "Zero-Day remote code execution attempt on MAIL-EXCHANGE-01", 
     "Exploitation attempt targeting unauthenticated HTTP request smuggling in webmail frontend proxy parser.", 
     "Critical", "Investigating", "Critical", 89.00, "2026-02-09 16:45:00+05:30", "2026-02-09 19:00:00+05:30", None),
    (10, 3, 3, 5, 5, "Error-based SQL injection on HR feedback portal", 
     "Single unauthorized user submitted quotes inside suggestion box, disclosing internal PostgreSQL schema table names.", 
     "Low", "Resolved", "Low", 22.00, "2026-02-10 09:00:00+05:30", "2026-02-10 10:15:00+05:30", "2026-02-10 10:15:00+05:30"),
    (11, 7, 4, None, 4, "Automated credential stuffing attempts on customer portal", 
     "Distributed botnet cycling breached credential dumps against web customer login portal.", 
     "Medium", "New", "Medium", 48.00, "2026-02-11 14:00:00+05:30", "2026-02-11 14:00:00+05:30", None),
    (12, 2, 5, None, 9, "Suspicious phishing report from Sales team regarding IT upgrade", 
     "Broadcast email claimed urgent password reset needed before IT hardware maintenance window.", 
     "Medium", "New", "Medium", 35.00, "2026-02-12 08:30:00+05:30", "2026-02-12 08:30:00+05:30", None),
    (13, 6, 2, 3, 1, "Database snapshot backup downloaded to unauthorized personal drive", 
     "Database engineer created unencrypted local backup dump and uploaded it to personal Google Drive repository.", 
     "High", "Resolved", "High", 65.00, "2026-02-13 13:20:00+05:30", "2026-02-13 17:50:00+05:30", "2026-02-13 17:50:00+05:30"),
    (14, 4, 3, None, 4, "Spike in UDP port 53 DNS amplification traffic", 
     "DNS recursive query reflection detected by netflow collector targeting secondary edge router VIP.", 
     "Low", "False Positive", "Low", 15.00, "2026-02-14 11:10:00+05:30", "2026-02-14 11:50:00+05:30", "2026-02-14 11:50:00+05:30"),
    (15, 5, 1, 6, 6, "Developer workstation running suspicious container with host root mount", 
     "Container runtime security agent alerted on Docker container executing with privileged flag and / host root mounted.", 
     "Medium", "Investigating", "Medium", 52.00, "2026-02-15 15:40:00+05:30", "2026-02-15 16:30:00+05:30", None)
]

for inc in incidents:
    cur.execute("""
        INSERT INTO incidents (incident_id, incident_type_id, reported_by, assigned_to, asset_id, title, description, severity, status, priority, risk_score, reported_at, updated_at, resolved_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (incident_id) DO NOTHING;
    """, inc)

conn.commit()
print("Inserted 15 incidents into PostgreSQL!")

# 6. GENERATE REAL 384-DIMENSIONAL EMBEDDINGS AND INSERT INTO incident_embeddings
print("Generating 384-dimensional dense vectors using all-MiniLM-L6-v2...")
for inc in incidents:
    inc_id = inc[0]
    title = inc[5]
    desc = inc[6]
    text_to_embed = f"{title}. {desc}"
    
    # Generate 384-dim embedding
    vector = model.encode(text_to_embed).tolist()
    
    cur.execute("""
        INSERT INTO incident_embeddings (embedding_id, incident_id, embedding, model_name, created_at)
        VALUES (%s, %s, %s, 'all-MiniLM-L6-v2', CURRENT_TIMESTAMP)
        ON CONFLICT (embedding_id) DO UPDATE SET embedding = EXCLUDED.embedding;
    """, (inc_id, inc_id, vector))

conn.commit()
print("Successfully inserted 15 dense 384-dim vectors into 'incident_embeddings' table!")

# 7. RUN TEST SEMANTIC SIMILARITY SEARCH QUERY
query_text = "Stolen employee corporate login passwords via deceptive site"
print(f"\n--- Testing Semantic Vector Search for: '{query_text}' ---")
query_vector = model.encode(query_text).tolist()

cur.execute("""
    SELECT 
        i.incident_id,
        i.title,
        i.severity,
        i.status,
        ROUND((1 - (ie.embedding <=> %s::vector))::numeric * 100, 2) AS similarity_percent
    FROM incident_embeddings ie
    JOIN incidents i ON ie.incident_id = i.incident_id
    ORDER BY ie.embedding <=> %s::vector
    LIMIT 3;
""", (query_vector, query_vector))

rows = cur.fetchall()
print("Top 3 Semantically Correlated Incidents:")
for r in rows:
    print(f"  [ID: {r[0]}] {r[1]} | Severity: {r[2]} | Status: {r[3]} | Similarity: {r[4]}%")

cur.close()
conn.close()

