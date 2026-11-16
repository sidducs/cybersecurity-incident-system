const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function capture() {
  console.log('Launching Chrome for genuine UI screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,820']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 820 });

  // 1. Login Page
  console.log('1. Capturing Login Page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SHOT_DIR, '01_login_page.png') });

  // Log in as Administrator
  console.log('Logging in as Admin (admin / admin)...');
  await page.type('input[type="text"]', 'admin');
  await page.type('input[type="password"]', 'admin');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  await sleep(2000);

  // 2. Administrator Dashboard
  console.log('2. Capturing Admin Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '02_admin_dashboard.png') });

  // 3. Incident Listing
  console.log('3. Capturing Incident Listing...');
  await page.goto('http://localhost:3000/incidents', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '04_incidents_list.png') });

  // 4. New Incident Form
  console.log('4. Capturing New Incident Creation Form...');
  await page.goto('http://localhost:3000/incidents/new', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '05_new_incident_form.png') });

  // 5. Incident Details
  console.log('5. Capturing Incident Details & Investigation View...');
  await page.goto('http://localhost:3000/incidents/1', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '06_incident_details.png') });

  // 6. AI Semantic Search with Actual Results
  console.log('6. Capturing AI Semantic Vector Search...');
  await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle0' });
  await sleep(1000);
  // Enter search text and execute
  const searchInput = await page.$('input[type="text"]');
  if (searchInput) {
    await searchInput.type('unauthorized database dump and exfiltration');
    const searchBtn = await page.$('button[type="submit"]');
    if (searchBtn) {
      await searchBtn.click();
      await sleep(2500); // wait for embedding model and pgvector search
    }
  }
  await page.screenshot({ path: path.join(SHOT_DIR, '07_semantic_search.png') });

  // 7. Reports Page
  console.log('7. Capturing Caseload & Analytical Reports Page...');
  await page.goto('http://localhost:3000/reports', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '08_reports_page.png') });

  // 8. Admin Hierarchy Page
  console.log('8. Capturing Recursive CTE Admin Hierarchy Page...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '09_admin_hierarchy.png') });

  // 9. Security Analyst Dashboard
  console.log('9. Capturing Security Analyst Dashboard...');
  // Log out and log in as analyst
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="text"]', 'analyst');
  await page.type('input[type="password"]', 'analyst');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  await sleep(1500);
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '03_analyst_dashboard.png') });

  await browser.close();
  console.log('Successfully captured all 9 genuine application screenshots in docs/screenshots/!');
}

capture().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
