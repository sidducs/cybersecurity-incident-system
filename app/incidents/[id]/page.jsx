'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, RefreshCw, User, Activity 
} from 'lucide-react';

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('investigations');

  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [findingText, setFindingText] = useState('');
  const [invLoading, setInvLoading] = useState(false);

  const [actionType, setActionType] = useState('Firewall Rule Drop');
  const [actionDesc, setActionDesc] = useState('');
  const [respLoading, setRespLoading] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignAnalystId, setAssignAnalystId] = useState('2');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMsg, setAssignMsg] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('soc_user');
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const fetchIncident = async () => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}`);
      if (!res.ok) throw new Error('Incident not found');
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-400 text-xs">
          <Activity className="w-4 h-4 animate-spin text-white" />
          <span>Loading incident details...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-3 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
        Error: {error || 'Incident not found'}
      </div>
    );
  }

  const { incident, investigations, responseActions, statusHistory } = data;

  let badgeClass = 'badge-medium';
  if (incident.severity === 'Critical') badgeClass = 'badge-critical';
  if (incident.severity === 'High') badgeClass = 'badge-high';
  if (incident.severity === 'Low') badgeClass = 'badge-low';

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <Link
          href="/incidents"
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incidents</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded px-2.5 py-1">
            <span className="text-[11px] text-zinc-400">Status:</span>
            <select
              value={newStatus}
              onChange={handleStatusChange}
              disabled={statusUpdating}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="New" className="bg-zinc-900 text-white">New</option>
              <option value="Investigating" className="bg-zinc-900 text-white">Investigating</option>
              <option value="Contained" className="bg-zinc-900 text-white">Contained</option>
              <option value="Resolved" className="bg-zinc-900 text-white">Resolved</option>
              <option value="False Positive" className="bg-zinc-900 text-white">False Positive</option>
            </select>
            {statusUpdating && <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />}
          </div>

          {/* Assign Button - Only visible to Administrator */}
          {currentUser?.roleName === 'Administrator' && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Assign Analyst</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="clean-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-zinc-400">#{incident.incident_id}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeClass}`}>
                {incident.severity}
              </span>
              <span className="text-[11px] text-zinc-300 bg-black px-2 py-0.5 rounded border border-zinc-800">
                {incident.classification}
              </span>
              <span className="text-[11px] text-zinc-300 bg-black px-2 py-0.5 rounded border border-zinc-800">
                {incident.status}
              </span>
            </div>

            <h1 className="text-lg font-bold text-white">{incident.title}</h1>
            <p className="text-xs text-zinc-300 leading-relaxed bg-black p-3 rounded border border-zinc-800">
              {incident.description}
            </p>
          </div>

          {/* Risk Score */}
          <div className="shrink-0 text-center p-3 rounded bg-black border border-zinc-800 min-w-[110px]">
            <div className="text-[10px] text-zinc-400 uppercase">Risk Score</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {incident.risk_score}
            </div>
            <div className="text-[10px] text-zinc-500">out of 100</div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px]">Asset</span>
            <span className="font-medium text-white">{incident.asset_name}</span>
            <span className="text-zinc-500 block text-[10px]">{incident.ip_address}</span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px]">Assigned Analyst</span>
            <span className="font-medium text-white">
              {incident.assigned_to_name || <span className="text-zinc-500 italic">Unassigned</span>}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px]">Reported By</span>
            <span className="font-medium text-white">{incident.reported_by_name}</span>
            <span className="text-zinc-500 block text-[10px]">
              {new Date(incident.reported_at).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block text-[10px]">Resolved At</span>
            <span className="font-medium text-white">
              {incident.resolved_at ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {new Date(incident.resolved_at).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-zinc-500">Open</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-3">
        <div className="flex border-b border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('investigations')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'investigations'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Investigations ({investigations.length})
          </button>

          <button
            onClick={() => setActiveTab('responses')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'responses'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Responses ({responseActions.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Status History ({statusHistory.length})
          </button>
        </div>

        {/* Tab 1: Investigations */}
        {activeTab === 'investigations' && (
          <div className="space-y-3">
            <form onSubmit={handleAddInvestigation} className="clean-card p-4 space-y-2.5">
              <label className="block text-xs font-medium text-zinc-300">
                Add Investigation Finding
              </label>
              <textarea
                required
                rows={2}
                value={findingText}
                onChange={(e) => setFindingText(e.target.value)}
                placeholder="Record forensic analysis details, payload behavior, network observations..."
                className="w-full px-3 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                disabled={invLoading}
                className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {invLoading ? 'Adding...' : 'Add Finding'}
              </button>
            </form>

            <div className="space-y-2">
              {investigations.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 clean-card">
                  No investigation notes recorded yet.
                </div>
              ) : (
                investigations.map((inv) => (
                  <div key={inv.investigation_id} className="clean-card p-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                      <span className="font-semibold text-white">{inv.analyst_name}</span>
                      <span>{new Date(inv.started_at).toLocaleString()}</span>
                    </div>
                    <p className="text-zinc-300">{inv.findings}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Response Actions */}
        {activeTab === 'responses' && (
          <div className="space-y-3">
            <form onSubmit={handleAddResponse} className="clean-card p-4 space-y-2.5">
              <label className="block text-xs font-medium text-zinc-300">
                Log Response / Mitigation Action
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-white"
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
                    placeholder="Describe containment or remediation steps..."
                    className="w-full px-3 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={respLoading}
                className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {respLoading ? 'Saving...' : 'Save Response'}
              </button>
            </form>

            <div className="space-y-2">
              {responseActions.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 clean-card">
                  No response actions recorded yet.
                </div>
              ) : (
                responseActions.map((resp) => (
                  <div key={resp.response_id} className="clean-card p-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">{resp.action_type}</span>
                      <span className="text-zinc-500">{new Date(resp.performed_at).toLocaleString()}</span>
                    </div>
                    <p className="text-zinc-300">{resp.description}</p>
                    <div className="text-[10px] text-zinc-400">
                      Status: {resp.action_status} · Performed by: {resp.performed_by_name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Status History */}
        {activeTab === 'history' && (
          <div className="clean-card p-4 space-y-3">
            <div className="text-xs text-zinc-400 pb-2 border-b border-zinc-800">
              Audit Trail (Automatically populated by database trigger trg_incident_status_change)
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="py-2 px-2.5">ID</th>
                    <th className="py-2 px-2.5">Transition</th>
                    <th className="py-2 px-2.5">Modified By</th>
                    <th className="py-2 px-2.5">Remarks</th>
                    <th className="py-2 px-2.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {statusHistory.map((h) => (
                    <tr key={h.history_id} className="hover:bg-zinc-800/30">
                      <td className="py-2 px-2.5 font-mono text-zinc-400">#{h.history_id}</td>
                      <td className="py-2 px-2.5">
                        <span className="text-zinc-400">{h.old_status}</span>
                        <span className="text-zinc-500 mx-1.5">→</span>
                        <span className="text-white font-medium">{h.new_status}</span>
                      </td>
                      <td className="py-2 px-2.5 text-zinc-300">{h.changed_by_name}</td>
                      <td className="py-2 px-2.5 text-zinc-400">{h.remarks}</td>
                      <td className="py-2 px-2.5 text-right text-zinc-500">
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

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="clean-card max-w-sm w-full p-5 space-y-3 shadow-2xl bg-zinc-950">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wide">
                Assign Incident (Stored Procedure)
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {assignMsg && (
              <div className="p-2 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
                {assignMsg}
              </div>
            )}

            <form onSubmit={handleAtomicAssign} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Select Analyst</label>
                <select
                  value={assignAnalystId}
                  onChange={(e) => setAssignAnalystId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-white"
                >
                  <option value="2">Alex Rivera (Security Analyst)</option>
                  <option value="3">David Chen (Security Analyst)</option>
                  <option value="4">Maya Lin (Security Analyst)</option>
                  <option value="5">Vikram Rao (Security Analyst)</option>
                  <option value="6">Elena Rostova (Security Analyst)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Assignment remarks..."
                  className="w-full px-3 py-1.5 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="text-[11px] text-zinc-400">
                Executed via PL/pgSQL procedure <strong className="text-white">sp_assign_incident_atomic</strong> with full ACID rollback.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold"
                >
                  {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
