'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, AlertTriangle, User, Calendar, Server, Activity, 
  ArrowLeft, CheckCircle2, Clock, Plus, Flame, FileText, 
  Send, AlertCircle, RefreshCw, Layers
} from 'lucide-react';

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('investigations');

  // Form states for adding items
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Investigation form
  const [findingText, setFindingText] = useState('');
  const [invLoading, setInvLoading] = useState(false);

  // Response action form
  const [actionType, setActionType] = useState('Firewall Rule Drop');
  const [actionDesc, setActionDesc] = useState('');
  const [respLoading, setRespLoading] = useState(false);

  // Atomic assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignAnalystId, setAssignAnalystId] = useState('2');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMsg, setAssignMsg] = useState('');

  const fetchIncident = async () => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}`);
      if (!res.ok) throw new Error('Incident not found or database error');
      const json = await res.json();
      setData(json);
      setNewStatus(json.incident.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (incidentId) fetchIncident();
  }, [incidentId]);

  // Handle status update (fires database trigger)
  const handleStatusChange = async (e) => {
    const selected = e.target.value;
    setNewStatus(selected);
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selected }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchIncident();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle atomic assignment transaction
  const handleAtomicAssign = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    setAssignMsg('');
    try {
      const res = await fetch(`/api/incidents/${incidentId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyst_id: parseInt(assignAnalystId, 10),
          notes: assignNotes,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Assignment transaction failed');
      setShowAssignModal(false);
      setAssignNotes('');
      await fetchIncident();
    } catch (err) {
      setAssignMsg(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  // Add investigation finding
  const handleAddInvestigation = async (e) => {
    e.preventDefault();
    if (!findingText.trim()) return;
    setInvLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/investigations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings: findingText }),
      });
      if (!res.ok) throw new Error('Failed to record investigation');
      setFindingText('');
      await fetchIncident();
    } catch (err) {
      alert(err.message);
    } finally {
      setInvLoading(false);
    }
  };

  // Add response action
  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!actionDesc.trim()) return;
    setRespLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          description: actionDesc,
          action_status: 'Completed',
        }),
      });
      if (!res.ok) throw new Error('Failed to record response');
      setActionDesc('');
      await fetchIncident();
    } catch (err) {
      alert(err.message);
    } finally {
      setRespLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs">
          <Activity className="w-5 h-5 animate-spin" />
          <span>RECONSTRUCTING FORENSIC INCIDENT RECORD...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300">
        Error: {error || 'Incident not found'}
      </div>
    );
  }

  const { incident, investigations, responseActions, statusHistory, riskAssessments } = data;

  let badgeClass = 'cyber-badge-medium';
  if (incident.severity === 'Critical') badgeClass = 'cyber-badge-critical';
  if (incident.severity === 'High') badgeClass = 'cyber-badge-high';
  if (incident.severity === 'Low') badgeClass = 'cyber-badge-low';

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <Link
          href="/incidents"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incident Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Status Dropdown (fires trigger) */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Status:</span>
            <select
              value={newStatus}
              onChange={handleStatusChange}
              disabled={statusUpdating}
              className="bg-transparent text-xs font-mono font-bold text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="New" className="bg-slate-900 text-slate-200">New</option>
              <option value="Investigating" className="bg-slate-900 text-slate-200">Investigating</option>
              <option value="Contained" className="bg-slate-900 text-slate-200">Contained</option>
              <option value="Resolved" className="bg-slate-900 text-slate-200">Resolved</option>
              <option value="False Positive" className="bg-slate-900 text-slate-200">False Positive</option>
            </select>
            {statusUpdating && <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />}
          </div>

          {/* Atomic Assignment Button */}
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span>Atomic Assignment</span>
          </button>
        </div>
      </div>

      {/* Main Incident Card */}
      <div className="cyber-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                INCIDENT #{incident.incident_id}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${badgeClass}`}>
                {incident.severity} SEVERITY
              </span>
              <span className="text-xs font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {incident.classification}
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                {incident.status}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-100">{incident.title}</h1>
            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {incident.description}
            </p>
          </div>

          {/* Risk Score Pill */}
          <div className="shrink-0 text-center p-4 rounded-xl bg-slate-900 border border-slate-800 min-w-[130px]">
            <div className="text-[10px] font-mono uppercase text-slate-400">Risk Score</div>
            <div className="text-3xl font-bold font-mono text-red-400 mt-0.5">
              {incident.risk_score}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">out of 100</div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Target IT Asset</span>
            <span className="font-semibold text-slate-200">{incident.asset_name}</span>
            <span className="text-slate-500 block text-[10px]">
              {incident.asset_criticality} · {incident.ip_address}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Assigned Analyst</span>
            <span className="font-semibold text-slate-200">
              {incident.assigned_to_name || <span className="text-amber-400 italic">Unassigned</span>}
            </span>
            <span className="text-slate-500 block text-[10px]">{incident.assignee_email || '—'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Reported By</span>
            <span className="font-semibold text-slate-200">{incident.reported_by_name}</span>
            <span className="text-slate-500 block text-[10px]">
              {new Date(incident.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Resolution Timestamp</span>
            <span className="font-semibold text-slate-200">
              {incident.resolved_at ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {new Date(incident.resolved_at).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-amber-400/80">Pending Triage</span>
              )}
            </span>
            <span className="text-slate-500 block text-[10px]">Auto-managed by trigger</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('investigations')}
            className={`py-2 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'investigations'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Forensic Findings ({investigations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('responses')}
            className={`py-2 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'responses'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Containment Actions ({responseActions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Trigger Audit History ({statusHistory.length})</span>
          </button>
        </div>

        {/* Tab 1: Forensic Investigations */}
        {activeTab === 'investigations' && (
          <div className="space-y-4">
            <form onSubmit={handleAddInvestigation} className="cyber-card p-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 font-mono">
                Log New Forensic Finding
              </label>
              <textarea
                required
                rows={2}
                value={findingText}
                onChange={(e) => setFindingText(e.target.value)}
                placeholder="Document sandbox detonated payload, memory analysis, reverse shell artifacts, or Wireshark PCAP analysis..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                disabled={invLoading}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{invLoading ? 'Logging...' : 'Add Investigation Entry'}</span>
              </button>
            </form>

            <div className="space-y-3">
              {investigations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono cyber-card">
                  No forensic investigations logged for this incident yet.
                </div>
              ) : (
                investigations.map((inv) => (
                  <div key={inv.investigation_id} className="cyber-card p-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span className="text-cyan-400 font-semibold">{inv.analyst_name}</span>
                      <span>{new Date(inv.started_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200 font-mono bg-slate-900/50 p-2.5 rounded border border-slate-800/80">
                      {inv.findings}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Containment Actions */}
        {activeTab === 'responses' && (
          <div className="space-y-4">
            <form onSubmit={handleAddResponse} className="cyber-card p-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 font-mono">
                Dispatch Containment / Mitigation Response
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Firewall Rule Drop">Firewall Rule Drop</option>
                    <option value="Account Password Revocation">Account Password Revocation</option>
                    <option value="Host Network Quarantine">Host Network Quarantine</option>
                    <option value="Process Termination">Process Termination</option>
                    <option value="Snapshot Recovery">Snapshot Recovery</option>
                    <option value="WAF Rule Deployment">WAF Rule Deployment</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={actionDesc}
                    onChange={(e) => setActionDesc(e.target.value)}
                    placeholder="Describe technical mitigation command or remediation steps taken..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={respLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{respLoading ? 'Dispatching...' : 'Execute Response Action'}</span>
              </button>
            </form>

            <div className="space-y-3">
              {responseActions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono cyber-card">
                  No active containment actions logged yet.
                </div>
              ) : (
                responseActions.map((resp) => (
                  <div key={resp.response_id} className="cyber-card p-4 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-emerald-400 font-bold">{resp.action_type}</span>
                      <span className="text-slate-500">{new Date(resp.performed_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 font-mono bg-slate-900/50 p-2.5 rounded border border-slate-800/80">
                      {resp.description}
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                      <span>Status: <strong className="text-emerald-400">{resp.action_status}</strong></span>
                      <span>·</span>
                      <span>Executed by: {resp.performed_by_name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Trigger Status History */}
        {activeTab === 'history' && (
          <div className="cyber-card p-5 space-y-4">
            <div className="text-xs text-slate-400 font-mono pb-2 border-b border-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Immutable Audit Trail (Automated Trigger: trg_incident_status_change)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 px-3">History ID</th>
                    <th className="py-2 px-3">Transition</th>
                    <th className="py-2 px-3">Modifier</th>
                    <th className="py-2 px-3">Remarks / System Notice</th>
                    <th className="py-2 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {statusHistory.map((h) => (
                    <tr key={h.history_id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-cyan-400">#{h.history_id}</td>
                      <td className="py-2 px-3">
                        <span className="text-slate-400">{h.old_status}</span>
                        <span className="text-cyan-400 mx-1.5">→</span>
                        <span className="text-slate-200 font-bold">{h.new_status}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{h.changed_by_name}</td>
                      <td className="py-2 px-3 text-slate-400">{h.remarks}</td>
                      <td className="py-2 px-3 text-slate-500">
                        {new Date(h.changed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Atomic Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-card max-w-md w-full p-6 shadow-2xl space-y-4 border-cyan-500/40">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <span>ACID Atomic Assignment (sp_assign_incident_atomic)</span>
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-500 hover:text-slate-300 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {assignMsg && (
              <div className="p-2.5 rounded bg-red-950/50 border border-red-500/50 text-red-300 text-xs">
                {assignMsg}
              </div>
            )}

            <form onSubmit={handleAtomicAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
                  Select Certified Security Analyst
                </label>
                <select
                  value={assignAnalystId}
                  onChange={(e) => setAssignAnalystId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="2">Alex Rivera (Security Analyst · Tier 2)</option>
                  <option value="3">David Chen (Security Analyst · Tier 2)</option>
                  <option value="4">Maya Lin (Security Analyst · Tier 1)</option>
                  <option value="5">Vikram Rao (Security Analyst · Tier 1)</option>
                  <option value="6">Elena Rostova (Security Analyst · Tier 1)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
                  Triage Notes / Dispatch Directive
                </label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Escalated for immediate forensic memory acquisition..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
                Calls PL/pgSQL stored procedure <strong className="text-white">sp_assign_incident_atomic</strong> with full ACID rollback protection.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono"
                >
                  {assignLoading ? 'Committing...' : 'Commit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

