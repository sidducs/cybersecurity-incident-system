const { execFile } = require('child_process');
const path = require('path');

const PYTHON_PATH = 'python';
const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'vector_cli.py');

/**
 * Perform semantic or hybrid search via Python CLI bridge.
 */
function searchSemantic(query, options = {}) {
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
        // Find json line in stdout (in case python prints warnings)
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
function embedIncident(incidentId, text) {
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

