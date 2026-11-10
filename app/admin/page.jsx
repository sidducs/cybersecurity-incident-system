'use client';

import { useState, useEffect } from 'react';
import { Users, GitFork, Shield, Clock, FileCode, CheckCircle2, Activity } from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHierarchy() {
      try {
        const res = await fetch('/api/admin/hierarchy');
        if (!res.ok) throw new Error('Failed to load organizational hierarchy');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHierarchy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs">
          <Activity className="w-5 h-5 animate-spin" />
          <span>EVALUATING RECURSIVE CTE ORGANIZATIONAL HIERARCHY...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300">
        Error: {error}
      </div>
    );
  }

  const { hierarchy, recentAuditLogs } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-400" />
          <span>SOC Administration & Escalation Hierarchy</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Demonstrating Recursive Common Table Expression (WITH RECURSIVE) for Multi-Level Personnel Reporting & System Auditing
        </p>
      </div>

      {/* Recursive CTE Hierarchy (Query Q14) */}
      <div className="cyber-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
              <GitFork className="w-4 h-4 text-cyan-400" />
              <span>SOC Escalation Tree (Query Q14: WITH RECURSIVE)</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Recursively computes organizational depth tier and traverses supervisor-to-analyst reporting chains
            </p>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            WITH RECURSIVE CTE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((tier) => {
            const members = hierarchy.filter((h) => h.tier_level === tier);
            let tierTitle = 'Tier 1: SOC Executive / Lead';
            if (tier === 2) tierTitle = 'Tier 2: Senior Triage Analysts';
            if (tier === 3) tierTitle = 'Tier 3: Incident Responders';

            return (
              <div key={tier} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 pb-2 border-b border-slate-800">
                  <span>{tierTitle}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                    Depth: {tier}
                  </span>
                </div>

                <div className="space-y-2">
                  {members.map((m) => (
                    <div
                      key={m.user_id}
                      className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-bold text-slate-100">{m.staff_member}</span>
                        <span className="text-[10px] text-slate-500">UID #{m.user_id}</span>
                      </div>
                      <div className="text-[10px] text-amber-400 font-semibold">{m.role_name}</div>
                      <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-900">
                        <span className="text-slate-600">Chain: </span>
                        <span className="text-cyan-300 font-sans">{m.reporting_escalation_chain}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable System Audit Logs Table */}
      <div className="cyber-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Immutable System Audit Trail (audit_logs)</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Comprehensive security log recording logins, incident creations, triage dispatching, and status changes
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            AUDIT_LOGS TABLE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="py-2.5 px-3">Audit ID</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Initiating User</th>
                <th className="py-2.5 px-3">Incident #</th>
                <th className="py-2.5 px-3">Event Description</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentAuditLogs.map((log) => (
                <tr key={log.audit_id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">#{log.audit_id}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-200 border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{log.user_name || 'System Daemon'}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {log.incident_id ? `#${log.incident_id}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-md truncate">
                    {log.description}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

