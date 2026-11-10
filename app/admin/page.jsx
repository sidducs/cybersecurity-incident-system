'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Activity className="w-4 h-4 animate-spin text-blue-500" />
          <span>Loading administrative data...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-3 rounded bg-red-950/50 border border-red-800 text-red-200 text-xs">
        Error: {error}
      </div>
    );
  }

  const { hierarchy, recentAuditLogs } = data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100">Administration & Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Personnel escalation hierarchy (Recursive CTE) and immutable system audit logs
        </p>
      </div>

      {/* Recursive CTE Hierarchy (Query Q14) */}
      <div className="clean-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700">
          <div>
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
              Organizational Reporting Hierarchy (Query Q14: WITH RECURSIVE)
            </h2>
            <div className="text-[11px] text-slate-400">
              Evaluates reporting chains and depth tiers from Administrator to Analysts
            </div>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            RECURSIVE CTE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((tier) => {
            const members = hierarchy.filter((h) => h.tier_level === tier);
            let tierTitle = 'Tier 1: Management / Lead';
            if (tier === 2) tierTitle = 'Tier 2: Senior Analysts';
            if (tier === 3) tierTitle = 'Tier 3: Incident Responders';

            return (
              <div key={tier} className="p-3 rounded bg-slate-900/60 border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-300 pb-1.5 border-b border-slate-800">
                  <span>{tierTitle}</span>
                  <span className="text-[10px] text-slate-500">Tier {tier}</span>
                </div>

                <div className="space-y-1.5">
                  {members.map((m) => (
                    <div
                      key={m.user_id}
                      className="p-2.5 rounded bg-slate-800/80 border border-slate-700/60 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-100">{m.staff_member}</span>
                        <span className="text-[10px] text-slate-500">ID #{m.user_id}</span>
                      </div>
                      <div className="text-[10px] text-blue-400 font-medium">{m.role_name}</div>
                      <div className="text-[10px] text-slate-400 truncate pt-1">
                        Chain: <span className="text-slate-300">{m.reporting_escalation_chain}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Audit Logs Table */}
      <div className="clean-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700">
          <div>
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
              System Audit Trail (audit_logs)
            </h2>
            <div className="text-[11px] text-slate-400">
              Immutable chronological record of logins, incident creations, and triage updates
            </div>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            AUDIT_LOGS TABLE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="py-2 px-2.5">ID</th>
                <th className="py-2 px-2.5">Action</th>
                <th className="py-2 px-2.5">User</th>
                <th className="py-2 px-2.5">Incident</th>
                <th className="py-2 px-2.5">Description</th>
                <th className="py-2 px-2.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentAuditLogs.map((log) => (
                <tr key={log.audit_id} className="hover:bg-slate-700/20">
                  <td className="py-2 px-2.5 font-mono text-slate-400">#{log.audit_id}</td>
                  <td className="py-2 px-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-200 font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-slate-300">{log.user_name || 'System'}</td>
                  <td className="py-2 px-2.5 text-slate-400 font-mono">
                    {log.incident_id ? `#${log.incident_id}` : '—'}
                  </td>
                  <td className="py-2 px-2.5 text-slate-300 max-w-md truncate">
                    {log.description}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-500">
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
