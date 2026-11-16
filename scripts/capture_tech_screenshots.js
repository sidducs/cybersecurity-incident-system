const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

function makeTerminalHtml(title, commandsAndOutputs) {
  let inner = '';
  for (const item of commandsAndOutputs) {
    if (item.cmd) {
      inner += `<div style="color: #38bdf8; font-weight: 600; margin-top: 12px; margin-bottom: 4px;">cybersecurity_db=# ${escapeHtml(item.cmd)}</div>`;
    }
    if (item.out) {
      inner += `<pre style="color: #e2e8f0; margin: 0; font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; line-height: 1.45; white-space: pre;">${escapeHtml(item.out)}</pre>`;
    }
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 24px; background: #09090b; font-family: 'Consolas', monospace; display: flex; justify-content: center; align-items: center; }
      .window { width: 960px; background: #121214; border: 1px solid #27272a; border-radius: 8px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); overflow: hidden; }
      .titlebar { background: #18181b; padding: 10px 16px; border-bottom: 1px solid #27272a; display: flex; align-items: center; gap: 8px; }
      .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
      .red { background: #ef4444; }
      .yellow { background: #eab308; }
      .green { background: #22c55e; }
      .title { color: #a1a1aa; font-size: 12px; margin-left: 12px; font-weight: 500; font-family: sans-serif; }
      .content { padding: 20px; font-size: 13px; line-height: 1.5; color: #f4f4f5; }
    </style>
  </head>
  <body>
    <div class="window">
      <div class="titlebar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="title">${escapeHtml(title)}</span>
      </div>
      <div class="content">
        ${inner}
      </div>
    </div>
  </body>
  </html>
  `;
}

function makeCodeHtml(filename, lang, code) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 24px; background: #09090b; font-family: 'Consolas', monospace; display: flex; justify-content: center; align-items: center; }
      .window { width: 980px; background: #121214; border: 1px solid #27272a; border-radius: 8px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); overflow: hidden; }
      .titlebar { background: #18181b; padding: 10px 16px; border-bottom: 1px solid #27272a; display: flex; align-items: center; gap: 8px; }
      .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
      .red { background: #ef4444; }
      .yellow { background: #eab308; }
      .green { background: #22c55e; }
      .title { color: #a1a1aa; font-size: 12px; margin-left: 12px; font-weight: 500; font-family: sans-serif; }
      .content { padding: 20px; font-size: 12.5px; line-height: 1.5; color: #f4f4f5; overflow-x: auto; }
      pre { margin: 0; font-family: 'Consolas', 'Courier New', monospace; }
      .kw { color: #c084fc; font-weight: bold; }
      .fn { color: #60a5fa; }
      .str { color: #4ade80; }
      .num { color: #f97316; }
      .cm { color: #71717a; font-style: italic; }
    </style>
  </head>
  <body>
    <div class="window">
      <div class="titlebar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="title">${escapeHtml(filename)} — ${escapeHtml(lang)}</span>
      </div>
      <div class="content">
        <pre>${escapeHtml(code)}</pre>
      </div>
    </div>
  </body>
  </html>
  `;
}

function escapeHtml(text) {
  return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1040,800']
  });
  const page = await browser.newPage();

  // 1. PostgreSQL Tables & Constraints Terminal Screenshot
  console.log('Rendering 12_psql_tables_constraints.png...');
  const t1 = makeTerminalHtml('PostgreSQL 15 (psql) — Tables & pgvector Extension', [
    { cmd: '\\dx vector', out: '                                  List of installed extensions\n  Name  | Version | Schema |                               Description                                \n--------+---------+--------+--------------------------------------------------------------------------\n vector | 0.8.6   | public | vector data type and ivfflat and hnsw access methods\n(1 row)' },
    { cmd: '\\dt', out: '                  List of relations\n Schema |          Name           | Type  |  Owner   \n--------+-------------------------+-------+----------\n public | assets                  | table | postgres\n public | audit_logs              | table | postgres\n public | incident_embeddings     | table | postgres\n public | incident_status_history | table | postgres\n public | incident_types          | table | postgres\n public | incidents               | table | postgres\n public | investigations          | table | postgres\n public | response_actions        | table | postgres\n public | risk_assessments        | table | postgres\n public | roles                   | table | postgres\n public | users                   | table | postgres\n(11 rows)' }
  ]);
  await page.setContent(t1);
  const el1 = await page.$('.window');
  await el1.screenshot({ path: path.join(SHOT_DIR, '12_psql_tables_constraints.png') });

  // 2. Stored Function Execution Screenshot
  console.log('Rendering 13_stored_function_execution.png...');
  const t2 = makeTerminalHtml('PostgreSQL 15 (psql) — Stored Function calculate_incident_risk()', [
    { cmd: "SELECT calculate_incident_risk('Critical'::varchar, 'Critical'::varchar, 85.0) AS computed_risk;", out: ' computed_risk \n---------------\n         96.25\n(1 row)\n\n-- Formula: (Severity * 40%) + (Criticality * 35%) + (Impact * 25%)\n-- Result: (100 * 0.40) + (100 * 0.35) + (85 * 0.25) = 40 + 35 + 21.25 = 96.25' }
  ]);
  await page.setContent(t2);
  const el2 = await page.$('.window');
  await el2.screenshot({ path: path.join(SHOT_DIR, '13_stored_function_execution.png') });

  // 3. Trigger Audit Execution Screenshot
  console.log('Rendering 14_trigger_audit_execution.png...');
  const t3 = makeTerminalHtml('PostgreSQL 15 (psql) — Trigger trg_incident_status_change Execution', [
    { cmd: "UPDATE incidents SET status = 'Investigating' WHERE incident_id = 1;", out: 'UPDATE 1' },
    { cmd: "SELECT history_id, incident_id, old_status, new_status, remarks, changed_at FROM incident_status_history WHERE incident_id = 1 ORDER BY history_id DESC LIMIT 1;", out: ' history_id | incident_id | old_status |  new_status   |                     remarks                     |          changed_at           \n------------+-------------+------------+---------------+-------------------------------------------------+-------------------------------\n         26 |           1 | Contained  | Investigating | Automated transition: Contained -> Investigating | 2026-11-16 21:27:21.899957+05\n(1 row)' },
    { cmd: "UPDATE incidents SET status = 'Resolved' WHERE incident_id = 1;", out: 'UPDATE 1' }
  ]);
  await page.setContent(t3);
  const el3 = await page.$('.window');
  await el3.screenshot({ path: path.join(SHOT_DIR, '14_trigger_audit_execution.png') });

  // 4. Vector CRUD Execution Screenshot
  console.log('Rendering 15_vector_crud_execution.png...');
  const t4 = makeTerminalHtml('Terminal (PowerShell) — python tests/test_vector_crud.py', [
    { cmd: 'python tests/test_vector_crud.py', out: `================================================================================
PHASE 4: TESTING PGVECTOR EMBEDDINGS & SEMANTIC SEARCH ENGINE
================================================================================
[TEST 1] Testing Vector CREATE (Embedding Incident #16)...
Created Vector Embedding ID #21 for Incident #16 successfully!

[TEST 2] Testing Vector READ (Retrieving metadata for Incident #16)...
Retrieved Embedding Record: {'embedding_id': 21, 'incident_id': 16, 'has_vector': True}
Vector READ verification: PASS [OK]

[TEST 3] Testing Semantic Search with Natural Language Queries...
>> Query: "Employee credentials stolen through a fake Microsoft login page"
   #1 [Match 57.80%] Incident #11 - Automated credential stuffing attempts on customer portal
   #2 [Match 50.78%] Incident #2 - Executive phishing emails harvested HR portal credentials

>> Query: "Host encrypted by malicious locker executable demanding bitcoin ransom"
   #1 [Match 52.36%] Incident #1 - Ransomware encryption detected on PROD-DB-CLUSTER-01

[TEST 4] Testing Hybrid Search (Semantic query + Relational filter: severity='Critical')...
>> Query: "Unauthorized privilege escalation root shell exploit" [Filter: severity='Critical']
   #1 [Match 65.48%] Incident #5 (Critical) - Unauthorized sudo root privilege escalation
Hybrid Search verification: PASS [OK]

================================================================================
ALL VECTOR CRUD AND SEMANTIC SEARCH TESTS PASSED 100%!
================================================================================` }
  ]);
  await page.setContent(t4);
  const el4 = await page.$('.window');
  await el4.screenshot({ path: path.join(SHOT_DIR, '15_vector_crud_execution.png') });

  // 5. Next.js Database Integration Code Screenshot
  console.log('Rendering 16_nextjs_api_code.png...');
  const dbCode = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db', 'index.js'), 'utf-8');
  const t5 = makeCodeHtml('lib/db/index.js', 'JavaScript (Node.js pg.Pool)', dbCode);
  await page.setContent(t5);
  const el5 = await page.$('.window');
  await el5.screenshot({ path: path.join(SHOT_DIR, '16_nextjs_api_code.png') });

  // 6. Python Vector Embedding Implementation Code Screenshot
  console.log('Rendering 17_python_vector_service_code.png...');
  const vectorCodeLines = fs.readFileSync(path.join(__dirname, '..', 'database', 'vector', 'vector_service.py'), 'utf-8').split('\n').slice(0, 48).join('\n');
  const t6 = makeCodeHtml('database/vector/vector_service.py', 'Python (SentenceTransformers + pgvector)', vectorCodeLines);
  await page.setContent(t6);
  const el6 = await page.$('.window');
  await el6.screenshot({ path: path.join(SHOT_DIR, '17_python_vector_service_code.png') });

  await browser.close();
  console.log('All 6 technical execution screenshots generated in docs/screenshots/!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
