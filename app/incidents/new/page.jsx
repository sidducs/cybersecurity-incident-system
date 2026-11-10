'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  AlertTriangle, Shield, Calculator, ArrowLeft, Check, AlertCircle, Cpu, Zap 
} from 'lucide-react';

const INCIDENT_TYPES = [
  { id: 1, name: 'Phishing Campaign' },
  { id: 2, name: 'Ransomware Outbreak' },
  { id: 3, name: 'SQL Injection' },
  { id: 4, name: 'DDoS Volumetric' },
  { id: 5, name: 'Privilege Escalation' },
  { id: 6, name: 'Data Exfiltration' },
  { id: 7, name: 'Brute Force Auth' },
  { id: 8, name: 'Zero-Day Exploit' },
];

const ASSETS = [
  { id: 1, name: 'PROD-DB-CLUSTER-01 (Database)', criticality: 'Critical' },
  { id: 2, name: 'AUTH-SRV-CORE (Server)', criticality: 'Critical' },
  { id: 3, name: 'PAYMENT-GATEWAY-API (API)', criticality: 'Critical' },
  { id: 4, name: 'EDGE-FIREWALL-HQ (Firewall)', criticality: 'Critical' },
  { id: 5, name: 'HR-PORTAL-WEB (Web App)', criticality: 'High' },
  { id: 6, name: 'DEV-K8S-CLUSTER (Cluster)', criticality: 'Medium' },
  { id: 7, name: 'FIN-WORKSTATION-08 (Endpoint)', criticality: 'High' },
  { id: 8, name: 'CORP-VPN-CONCENTRATOR (VPN)', criticality: 'High' },
  { id: 9, name: 'MAIL-EXCHANGE-01 (Mail Server)', criticality: 'High' },
  { id: 10, name: 'ANALYTICS-DATALAKE (Cloud Storage)', criticality: 'Critical' },
];

export default function NewIncidentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeId, setTypeId] = useState('1');
  const [assetId, setAssetId] = useState('1');
  const [severity, setSeverity] = useState('High');
  const [impactScore, setImpactScore] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Client-side real-time preview of PostgreSQL stored function calculate_incident_risk
  const calculatePreviewScore = () => {
    const sevWeight = { Critical: 100, High: 75, Medium: 50, Low: 25 }[severity] || 25;
    const selectedAsset = ASSETS.find((a) => a.id === parseInt(assetId, 10));
    const assetCrit = selectedAsset ? selectedAsset.criticality : 'Medium';
    const astWeight = { Critical: 100, High: 75, Medium: 50, Low: 25 }[assetCrit] || 25;

    const risk = sevWeight * 0.4 + astWeight * 0.35 + impactScore * 0.25;
    return Math.round(risk * 100) / 100;
  };

  const previewScore = calculatePreviewScore();
  let previewLevel = 'LOW';
  let previewBadge = 'cyber-badge-low';
  if (previewScore >= 76) {
    previewLevel = 'CRITICAL';
    previewBadge = 'cyber-badge-critical';
  } else if (previewScore >= 51) {
    previewLevel = 'HIGH';
    previewBadge = 'cyber-badge-high';
  } else if (previewScore >= 26) {
    previewLevel = 'MEDIUM';
    previewBadge = 'cyber-badge-medium';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          incident_type_id: parseInt(typeId, 10),
          asset_id: parseInt(assetId, 10),
          severity,
          impact_score: parseFloat(impactScore),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (data.errors && data.errors.join(', ')) || 'Failed to create incident');
      }

      router.push(`/incidents/${data.incidentId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/incidents"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incident Directory</span>
        </Link>
      </div>

      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyan-400" />
          <span>Log & Ingest Security Incident</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Executes Stored Risk Calculation Engine & Generates 384-d Dense Semantic Vector in pgvector
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="cyber-card p-6 lg:col-span-2 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Incident Alert Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cobalt Strike beacon activity detected on DMZ proxy"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Attack Taxonomy Classification *
              </label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Targeted Organizational IT Asset *
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {ASSETS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Declared Threat Severity *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Business Operational Impact Score</span>
                <span className="font-mono text-cyan-400">{impactScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={impactScore}
                onChange={(e) => setImpactScore(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Forensic Narrative / Sensor Evidence *
            </label>
            <p className="text-[11px] text-slate-500 font-mono mb-1.5">
              This narrative will be vectorized via all-MiniLM-L6-v2 into a 384-dimensional dense vector for semantic correlation.
            </p>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the anomalous indicators of compromise (IoC), source IP, malware hash, affected subnets, or forensic timeline..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/60 disabled:opacity-50"
          >
            {loading ? 'Executing PL/pgSQL Function & Indexing Vector...' : 'Ingest Incident & Generate Vector Embedding'}
            <Zap className="w-4 h-4" />
          </button>
        </form>

        {/* Live Stored Function Risk Calculation Preview Panel */}
        <div className="cyber-card p-6 space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Database Function Preview</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              calculate_incident_risk(sev, asset, impact)
            </p>
          </div>

          <div className="text-center p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-mono text-slate-400">Predicted Composite Risk</div>
            <div className="text-4xl font-extrabold text-slate-100 font-mono">{previewScore}</div>
            <div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${previewBadge}`}>
                {previewLevel}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>Severity Weight (40%):</span>
              <span className="text-slate-200">{severity}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>Asset Weight (35%):</span>
              <span className="text-slate-200">
                {ASSETS.find((a) => a.id === parseInt(assetId, 10))?.criticality}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>Impact Weight (25%):</span>
              <span className="text-slate-200">{impactScore} pts</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              Dual-Paradigm Action
            </div>
            Upon commit, the relational record is stored with calculated risk, and a 384-dimensional vector embedding is generated and indexed via HNSW in pgvector.
          </div>
        </div>
      </div>
    </div>
  );
}

