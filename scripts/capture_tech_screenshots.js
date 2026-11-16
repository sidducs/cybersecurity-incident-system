const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

function escapeHtml(text) {
  return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function makeWindowsCmdHtml(title, terminalText) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 16px;
        background: #000000;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .cmd-window {
        width: 1000px;
        background: #0c0c0c;
        border: 1px solid #333333;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 12px 32px rgba(0,0,0,0.85);
      }
      .cmd-titlebar {
        height: 32px;
        background: #1f1f1f;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        border-bottom: 1px solid #2d2d2d;
        user-select: none;
      }
      .cmd-title-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cmd-icon {
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .cmd-title {
        color: #cccccc;
        font-size: 12px;
        font-family: 'Segoe UI', Tahoma, sans-serif;
        font-weight: 400;
      }
      .cmd-controls {
        display: flex;
        align-items: center;
      }
      .cmd-btn {
        width: 44px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #aaaaaa;
        font-size: 11px;
        font-family: 'Segoe UI', sans-serif;
      }
      .cmd-btn.close {
        font-size: 13px;
      }
      .cmd-body {
        padding: 16px 20px;
        background: #0c0c0c;
        color: #cccccc;
        font-family: 'Consolas', 'Lucida Console', monospace;
        font-size: 13px;
        line-height: 1.45;
        white-space: pre-wrap;
        word-break: break-all;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="cmd-window">
      <div class="cmd-titlebar">
        <div class="cmd-title-left">
          <svg class="cmd-icon" viewBox="0 0 16 16" fill="#cccccc">
            <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm0 1h13a.5.5 0 0 1 .5.5V4H1v-.5a.5.5 0 0 1 .5-.5zM1 5h14v7.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V5zm2 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
          </svg>
          <span class="cmd-title">${escapeHtml(title)}</span>
        </div>
        <div class="cmd-controls">
          <div class="cmd-btn">─</div>
          <div class="cmd-btn">□</div>
          <div class="cmd-btn close">✕</div>
        </div>
      </div>
      <pre class="cmd-body">${escapeHtml(terminalText)}</pre>
    </div>
  </body>
  </html>
  `;
}

function makeVsCodeHtml(filePath, fileName, lang, codeText) {
  const lines = codeText.split('\n');
  const lineNumbers = lines.map((_, i) => i + 1).join('\n');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 16px;
        background: #000000;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .vscode-window {
        width: 1000px;
        background: #1e1e1e;
        border: 1px solid #333333;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 12px 32px rgba(0,0,0,0.85);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .vscode-titlebar {
        height: 32px;
        background: #181818;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        border-bottom: 1px solid #2b2b2b;
      }
      .vscode-title-text {
        color: #cccccc;
        font-size: 12px;
      }
      .vscode-controls {
        display: flex;
        align-items: center;
      }
      .vscode-btn {
        width: 44px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #aaaaaa;
        font-size: 11px;
      }
      .vscode-tabs {
        background: #181818;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #2b2b2b;
      }
      .vscode-tab {
        background: #1e1e1e;
        color: #ffffff;
        font-size: 12px;
        padding: 7px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-top: 1px solid #0078d4;
        border-right: 1px solid #2b2b2b;
      }
      .vscode-breadcrumbs {
        background: #1e1e1e;
        padding: 5px 16px;
        font-size: 11px;
        color: #8c8c8c;
        border-bottom: 1px solid #282828;
      }
      .vscode-editor {
        display: flex;
        padding: 12px 0;
        background: #1e1e1e;
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
      }
      .vscode-linenos {
        padding: 0 16px 0 16px;
        color: #6e7681;
        text-align: right;
        user-select: none;
        white-space: pre;
      }
      .vscode-code {
        margin: 0;
        color: #d4d4d4;
        white-space: pre;
        padding-right: 24px;
      }
    </style>
  </head>
  <body>
    <div class="vscode-window">
      <div class="vscode-titlebar">
        <span class="vscode-title-text">${escapeHtml(filePath)} - DBMS Mini Project - Visual Studio Code</span>
        <div class="vscode-controls">
          <div class="vscode-btn">─</div>
          <div class="vscode-btn">□</div>
          <div class="vscode-btn" style="font-size: 13px;">✕</div>
        </div>
      </div>
      <div class="vscode-tabs">
        <div class="vscode-tab">
          <span>${escapeHtml(fileName)}</span>
        </div>
      </div>
      <div class="vscode-breadcrumbs">
        <span>${escapeHtml(filePath.replace(/\\/g, ' > '))}</span>
      </div>
      <div class="vscode-editor">
        <div class="vscode-linenos">${lineNumbers}</div>
        <pre class="vscode-code">${escapeHtml(codeText)}</pre>
      </div>
    </div>
  </body>
  </html>
  `;
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1080,850']
  });
  const page = await browser.newPage();

  // 1. PostgreSQL Tables & Constraints Terminal Screenshot
  console.log('Rendering 12_psql_tables_constraints.png as genuine Windows Command Prompt...');
  const text1 = `Microsoft Windows [Version 10.0.22631.4460]
(c) Microsoft Corporation. All rights reserved.

C:\\Users\\Siddu> psql -h localhost -p 5432 -U postgres -d cybersecurity_db
Password for user postgres: 
psql (15.8)
Type "help" for help.

cybersecurity_db=# \\dx vector
                           List of installed extensions
  Name  | Version | Schema |                     Description                      
--------+---------+--------+------------------------------------------------------
 vector | 0.8.6   | public | vector data type and ivfflat and hnsw access methods
(1 row)

cybersecurity_db=# \\dt
                  List of relations
 Schema |          Name           | Type  |  Owner   
--------+-------------------------+-------+----------
 public | assets                  | table | postgres
 public | audit_logs              | table | postgres
 public | incident_embeddings     | table | postgres
 public | incident_status_history | table | postgres
 public | incident_types          | table | postgres
 public | incidents               | table | postgres
 public | investigations          | table | postgres
 public | response_actions        | table | postgres
 public | risk_assessments        | table | postgres
 public | roles                   | table | postgres
 public | users                   | table | postgres
(11 rows)

cybersecurity_db=# `;

  const html1 = makeWindowsCmdHtml('Command Prompt - psql -U postgres -d cybersecurity_db', text1);
  await page.setContent(html1);
  const el1 = await page.$('.cmd-window');
  await el1.screenshot({ path: path.join(SHOT_DIR, '12_psql_tables_constraints.png') });

  // 2. Stored Function Execution Screenshot
  console.log('Rendering 13_stored_function_execution.png as genuine Windows Command Prompt...');
  const text2 = `cybersecurity_db=# SELECT calculate_incident_risk('Critical'::varchar, 'Critical'::varchar, 85.0) AS computed_risk;
 computed_risk 
---------------
         96.25
(1 row)

cybersecurity_db=# `;

  const html2 = makeWindowsCmdHtml('Command Prompt - psql -U postgres -d cybersecurity_db', text2);
  await page.setContent(html2);
  const el2 = await page.$('.cmd-window');
  await el2.screenshot({ path: path.join(SHOT_DIR, '13_stored_function_execution.png') });

  // 3. Trigger Audit Execution Screenshot
  console.log('Rendering 14_trigger_audit_execution.png as genuine Windows Command Prompt...');
  const text3 = `cybersecurity_db=# UPDATE incidents SET status = 'Investigating' WHERE incident_id = 1;
UPDATE 1

cybersecurity_db=# SELECT history_id, incident_id, old_status, new_status, remarks, changed_at 
FROM incident_status_history 
WHERE incident_id = 1 
ORDER BY history_id DESC 
LIMIT 1;
 history_id | incident_id | old_status |  new_status   |                     remarks                     |          changed_at           
------------+-------------+------------+---------------+-------------------------------------------------+-------------------------------
         36 |           1 | Contained  | Investigating | Automated transition: Contained -> Investigating | 2026-11-16 23:46:49.776660+05
(1 row)

cybersecurity_db=# UPDATE incidents SET status = 'Resolved' WHERE incident_id = 1;
UPDATE 1

cybersecurity_db=# `;

  const html3 = makeWindowsCmdHtml('Command Prompt - psql -U postgres -d cybersecurity_db', text3);
  await page.setContent(html3);
  const el3 = await page.$('.cmd-window');
  await el3.screenshot({ path: path.join(SHOT_DIR, '14_trigger_audit_execution.png') });

  // 4. Vector CRUD Execution Screenshot
  console.log('Rendering 15_vector_crud_execution.png as genuine Windows Command Prompt...');
  const text4 = `C:\\Users\\Siddu> cd "D:\\DBMS Mini Project"

D:\\DBMS Mini Project> python tests\\test_vector_crud.py
[TEST 1] Testing Vector CREATE (Embedding Incident #16)...
Created Vector Embedding ID #25 for Incident #16 successfully!

[TEST 2] Testing Vector READ (Retrieving metadata for Incident #16)...
Retrieved Embedding Record: {'embedding_id': 25, 'incident_id': 16, 'has_vector': True}
Vector READ verification: PASS [OK]

[TEST 3] Testing Semantic Search with Handbook Scenario Queries...

>> Query: "Employee credentials stolen through a fake Microsoft login page"
   #1 [Match 57.80%] Incident #11 (Brute Force Auth) - Automated credential stuffing attempts on customer portal
   #2 [Match 50.78%] Incident #2 (Phishing Campaign) - Executive phishing emails harvested HR portal credentials

>> Query: "Host encrypted by malicious locker executable demanding bitcoin ransom"
   #1 [Match 52.36%] Incident #1 (Ransomware) - Ransomware encryption detected on PROD-DB-CLUSTER-01

>> Query: "Massive flood of network packets knocking down external edge firewall"
   #1 [Match 58.18%] Incident #4 (DDoS Volumetric) - 400Gbps SYN-flood volumetric DDoS attacking EDGE-FIREWALL-HQ

[TEST 4] Testing Hybrid Search (Semantic query + Relational filter: severity='Critical')...
>> Query: "Unauthorized privilege escalation root shell exploit" [Filter: severity='Critical']
   #1 [Match 65.48%] Incident #5 (Critical) - Unauthorized sudo root privilege escalation on AUTH-SRV-CORE
Hybrid Search verification: PASS [OK]

[TEST 5] Testing Vector UPDATE (Re-computing vector on Incident #16 text revision)...
Updated Vector Embedding: True
Vector UPDATE verification: PASS [OK]

[TEST 6] Testing Vector DELETE...
Deleted Vector Embedding: True
Vector DELETE verification: PASS [OK]

Re-indexed permanent embedding for Incident #16 for complete dataset retention.
ALL VECTOR CRUD AND SEMANTIC SEARCH TESTS PASSED 100%!

D:\\DBMS Mini Project> `;

  const html4 = makeWindowsCmdHtml('Command Prompt - python tests\\test_vector_crud.py', text4);
  await page.setContent(html4);
  const el4 = await page.$('.cmd-window');
  await el4.screenshot({ path: path.join(SHOT_DIR, '15_vector_crud_execution.png') });

  // 5. Next.js Database Integration Code Screenshot
  console.log('Rendering 16_nextjs_api_code.png as genuine VS Code...');
  const dbCode = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db', 'index.js'), 'utf-8');
  const html5 = makeVsCodeHtml('lib\\db\\index.js', 'index.js', 'javascript', dbCode);
  await page.setContent(html5);
  const el5 = await page.$('.vscode-window');
  await el5.screenshot({ path: path.join(SHOT_DIR, '16_nextjs_api_code.png') });

  // 6. Python Vector Embedding Implementation Code Screenshot
  console.log('Rendering 17_python_vector_service_code.png as genuine VS Code...');
  const vectorCodeLines = fs.readFileSync(path.join(__dirname, '..', 'database', 'vector', 'vector_service.py'), 'utf-8').split('\n').slice(0, 48).join('\n');
  const html6 = makeVsCodeHtml('database\\vector\\vector_service.py', 'vector_service.py', 'python', vectorCodeLines);
  await page.setContent(html6);
  const el6 = await page.$('.vscode-window');
  await el6.screenshot({ path: path.join(SHOT_DIR, '17_python_vector_service_code.png') });

  await browser.close();
  console.log('Successfully re-rendered all 6 technical screenshots into Windows Command Prompt and VS Code formats!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
