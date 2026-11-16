const { execFile } = require('child_process');
const path = require('path');

const PYTHON_PATH = 'python';
const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'vector_cli.py');
const VECTOR_SERVER_URL = 'http://127.0.0.1:5001';

/**
 * Perform semantic or hybrid search.
 * Fast Path: Queries the in-memory vector daemon (<50ms).
 * Fallback Path: Spawns the python CLI script.
 */
async function searchSemantic(query, options = {}) {
  // Fast Path: Check if background in-memory vector server is running
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${VECTOR_SERVER_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        top_k: options.topK || 5,
        severity: options.severity,
        status: options.status,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (err) {
    // In-memory daemon offline, falling back to CLI execution
  }

  // Fallback Path: Direct CLI bridge
  return searchSemanticCLI(query, options);
}

function searchSemanticCLI(query, options = {}) {
  return new Promise((resolve, reject) => {
    const args = [
      SCRIPT_PATH,
      'search',
      '--query', query,
      '--top-k', String(options.topK || 5),
    ];

    if (options.severity) {
      args.push('--severity', options.severity);
    }
    if (options.status) {
      args.push('--status', options.status);
    }

    execFile(PYTHON_PATH, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Vector search CLI error:', stderr);
        return reject(new Error(stderr || error.message));
      }
      try {
        const lines = stdout.trim().split('\n');
        const jsonLine = lines.reverse().find(l => l.trim().startsWith('{'));
        if (!jsonLine) throw new Error('No JSON output returned from vector CLI');
        const parsed = JSON.parse(jsonLine);
        resolve(parsed.results || []);
      } catch (parseErr) {
        reject(new Error(`Failed to parse vector CLI output: ${stdout}`));
      }
    });
  });
}

/**
 * Generate embedding for newly created incident in background.
 */
async function embedIncident(incidentId, text) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${VECTOR_SERVER_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: incidentId, text }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data.embedding_id;
    }
  } catch (err) {}

  return embedIncidentCLI(incidentId, text);
}

function embedIncidentCLI(incidentId, text) {
  return new Promise((resolve, reject) => {
    const args = [
      SCRIPT_PATH,
      'embed',
      '--incident-id', String(incidentId),
      '--text', text,
    ];

    execFile(PYTHON_PATH, args, (error, stdout, stderr) => {
      if (error) {
        console.error('Embed incident error:', stderr);
        return reject(new Error(stderr || error.message));
      }
      try {
        const lines = stdout.trim().split('\n');
        const jsonLine = lines.reverse().find(l => l.trim().startsWith('{'));
        const parsed = JSON.parse(jsonLine);
        resolve(parsed.embedding_id);
      } catch (e) {
        resolve(null);
      }
    });
  });
}

module.exports = {
  searchSemantic,
  embedIncident,
};
