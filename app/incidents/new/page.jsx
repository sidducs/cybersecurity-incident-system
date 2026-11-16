'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

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

  // Client-side preview of stored function calculate_incident_risk
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
  let previewBadge = 'badge-low';
  if (previewScore >= 76) {
    previewLevel = 'CRITICAL';
    previewBadge = 'badge-critical';
  } else if (previewScore >= 51) {
    previewLevel = 'HIGH';
    previewBadge = 'badge-high';
  } else if (previewScore >= 26) {
    previewLevel = 'MEDIUM';
    previewBadge = 'badge-medium';
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
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Back button */}
      <div>
        <Link
          href="/incidents"
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incidents</span>
        </Link>
      </div>

      <div className="pb-2 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">Log Security Incident</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Submit a new security incident report</p>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="clean-card p-5 lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Incident Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Abnormal login spike from unrecognized subnet"
              className="w-full px-3 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Classification *</label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-white"
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Target Asset *</label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-white"
              >
                {ASSETS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Severity *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-white"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium text-zinc-300 mb-1">
                <span>Impact Score</span>
                <span className="font-mono text-white">{impactScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={impactScore}
                onChange={(e) => setImpactScore(parseInt(e.target.value, 10))}
                className="w-full accent-white mt-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Incident Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the observed indicators of compromise, source IPs, affected accounts or systems..."
              className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting Incident...' : 'Save Incident'}
          </button>
        </form>

        {/* Risk Score Calculation Preview */}
        <div className="clean-card p-5 space-y-4">
          <div className="pb-2 border-b border-zinc-800">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wide">
              Risk Score Calculation
            </h2>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              calculate_incident_risk(severity, asset, impact)
            </div>
          </div>

          <div className="text-center p-4 rounded bg-black border border-zinc-800 space-y-1">
            <div className="text-[10px] text-zinc-400 uppercase">Calculated Risk</div>
            <div className="text-3xl font-bold font-mono text-white">{previewScore}</div>
            <div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${previewBadge}`}>
                {previewLevel}
              </span>
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-zinc-400">
            <div className="flex justify-between py-1 border-b border-zinc-800">
              <span>Severity Weight (40%):</span>
              <span className="text-white">{severity}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800">
              <span>Asset Weight (35%):</span>
              <span className="text-white">
                {ASSETS.find((a) => a.id === parseInt(assetId, 10))?.criticality}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800">
              <span>Impact Weight (25%):</span>
              <span className="text-white">{impactScore} pts</span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 leading-normal">
            Calculated risk score is stored in PostgreSQL, and description text is indexed into pgvector for similarity search.
          </div>
        </div>
      </div>
    </div>
  );
}
